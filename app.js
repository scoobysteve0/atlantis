const state = {
  doneAt: null,
};

const els = {
  iterationLabel: document.getElementById('iterationLabel'),
  labelStatus: document.getElementById('labelStatus'),
  checks: Array.from(document.querySelectorAll('input[type="checkbox"][data-check]')),
  proofLinks: document.getElementById('proofLinks'),
  summary: document.getElementById('summary'),
  markDoneBtn: document.getElementById('markDoneBtn'),
  gateStatus: document.getElementById('gateStatus'),
  broadcastOutput: document.getElementById('broadcastOutput'),
  copyBtn: document.getElementById('copyBtn'),
};

/**
 * Naming guardrail for iteration labels.
 * Accepts only: v<major>.<minor>, where major/minor are integers.
 */
function validateIterationLabel(label) {
  const value = String(label || '').trim();
  const valid = /^v\d+\.\d+$/.test(value);

  return {
    valid,
    normalized: value,
    message: valid
      ? 'Label valid.'
      : 'Invalid label. Use format v<major>.<minor> (example: v1.4).',
  };
}

function checklistComplete() {
  return els.checks.every((check) => check.checked);
}

function proofPresent() {
  return els.proofLinks.value.trim().length > 0;
}

function summaryPresent() {
  return els.summary.value.trim().length > 0;
}

function evaluateGate() {
  const labelCheck = validateIterationLabel(els.iterationLabel.value);
  const ready = labelCheck.valid && checklistComplete() && proofPresent() && summaryPresent();

  els.labelStatus.textContent = labelCheck.message;
  els.labelStatus.className = `status ${labelCheck.valid ? 'ok' : 'bad'}`;

  els.markDoneBtn.disabled = !ready;
  els.gateStatus.textContent = ready
    ? 'Gate clear: milestone can be marked done.'
    : 'Gate blocked: validate naming, complete checklist, and add proof + summary.';
  els.gateStatus.className = `status ${ready ? 'ok' : 'bad'}`;

  return { ready, labelCheck };
}

function collectProofList() {
  return els.proofLinks.value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function generateDiscordBroadcast() {
  const { normalized } = validateIterationLabel(els.iterationLabel.value);
  const summary = els.summary.value.trim();
  const proof = collectProofList();
  const doneAt = state.doneAt || new Date();
  const dateLabel = doneAt.toLocaleString();

  const proofBlock = proof.length
    ? proof.map((url) => `- ${url}`).join('\n')
    : '- (none provided)';

  return [
    `🚢 **Atlantis Milestone ${normalized} — Completed**`,
    '',
    `**Summary**`,
    `${summary}`,
    '',
    `**Completion Checklist**`,
    '- ✅ Tests passed',
    '- ✅ Docs updated',
    '- ✅ Review approved',
    '',
    '**Proof / Links**',
    proofBlock,
    '',
    `**Completed At**: ${dateLabel}`,
  ].join('\n');
}

function onMarkDone() {
  const gate = evaluateGate();
  if (!gate.ready) return;

  state.doneAt = new Date();
  const broadcast = generateDiscordBroadcast();

  els.broadcastOutput.value = broadcast;
  els.copyBtn.disabled = false;
  els.gateStatus.textContent = 'Milestone marked done. Broadcast generated.';
  els.gateStatus.className = 'status ok';
}

async function onCopy() {
  if (!els.broadcastOutput.value.trim()) return;
  try {
    await navigator.clipboard.writeText(els.broadcastOutput.value);
    els.copyBtn.textContent = 'Copied!';
    setTimeout(() => { els.copyBtn.textContent = 'Copy Broadcast'; }, 1200);
  } catch (err) {
    els.copyBtn.textContent = 'Copy failed';
    setTimeout(() => { els.copyBtn.textContent = 'Copy Broadcast'; }, 1200);
  }
}

function init() {
  [els.iterationLabel, els.proofLinks, els.summary].forEach((el) => el.addEventListener('input', evaluateGate));
  els.checks.forEach((check) => check.addEventListener('change', evaluateGate));
  els.markDoneBtn.addEventListener('click', onMarkDone);
  els.copyBtn.addEventListener('click', onCopy);

  evaluateGate();
}

init();
