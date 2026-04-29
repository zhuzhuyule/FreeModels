const API_BASE = '../data';

let allModels = [];
let currentView = 'all';
let currentProvider = null;
let searchQuery = '';
let viewData = {};
let metaData = {};

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
  const mainData = await loadJSON(`${API_BASE}/models.json`);
  if (!mainData) return;

  metaData = {
    providers: mainData.providers || {},
    views: mainData.views || [],
    updatedAt: mainData.updated_at,
  };

  allModels = mainData.data || [];
  viewData = {
    all: allModels,
    free: allModels.filter(m => m.is_free),
    experienceable: allModels.filter(m => m.is_experienceable),
  };

  const freeCount = allModels.filter(m => m.is_free).length;
  elements.totalModels.textContent = mainData.total || 0;
  elements.totalProviders.textContent = Object.keys(metaData.providers).length;
  elements.freeModels.textContent = freeCount;
  elements.lastUpdated.textContent = new Date(metaData.updatedAt).toLocaleString();

  renderProviderFilter(Object.keys(metaData.providers), metaData.providers);
  renderModels();
}

function renderProviderFilter(providerNames, providerMeta) {
  elements.providersFilter.innerHTML = '';

  const allChip = document.createElement('button');
  allChip.className = 'provider-chip' + (currentProvider === null ? ' active' : '');
  allChip.textContent = 'All Providers';
  allChip.onclick = () => setProvider(null);
  elements.providersFilter.appendChild(allChip);

  for (const name of providerNames) {
    const meta = providerMeta[name] || { displayName: name };
    const chip = document.createElement('button');
    chip.className = 'provider-chip' + (currentProvider === name ? ' active' : '');
    chip.textContent = meta.displayName || name;
    chip.onclick = () => setProvider(name);
    elements.providersFilter.appendChild(chip);
  }
}

function setProvider(provider) {
  currentProvider = provider;
  document.querySelectorAll('.provider-chip').forEach(chip => {
    chip.classList.toggle('active', chip.textContent === 'All Providers' ? provider === null : chip.textContent === (metaData.providers[provider]?.displayName || provider));
  });
  renderModels();
}

function getFilteredModels() {
  let models = allModels;

  if (currentProvider) {
    models = models.filter(m => m.provider === currentProvider);
  }

  if (currentView === 'free') {
    models = models.filter(m => m.is_free);
  } else if (currentView === 'experienceable') {
    models = models.filter(m => m.is_experienceable);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    models = models.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.model_id.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
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
          ${model.is_experienceable ? '<span class="billing-badge experienceable">体验</span>' : ''}
          <span class="billing-badge ${model.billing_mode}">${model.billing_mode}</span>
          <span class="model-provider">${escapeHtml(model.provider)}</span>
        </div>
      </div>
      ${model.description ? `<p class="model-description">${escapeHtml(model.description)}</p>` : ''}
      <div class="model-meta">
        <div class="model-meta-item">
          <span class="label">Context:</span>
          <span class="value">${model.context_label || '-'}</span>
        </div>
        ${model.price_input ? `
        <div class="model-meta-item">
          <span class="label">Input:</span>
          <span class="value">$${model.price_input}/1K tokens</span>
        </div>
        ` : ''}
        ${model.price_output ? `
        <div class="model-meta-item">
          <span class="label">Output:</span>
          <span class="value">$${model.price_output}/1K tokens</span>
        </div>
        ` : ''}
      </div>
      <div class="model-tags">
        ${model.is_reasoning ? '<span class="tag reasoning">Reasoning</span>' : ''}
        ${model.is_multimodal ? '<span class="tag multimodal">Multimodal</span>' : ''}
        ${(model.tags || []).filter(t => t !== 'text-generation').map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
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

  allModels = viewData[view] || viewData.all;
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
