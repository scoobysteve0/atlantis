# Builder Heartbeat

## Timestamp
2026-03-15T03:12:44Z

## Changed files
src/renderer/js/ui/dashboard-ui.js

## Diff
diff --git a/src/renderer/js/ui/dashboard-ui.js b/src/renderer/js/ui/dashboard-ui.js
index d4db37c..31e87f0 100644
--- a/src/renderer/js/ui/dashboard-ui.js
+++ b/src/renderer/js/ui/dashboard-ui.js
@@ -38,6 +38,34 @@ function renderAgentPills(agents = []) {
   return agents.map((agent) => `<span class="agent-pill">${agent}</span>`).join("");
 }
 
+function renderExecutionState(project) {
+  const orchestration = project.orchestration;
+  if (!orchestration?.phase) return "";
+
+  const lastProof = orchestration.phase.lastProofEvent || "Unknown";
+  const nextTrigger = orchestration.phase.nextTrigger || "Unknown";
+  const owner = orchestration.phase.owner || "Unknown";
+
+  return `
+    <div class="execution-state-card">
+      <div class="execution-state-head">
+        <span>Execution State</span>
+        <strong>${owner}</strong>
+      </div>
+      <div class="execution-state-grid">
+        <div>
+          <span>Last Proof</span>
+          <strong>${lastProof}</strong>
+        </div>
+        <div>
+          <span>Next Trigger</span>
+          <strong>${nextTrigger}</strong>
+        </div>
+      </div>
+    </div>
+  `;
+}
+
 function escapeHtml(value = "") {
   return String(value)
     .replaceAll("&", "&amp;")
@@ -319,7 +347,48 @@ function renderBuildTaskSections(project, activeScheme) {
   `;
 }
 
-function renderProofSections(project) {
+function renderNotificationProofEntries(log = []) {
+  const entries = (log || [])
+    .filter((entry) => entry?.meta?.kind === "notification-test" || entry?.meta?.kind === "scheme-movement")
+    .slice(0, 8);
+
+  return entries.map((entry) => {
+    const isSchemeMovement = entry?.meta?.kind === "scheme-movement";
+    const ok = isSchemeMovement ? entry.meta?.ok !== false : entry.meta?.ok;
+    const title = isSchemeMovement
+      ? `Scheme movement: ${entry.meta?.fromScheme || "Unknown"} → ${entry.meta?.toScheme || "Unknown"}`
+      : entry.meta?.ok
+        ? "Notification delivered"
+        : "Notification failed";
+    const status = isSchemeMovement ? (ok ? "emitted" : "missed") : (entry.meta?.ok ? "ok" : "failed");
+    const copy = isSchemeMovement
+      ? entry.message || "Scheme movement proof recorded."
+      : entry.message || "Notification test recorded.";
+
+    return `
+      <article class="proof-event-card">
+        <div class="workflow-step-top">
+          <div>
+            <h5>${title}</h5>
+            <span class="workflow-step-kicker">${new Date(entry.at || Date.now()).toLocaleString()}</span>
+          </div>
+          <span class="workflow-step-status">${status}</span>
+        </div>
+        <p class="workflow-step-copy">${copy}</p>
+        <div class="tag-row top-gap">
+          <span class="meta-tag ${ok ? "team-tag" : "restriction-tag"}">kind: ${entry.meta?.kind || "notification-test"}</span>
+          ${entry.meta?.title ? `<span class="meta-tag">title: ${entry.meta.title}</span>` : ""}
+          ${isSchemeMovement && entry.meta?.owner ? `<span class="meta-tag">owner: ${entry.meta.owner}</span>` : ""}
+          ${isSchemeMovement && entry.meta?.fromScheme ? `<span class="meta-tag">from: ${entry.meta.fromScheme}</span>` : ""}
+          ${isSchemeMovement && entry.meta?.toScheme ? `<span class="meta-tag">to: ${entry.meta.toScheme}</span>` : ""}
+          ${entry.meta?.reason ? `<span class="meta-tag restriction-tag">reason: ${entry.meta.reason}</span>` : ""}
+        </div>
+      </article>
+    `;
+  }).join("") || '<div class="empty-open-project compact-empty"><span>No notification proof yet.</span></div>';
+}
+
+function renderProofSections(project, state = {}) {
   const proof = project.proof || [];
   const orchestration = project.orchestration || {};
   const eventLog = orchestration.eventLog || [];
@@ -379,6 +448,14 @@ function renderProofSections(project) {
               </article>
             `).join("") || '<div class="empty-open-project compact-empty"><span>No runtime proof events yet.</span></div>'}
           </div>
+
+          <div class="section-head-inline compact-head top-gap">
+            <h3 class="section-title">Notification Proof</h3>
+            <span class="section-detail">Recent in-app notification test outcomes</span>
+          </div>
+          <div class="proof-event-list">
+            ${renderNotificationProofEntries(state.log || [])}
+          </div>
         </section>
       </div>
     </div>
@@ -493,7 +570,7 @@ function renderProjectOpenView(project, state) {
               <div><span>Notify</span><strong>${hydratedProject.automationRules?.notifications?.channel || "Not set"}</strong></div>
             </div>
             ${renderWorkflowSections(hydratedProject)}
-          ` : state.selectedProjectTab === "proof" ? `${renderExecutionStateBar(hydratedProject, activeScheme, "Proof")}${renderProofSections(hydratedProject)}` : renderBuildTaskSections(hydratedProject, activeScheme)}
+          ` : state.selectedProjectTab === "proof" ? `${renderExecutionStateBar(hydratedProject, activeScheme, "Proof")}${renderProofSections(hydratedProject, state)}` : renderBuildTaskSections(hydratedProject, activeScheme)}
         </section>
       </div>
     </div>
@@ -571,6 +648,7 @@ export function mountDashboard(store) {
               <span class="project-agents-label">Agents involved</span>
               <div class="agent-pill-row">${renderAgentPills(project.agents || [])}</div>
             </div>
+            ${renderExecutionState(project)}
           </article>
         `;
       }).join("");
