const state = {
  doneAt: null,
  pageUpdatedAt: new Date(),
  draggedCard: null,
};

const details = {
  'v1.4': 'v1.4 established guardrails: naming checks, completion gate, and broadcast output.',
  'v1.5': 'v1.5 is currently active. Use this card to run guardrails before shipping status updates.',
  'v1.6': 'v1.6 focuses on turning Atlantis into a real interactive board UI with card-centric workflow.',
};

const els = {
  lastUpdated: document.getElementById('lastUpdated'),
  autoAdvance: document.getElementById('autoAdvance'),
  autoAdvanceLabel: document.getElementById('autoAdvanceLabel'),

  dropzones: Array.from(document.querySelectorAll('[data-dropzone]')),
  cards: Array.from(document.querySelectorAll('.card[data-card]')),
  counts: Array.from(document.querySelectorAll('[data-count-for]')),

  modal: document.getElementById('cardModal'),
  closeModal: document.getElementById('closeModal'),
  modalTitle: document.getElementById('modalTitle'),
  modalSubtitle: document.getElementById('modalSubtitle'),
  guardrailsPanel: document.getElementById('guardrailsPanel'),
  genericPanel: document.getElementById('genericPanel'),
  genericBody: document.getElementById('genericBody'),

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

function formatTimestamp(date = new Date()) {
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

function updateLastUpdated(date = new Date()) {
  state.pageUpdatedAt = date;
  els.lastUpdated.textContent = `Last Updated: ${formatTimestamp(state.pageUpdatedAt)}`;
}

function updateCounts() {
  els.counts.forEach((el) => {
    const column = el.getAttribute('data-count-for');
    const count = document.querySelectorAll(`[data-dropzone="${column}"] .card[data-card]`).length;
    el.textContent = String(count);
  });
}

function setAutoAdvanceLabel() {
  els.autoAdvanceLabel.textContent = els.autoAdvance.checked ? 'ON' : 'OFF';
  updateLastUpdated();
}

function validateIterationLabel(label) {
  const value = String(label || '').trim();
  const valid = /^v\d+\.\d+$/.test(value);

  return {
    valid,
    normalized: value,
    message: valid
      ? 'Label valid.'
      : 'Invalid label. Use format v<major>.<minor> (example: v1.5).',
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

function generateBroadcast() {
  const { normalized } = validateIterationLabel(els.iterationLabel.value);
  const summary = els.summary.value.trim();
  const proof = collectProofList();
  const doneAt = state.doneAt || new Date();

  const proofBlock = proof.length ? proof.map((url) => `- ${url}`).join('\n') : '- (none provided)';

  return [
    `🚢 **Atlantis Milestone ${normalized} — Completed**`,
    '',
    '**Summary**',
    summary,
    '',
    '**Completion Checklist**',
    '- ✅ Tests passed',
    '- ✅ Docs updated',
    '- ✅ Review approved',
    '',
    '**Proof / Links**',
    proofBlock,
    '',
    `**Completed At**: ${doneAt.toLocaleString()}`,
  ].join('\n');
}

function onMarkDone() {
  const gate = evaluateGate();
  if (!gate.ready) return;

  state.doneAt = new Date();
  els.broadcastOutput.value = generateBroadcast();
  els.copyBtn.disabled = false;
  updateLastUpdated(state.doneAt);
}

async function onCopy() {
  if (!els.broadcastOutput.value.trim()) return;

  try {
    await navigator.clipboard.writeText(els.broadcastOutput.value);
    els.copyBtn.textContent = 'Copied!';
  } catch {
    els.copyBtn.textContent = 'Copy failed';
  }

  setTimeout(() => {
    els.copyBtn.textContent = 'Copy Broadcast';
  }, 1200);
}

function openModal(cardId) {
  const title = `Atlantis ${cardId}`;
  els.modalTitle.textContent = title;
  els.modalSubtitle.textContent = `Card detail • ${cardId === 'v1.5' ? 'Active milestone' : 'Overview'}`;

  if (cardId === 'v1.5') {
    els.guardrailsPanel.hidden = false;
    els.genericPanel.hidden = true;
    if (!els.iterationLabel.value.trim()) els.iterationLabel.value = 'v1.5';
    evaluateGate();
  } else {
    els.guardrailsPanel.hidden = true;
    els.genericPanel.hidden = false;
    els.genericBody.textContent = details[cardId] || 'No detail available.';
  }

  els.modal.classList.add('open');
  els.modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  els.modal.classList.remove('open');
  els.modal.setAttribute('aria-hidden', 'true');
}

function onCardActivate(event) {
  const card = event.currentTarget;
  const cardId = card.getAttribute('data-card');
  if (!cardId) return;
  openModal(cardId);
}

function wireDnD() {
  els.cards.forEach((card) => {
    card.addEventListener('dragstart', () => {
      state.draggedCard = card;
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      state.draggedCard = null;
      updateCounts();
      updateLastUpdated();
    });
  });

  els.dropzones.forEach((zone) => {
    zone.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    zone.addEventListener('drop', (event) => {
      event.preventDefault();
      if (!state.draggedCard) return;
      zone.appendChild(state.draggedCard);
      updateCounts();
      updateLastUpdated();
    });
  });
}

function init() {
  setAutoAdvanceLabel();
  updateCounts();
  updateLastUpdated();

  els.autoAdvance.addEventListener('change', setAutoAdvanceLabel);

  els.cards.forEach((card) => {
    card.addEventListener('click', onCardActivate);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onCardActivate({ currentTarget: card });
      }
    });
  });

  wireDnD();

  [els.iterationLabel, els.proofLinks, els.summary].forEach((el) => el.addEventListener('input', evaluateGate));
  els.checks.forEach((check) => check.addEventListener('change', evaluateGate));
  els.markDoneBtn.addEventListener('click', onMarkDone);
  els.copyBtn.addEventListener('click', onCopy);

  els.closeModal.addEventListener('click', closeModal);
  els.modal.addEventListener('click', (event) => {
    if (event.target === els.modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && els.modal.classList.contains('open')) {
      closeModal();
    }
  });

  evaluateGate();
}

init();
