const API_BASE = '../data';

let allModels = [];
let currentView = 'all';
let currentProvider = null;
let searchQuery = '';
let viewData = {};

const elements = {
  totalModels: document.getElementById('total-models'),
  totalProviders: document.getElementById('total-providers'),
  freeModels: document.getElementById('free-models'),
  modelsList: document.getElementById('models-list'),
  providersFilter: document.getElementById('providers-filter'),
  lastUpdated: document.getElementById('last-updated'),
  search: document.getElementById('search'),
};

async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Failed to load ${path}:`, err);
    return null;
  }
}

async function loadData() {
  const [mainData, freeData] = await Promise.all([
    loadJSON(`${API_BASE}/models.json`),
    loadJSON(`${API_BASE}/views/free/models.json`),
  ]);

  if (!mainData) return;

  viewData = { all: mainData };
  if (freeData) {
    viewData.free = freeData;
  }

  for (const view of ['reasoning', 'multimodal']) {
    const data = await loadJSON(`${API_BASE}/views/${view}/models.json`);
    if (data) {
      viewData[view] = data;
    }
  }

  allModels = mainData.models || [];

  elements.totalModels.textContent = mainData.totalModels || 0;
  elements.totalProviders.textContent = mainData.providers?.length || 0;
  elements.freeModels.textContent = freeData?.totalModels || 0;
  elements.lastUpdated.textContent = new Date(mainData.updatedAt).toLocaleString();

  renderProviderFilter(mainData.providers || [], mainData.providerMeta || {});
  renderModels();
}

function renderProviderFilter(providers, providerMeta) {
  elements.providersFilter.innerHTML = '';

  const allChip = document.createElement('button');
  allChip.className = 'provider-chip' + (currentProvider === null ? ' active' : '');
  allChip.textContent = 'All Providers';
  allChip.onclick = () => setProvider(null);
  elements.providersFilter.appendChild(allChip);

  for (const name of providers) {
    const meta = providerMeta[name] || { displayName: name };
    const chip = document.createElement('button');
    chip.className = 'provider-chip' + (currentProvider === name ? ' active' : '');
    chip.textContent = meta.displayName;
    chip.onclick = () => setProvider(name);
    elements.providersFilter.appendChild(chip);
  }
}

function setProvider(provider) {
  currentProvider = provider;
  document.querySelectorAll('.provider-chip').forEach(chip => {
    chip.classList.toggle('active', chip.textContent === 'All Providers' ? provider === null : chip.textContent === (viewData[currentView]?.providerMeta?.[provider]?.displayName || provider));
  });
  renderModels();
}

function getFilteredModels() {
  let models = allModels;

  if (currentProvider) {
    models = models.filter(m => m.provider === currentProvider);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    models = models.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.modelId.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        m.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return models;
}

function renderModels() {
  const models = getFilteredModels();

  if (models.length === 0) {
    elements.modelsList.innerHTML = '<div class="loading">No models found</div>';
    return;
  }

  elements.modelsList.innerHTML = models.map(model => `
    <div class="model-card">
      <div class="model-header">
        <div class="model-name">${escapeHtml(model.name)}</div>
        <div>
          <span class="billing-badge ${model.billingMode}">${model.billingMode}</span>
          <span class="model-provider">${escapeHtml(model.provider)}</span>
        </div>
      </div>
      ${model.description ? `<p class="model-description">${escapeHtml(model.description)}</p>` : ''}
      <div class="model-meta">
        <div class="model-meta-item">
          <span class="label">Context:</span>
          <span class="value">${model.contextLabel}</span>
        </div>
        ${model.priceInput ? `
        <div class="model-meta-item">
          <span class="label">Input:</span>
          <span class="value">$${model.priceInput}/1K tokens</span>
        </div>
        ` : ''}
        ${model.priceOutput ? `
        <div class="model-meta-item">
          <span class="label">Output:</span>
          <span class="value">$${model.priceOutput}/1K tokens</span>
        </div>
        ` : ''}
      </div>
      <div class="model-tags">
        ${model.isReasoning ? '<span class="tag reasoning">Reasoning</span>' : ''}
        ${model.isMultimodal ? '<span class="tag multimodal">Multimodal</span>' : ''}
        ${model.tags.filter(t => t !== 'text-generation').map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });

  if (viewData[view]) {
    allModels = viewData[view].models || [];
    if (view === 'free') {
      allModels = allModels.filter(m => m.billingMode === 'free');
    }
  }

  renderModels();
}

elements.search.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderModels();
});

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => setView(tab.dataset.view));
});

loadData();
