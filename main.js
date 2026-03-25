import { createStore } from "./core/store.js";
import { createDataService } from "./core/data-service.js";
import { createOrchestrationService } from "./core/orchestration-service.js";
import { mountTabs } from "./ui/tabs.js";
import { mountDashboard } from "./ui/dashboard-ui.js";
import { mountMission } from "./ui/mission-ui.js";

const POLL_INTERVAL_MS = 4000;
const NOTIFY_PREFS_KEY = "atlantis.notificationPrefs";
const FAILURE_ESCALATION_THRESHOLD = 3;
const FALLBACK_ESCALATION_MS = 60_000;

function bootstrap() {
  const store = createStore();
  const orchestrationService = createOrchestrationService({ pollIntervalMs: POLL_INTERVAL_MS });
  orchestrationService.ensureCurrentKernel?.();
  const dataService = createDataService({ orchestrationService });
  let lastHealthState = "boot";
  let consecutiveFailures = 0;
  let fallbackStartedAt = null;
  let lastEscalationAt = 0;

  store.loadPersisted();

  mountTabs(store);
  mountDashboard(store);
  mountMission(store);

  const settingsButton = document.getElementById("settings-button");
  const modal = document.getElementById("app-modal");
  const modalMessage = document.getElementById("app-modal-message");
  const modalClose = document.getElementById("app-modal-close");
  const modalSave = document.getElementById("app-modal-save");
  const modalTestNotification = document.getElementById("app-modal-test-notification");
  const notificationTestResult = document.getElementById("notification-test-result");
  const openClawBaseInput = document.getElementById("openclaw-base-input");
  const openClawTokenInput = document.getElementById("openclaw-token-input");
  const notifyLiveToggle = document.getElementById("notify-live-toggle");
  const notifySettingsToggle = document.getElementById("notify-settings-toggle");
  const notifyEscalationToggle = document.getElementById("notify-escalation-toggle");

  const getNotificationPrefs = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(NOTIFY_PREFS_KEY) || "{}");
      return {
        live: parsed.live !== false,
        settings: parsed.settings !== false,
        escalation: parsed.escalation !== false
      };
    } catch {
      return { live: true, settings: true, escalation: true };
    }
  };

  const setNotificationPrefs = (prefs) => {
    localStorage.setItem(NOTIFY_PREFS_KEY, JSON.stringify(prefs));
  };

  const maybeNotify = async (kind, title, body) => {
    const prefs = getNotificationPrefs();
    if (!prefs[kind]) return { ok: false, reason: "disabled" };
    return (await window.electronAPI?.sendNotification?.(title, body)) || { ok: false, reason: "unavailable" };
  };

  const formatThreadNotificationBody = (event) => {
    if (event.type === "SCHEME_MOVEMENT") {
      return [
        `SCHEME_MOVEMENT`,
        `EVENT_ID: ${event.id || "none"}`,
        `PHASE: ${event.phase}`,
        `STEP: ${event.step}`,
        `STEP_OWNER: ${event.stepOwner || event.owner}`,
        `SCHEME_OWNER: ${event.schemeOwner || event.owner}`,
        `MODEL: ${event.ownerModel}`,
        `OWNER: ${event.owner} (${event.ownerModel})`,
        `FROM_SCHEME: ${event.fromScheme}`,
        `TO_SCHEME: ${event.toScheme}`,
        `COMMAND_EXECUTED: ${event.commandExecuted}`,
        `FILES_CHANGED: ${(event.filesChanged || []).join(", ") || "none"}`,
        `ARTIFACT_PATH: ${event.artifactPath || "none"}`,
        `VALIDATION_RESULT: ${event.validationResult}`,
        `TIMESTAMP: ${event.timestamp}`
      ].join("\n");
    }

    return [
      event.type || "BLOCKER_UPDATE",
      `EVENT_ID: ${event.id || "none"}`,
      `PHASE: ${event.phase}`,
      `STEP: ${event.step}`,
      `OWNER: ${event.owner} (${event.ownerModel})`,
      `SCHEME: ${event.scheme}`,
      `STATUS: ${event.status}`,
      `DETAIL: ${event.detail || "none"}`,
      `ALERT: ${event.alert || "none"}`,
      `BLOCKER_CODE: ${event.blockerCode || "none"}`,
      `SUPERVISOR: ${event.supervisorOwner || "SUPERVISOR"} (${event.supervisorModel || "unknown"})`,
      `REQUIRED_ACTION: ${event.requiredAction || "none"}`,
      `MISSING_PROOF: ${event.missingProof || "none"}`,
      `OWNER_TRIGGER: ${event.ownerTrigger || "none"}`,
      `RECOVERY_PLAN: ${event.recoveryPlan || "none"}`,
      `COMMAND_EXECUTED: ${event.commandExecuted}`,
      `FILES_CHANGED: ${(event.filesChanged || []).join(", ") || "none"}`,
      `ARTIFACT_PATH: ${event.artifactPath || "none"}`,
      `VALIDATION_RESULT: ${event.validationResult}`,
      `TIMESTAMP: ${event.timestamp}`
    ].join("\n");
  };

  const emitSchemeMovementNotifications = async () => {
    const pending = orchestrationService.drainNotifications?.() || [];
    for (const movement of pending) {
      const body = formatThreadNotificationBody(movement);
      const title = movement.type || "SCHEME_MOVEMENT";
      const localKind = movement.type === "SCHEME_MOVEMENT" ? "live" : (movement.type === "SELF_RESOLUTION" ? "live" : "escalation");
      const localResult = await maybeNotify(localKind, title, body);
      const discordResult = await window.electronAPI?.sendDiscordThreadNotification?.(body);
      const deliveryFailed = !discordResult?.ok;
      if (deliveryFailed) {
        orchestrationService.requeueNotification?.(movement, discordResult?.reason || "discord-thread-send-failed");
      }
      store.log(`${title} ${movement.fromScheme ? `${movement.fromScheme} → ${movement.toScheme}` : movement.detail || movement.status || "event"}`, {
        kind: movement.type === "SCHEME_MOVEMENT" ? "scheme-movement" : "watchdog-status",
        ok: Boolean(localResult?.ok),
        discordOk: Boolean(discordResult?.ok),
        deliveryFailed,
        notificationId: movement.id || null,
        phase: movement.phase,
        step: movement.step,
        owner: movement.owner,
        stepOwner: movement.stepOwner || movement.owner,
        schemeOwner: movement.schemeOwner || movement.owner,
        ownerModel: movement.ownerModel,
        fromScheme: movement.fromScheme || null,
        toScheme: movement.toScheme || null,
        scheme: movement.scheme || movement.toScheme || null,
        status: movement.status || null,
        detail: movement.detail || null,
        alert: movement.alert || null,
        blockerCode: movement.blockerCode || null,
        commandExecuted: movement.commandExecuted,
        filesChanged: movement.filesChanged,
        artifactPath: movement.artifactPath,
        validationResult: movement.validationResult,
        timestamp: movement.timestamp,
        reason: localResult?.reason || null,
        discordReason: discordResult?.reason || null
      });
    }
  };

  const setNotificationTestResult = (message = "", ok = false) => {
    if (!notificationTestResult) return;
    notificationTestResult.textContent = message;
    notificationTestResult.classList.toggle("is-hidden", !message);
    notificationTestResult.classList.toggle("is-live", Boolean(message && ok));
    notificationTestResult.classList.toggle("is-fallback", Boolean(message && !ok));
  };

  const closeModal = () => {
    modal.classList.add("is-hidden");
  };

  const notifyHealthChange = (source, warning) => {
    const nextHealthState = source === "openclaw-live" ? "live" : warning ? "fallback" : "idle";
    if (nextHealthState === lastHealthState) {
      return;
    }

    lastHealthState = nextHealthState;

    if (nextHealthState === "live") {
      fallbackStartedAt = null;
      lastEscalationAt = 0;
      maybeNotify("live", "Atlantis live feed connected", "Live OpenClaw/Anchor sync is active.");
    } else if (nextHealthState === "fallback") {
      fallbackStartedAt = fallbackStartedAt || Date.now();
      maybeNotify("live", "Atlantis fallback mode", warning || "Live feed unavailable. Using fallback data.");
    }
  };

  const maybeEscalate = (reason, detail) => {
    const now = Date.now();
    if (now - lastEscalationAt < FALLBACK_ESCALATION_MS) {
      return;
    }
    lastEscalationAt = now;
    maybeNotify("escalation", `Atlantis escalation: ${reason}`, detail);
  };

  const checkForStall = (source, warning) => {
    if (source === "openclaw-live") {
      consecutiveFailures = 0;
      fallbackStartedAt = null;
      return;
    }

    if (warning) {
      fallbackStartedAt = fallbackStartedAt || Date.now();
      const fallbackAge = Date.now() - fallbackStartedAt;
      if (fallbackAge >= FALLBACK_ESCALATION_MS) {
        maybeEscalate(
          "live sync stalled",
          `Atlantis has been running in fallback mode for ${Math.round(fallbackAge / 1000)}s.`
        );
      }
    }
  };

  const readConfiguredBase = async () => {
    const runtimeBase = window.__ATLANTIS_OPENCLAW_BASE__ || localStorage.getItem("atlantis.openclawBase") || "";
    if (runtimeBase) return runtimeBase;

    try {
      return (await window.electronAPI?.getOpenClawBase?.()) || "";
    } catch {
      return "";
    }
  };

  const refresh = async () => {
    try {
      orchestrationService.ensureCurrentKernel?.();
      const { payload, source, warning } = await dataService.load();
      consecutiveFailures = 0;
      orchestrationService.syncFromRefresh({ ok: true, source, warning });
      const supervisorState = orchestrationService.runSupervisorTick();
      store.setData(payload, { source, warning, orchestration: supervisorState });
      store.log(`Supervisor tick: ${supervisorState.phase.lastProofEvent}`);
      if (["ESCALATED", "HARD_STOP"].includes(supervisorState.heartbeat?.status)) {
        store.log(`Heartbeat watchdog ${supervisorState.heartbeat.status}: strike ${supervisorState.heartbeat.strike} · owner ${supervisorState.heartbeat.activeOwner} · scheme ${supervisorState.heartbeat.activeScheme}`, {
          kind: "heartbeat-watchdog",
          owner: supervisorState.heartbeat.activeOwner,
          scheme: supervisorState.heartbeat.activeScheme,
          strike: supervisorState.heartbeat.strike,
          watchdogModel: supervisorState.heartbeat.watchdogModel,
          status: supervisorState.heartbeat.status
        });
      }
      await emitSchemeMovementNotifications();
      notifyHealthChange(source, warning);
      checkForStall(source, warning);
      return { ok: true, source, warning, supervisorState };
    } catch (error) {
      consecutiveFailures += 1;
      orchestrationService.syncFromRefresh({ ok: false, error });
      const supervisorState = orchestrationService.runSupervisorTick();
      store.log(`Live data refresh failed: ${error.message}`);
      maybeNotify("settings", "Atlantis refresh failed", error.message);
      if (consecutiveFailures >= FAILURE_ESCALATION_THRESHOLD) {
        maybeEscalate(
          "repeated refresh failures",
          `Atlantis has failed ${consecutiveFailures} refreshes in a row. Last error: ${error.message}`
        );
      }
      store.setData({
        agents: store.getState().agents,
        projects: store.getState().projects,
        ideas: store.getState().ideas,
        onHold: store.getState().onHold,
        iterations: store.getState().iterations,
        trading: store.getState().trading
      }, { source: "cached", warning: error.message, orchestration: supervisorState });
      return { ok: false, error, supervisorState };
    }
  };

  settingsButton?.addEventListener("click", async () => {
    const configuredBase = await readConfiguredBase();
    const configuredToken = localStorage.getItem("atlantis.openclawToken") || "";
    const prefs = getNotificationPrefs();
    openClawBaseInput.value = configuredBase;
    openClawTokenInput.value = configuredToken;
    notifyLiveToggle.checked = prefs.live;
    notifySettingsToggle.checked = prefs.settings;
    notifyEscalationToggle.checked = prefs.escalation;
    modalMessage.textContent = configuredBase
      ? "Loaded saved live feed target. Save to refresh Atlantis against it now."
      : "No live feed base configured. Enter one to test live Atlantis sync.";
    setNotificationTestResult("");
    modal.classList.remove("is-hidden", "closing");
    openClawBaseInput.focus();
    openClawBaseInput.select();
  });

  modalTestNotification?.addEventListener("click", async () => {
    modalTestNotification.disabled = true;
    modalMessage.textContent = "Sending test notification…";

    try {
      const result = await window.electronAPI?.sendNotification?.(
        "Atlantis test notification",
        "If you can see this, local Atlantis notifications are working."
      );

      if (result?.ok) {
        modalMessage.textContent = "Test notification sent. Check macOS Notification Center if no banner appeared.";
        setNotificationTestResult(`Notification delivery acknowledged by Electron at ${new Date().toLocaleTimeString()}.`, true);
        store.log("Atlantis test notification sent.", {
          kind: "notification-test",
          ok: true,
          title: "Atlantis test notification"
        });
      } else {
        modalMessage.textContent = `Test notification failed: ${result?.reason || "unknown"}`;
        setNotificationTestResult(`Notification delivery failed: ${result?.reason || "unknown"}`, false);
        store.log(`Atlantis test notification failed: ${result?.reason || "unknown"}`, {
          kind: "notification-test",
          ok: false,
          reason: result?.reason || "unknown"
        });
      }
    } catch (error) {
      modalMessage.textContent = `Test notification failed: ${error.message}`;
      setNotificationTestResult(`Notification delivery failed: ${error.message}`, false);
      store.log(`Atlantis test notification failed: ${error.message}`, {
        kind: "notification-test",
        ok: false,
        reason: error.message
      });
    } finally {
      modalTestNotification.disabled = false;
    }
  });

  modalSave?.addEventListener("click", async () => {
    const nextBase = openClawBaseInput.value.trim().replace(/\/$/, "");
    const nextToken = openClawTokenInput.value.trim();
    const prefs = {
      live: Boolean(notifyLiveToggle.checked),
      settings: Boolean(notifySettingsToggle.checked),
      escalation: Boolean(notifyEscalationToggle.checked)
    };

    modalSave.disabled = true;
    modalMessage.textContent = "Saving live feed target and refreshing…";

    try {
      setNotificationPrefs(prefs);

      if (window.electronAPI?.setOpenClawBase) {
        await window.electronAPI.setOpenClawBase(nextBase);
      }

      if (nextBase) {
        localStorage.setItem("atlantis.openclawBase", nextBase);
      } else {
        localStorage.removeItem("atlantis.openclawBase");
      }

      if (nextToken) {
        localStorage.setItem("atlantis.openclawToken", nextToken);
      } else {
        localStorage.removeItem("atlantis.openclawToken");
      }

      const result = await refresh();
      modalMessage.textContent = result.ok
        ? `Saved. Data source: ${result.source}${result.warning ? ` · ${result.warning}` : ""}`
        : `Saved, but refresh failed: ${result.error.message}`;
      store.log(nextBase ? `OpenClaw base updated: ${nextBase}` : "OpenClaw base cleared; fallback mode active.");
      maybeNotify(
        "settings",
        "Atlantis settings updated",
        nextBase ? `Live base saved: ${nextBase}` : "Live base cleared. Atlantis will use fallback data until a live target is restored."
      );
    } catch (error) {
      modalMessage.textContent = `Save failed: ${error.message}`;
      store.log(`Failed to persist OpenClaw base: ${error.message}`);
      maybeNotify("settings", "Atlantis settings save failed", error.message);
    } finally {
      modalSave.disabled = false;
    }
  });

  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  openClawBaseInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      modalSave?.click();
    }
  });

  refresh();
  setInterval(refresh, POLL_INTERVAL_MS);

  store.setView("dashboard");
}

document.addEventListener("DOMContentLoaded", bootstrap);
