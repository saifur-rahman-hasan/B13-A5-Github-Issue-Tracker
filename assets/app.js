// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = 'https://phi-lab-server.vercel.app/api/v1/lab';
const API_ALL_ISSUES = `${API_BASE_URL}/issues`;
const API_SINGLE_ISSUE = (id) => `${API_BASE_URL}/issue/${id}`;
const API_SEARCH_ISSUES = (query) => `${API_BASE_URL}/issues/search?q=${query}`;

// ============================================
// STATE MANAGEMENT
// ============================================
let appState = {
  allIssues: [],
  currentFilter: 'all',
  isLoading: false,
  searchQuery: ''
};

// ============================================
// DOM ELEMENTS
// ============================================
const getElements = () => ({
  grid: document.getElementById('issuesGrid'),
  issueCount: document.getElementById('issueCount'),
  mobileTabSelect: document.getElementById('mobileTabSelect'),
  tabButtons: document.querySelectorAll('.tab-trigger'),
  searchInput: document.getElementById('searchInput'),
  searchButton: document.getElementById('searchButton'),
  dialog: {
    title: document.getElementById('issue-dialog-title'),
    description: document.getElementById('issue-dialog-description'),
    statusBadge: document.getElementById('issue-dialog-status-badge'),
    priorityBadge: document.getElementById('issue-dialog-priority-badge'),
    labels: document.getElementById('issue-dialog-labels'),
    author: document.getElementById('issue-dialog-author'),
    created: document.getElementById('issue-dialog-created'),
    assignee: document.getElementById('issue-dialog-assignee')
  }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format date to readable format
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '/');
};

// Get styling classes for priority
const getPriorityClasses = (priority) => {
    const normalizedPriority = priority.toUpperCase();

    const classes = {
        HIGH: 'bg-red-50 text-red-600 inset-ring inset-ring-red-500/10 dark:bg-red-400/10 dark:text-red-400 dark:inset-ring-red-400/20',
        MEDIUM: 'bg-yellow-50 text-yellow-600 inset-ring inset-ring-yellow-500/10 dark:bg-yellow-400/10 dark:text-yellow-400 dark:inset-ring-yellow-400/20',
        LOW: 'bg-gray-50 text-gray-600 inset-ring inset-ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:inset-ring-gray-400/20'
    };
    
    return classes[normalizedPriority] || classes.LOW;
};

// Get styling classes for status border
const getStatusBorderClass = (status) => {
  const classes = {
    'open': 'border-t-4 border-t-emerald-500',
    'closed': 'border-t-4 border-t-violet-500'
  };
  return classes[status] || classes['open'];
};

// Get styling classes for tags/labels
const getTagClasses = (tag) => {
  const normalizedTag = tag.toUpperCase();
  const classes = {
    'BUG': 'bg-rose-100 text-rose-700',
    'HELP WANTED': 'bg-amber-100 text-amber-700',
    'ENHANCEMENT': 'bg-green-100 text-green-700',
    'DOCUMENTATION': 'bg-blue-100 text-blue-700',
    'GOOD FIRST ISSUE': 'bg-purple-100 text-purple-700'
  };
  return classes[normalizedTag] || 'bg-slate-100 text-slate-600';
};

// Get icon for tag
const getTagIcon = (tag) => {
  const normalizedTag = tag.toUpperCase();
  const icons = {
    'BUG': 'fa-bug',
    'HELP WANTED': 'fa-life-ring',
    'ENHANCEMENT': 'fa-lightbulb-o',
    'DOCUMENTATION': 'fa-book',
    'GOOD FIRST ISSUE': 'fa-star'
  };
  return icons[normalizedTag] || 'fa-tag';
};

// ============================================
// API FUNCTIONS
// ============================================

// Fetch all issues from API
const fetchAllIssues = async () => {
  try {
    const response = await axios.get(API_ALL_ISSUES);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error fetching issues:', error);
    showError('Failed to load issues. Please try again later.');
    return [];
  }
};

// Fetch single issue by ID
const fetchIssueById = async (id) => {
  try {
    const response = await axios.get(API_SINGLE_ISSUE(id));
    return response.data.data || response.data || null;
  } catch (error) {
    console.error('Error fetching issue:', error);
    showError('Failed to load issue details.');
    return null;
  }
};

// Search issues
const searchIssues = async (query) => {
  if (!query || query.trim() === '') {
    return appState.allIssues;
  }
  
  try {
    const response = await axios.get(API_SEARCH_ISSUES(query));
    return response.data.data || response.data || [];
  } catch (error) {
    console.error('Error searching issues:', error);
    showError('Search failed. Please try again.');
    return [];
  }
};

// ============================================
// FILTER FUNCTIONS
// ============================================

// Filter issues by status
const filterIssuesByStatus = (issues, status) => {
  if (status === 'all') return issues;
  return issues.filter(issue => issue.status === status);
};

// Get filtered issues based on current state
const getFilteredIssues = () => {
  return filterIssuesByStatus(appState.allIssues, appState.currentFilter);
};

// ============================================
// UI RENDERING FUNCTIONS
// ============================================

// Show loading spinner
const showLoading = () => {
  const elements = getElements();
  if (!elements.grid) return;
  
  elements.grid.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
        <p class="text-sm text-slate-500">Loading issues...</p>
      </div>
    </div>
  `;
};

// Show error message
const showError = (message) => {
  const elements = getElements();
  if (!elements.grid) return;
  
  elements.grid.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-12">
      <div class="rounded-lg bg-red-50 px-6 py-4 text-center">
        <i class="fa fa-exclamation-triangle text-2xl text-red-500"></i>
        <p class="mt-2 text-sm font-semibold text-red-700">${message}</p>
      </div>
    </div>
  `;
};

// Show empty state
const showEmptyState = (message = 'No issues found') => {
  const elements = getElements();
  if (!elements.grid) return;
  
  elements.grid.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-12">
      <div class="text-center">
        <i class="fa fa-inbox text-4xl text-slate-300"></i>
        <p class="mt-3 text-sm text-slate-500">${message}</p>
      </div>
    </div>
  `;
};

// Render single issue card
const renderIssueCard = (issue) => {
  const isOpen = issue.status === 'open';
  const statusIcon = isOpen ? 'assets/Open-Status.png' : 'assets/Closed- Status .png';
  const statusAlt = isOpen ? 'Open Issue' : 'Closed Issue';
  const statusBgClass = isOpen ? 'bg-emerald-100' : 'bg-violet-100';
  const priorityClasses = getPriorityClasses(issue.priority);
  const statusBorderClass = getStatusBorderClass(issue.status);

  const tagsHtml = (issue.labels || [])
    .map(label => {
      const tagClasses = getTagClasses(label);
      const tagIcon = getTagIcon(label);
      return `<span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tagClasses}">
        <i class="fa ${tagIcon}" aria-hidden="true"></i>${label}
      </span>`;
    })
    .join('');

  // Get issue number from ID
  const issueNumber = issue.id || issue._id || '0';

  return `
    <button
      type="button"
      command="show-modal"
      commandfor="issueDetailDialog"
      data-issue-id="${issue._id || issue.id}"
      class="${statusBorderClass} w-full rounded-lg border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div class="mb-3 flex items-center justify-between">
        <span class="${statusBgClass} flex h-6 w-6 items-center justify-center rounded-full">
          <img src="${statusIcon}" alt="${statusAlt}" class="h-5 w-5 object-contain">
        </span>
        <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium uppercase ${priorityClasses}">${issue.priority}</span>
      </div>

      <h3 class="text-base font-bold text-slate-800 leading-snug">${issue.title}</h3>
      <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">${issue.description}</p>

      <div class="mt-3 flex flex-wrap gap-2">
        ${tagsHtml}
      </div>

      <div class="mt-4 border-t border-slate-200 pt-3 space-y-1 text-sm text-slate-500">
        <p>#${issueNumber} by ${issue.author || 'Unknown'}</p>
        <p>${formatDate(issue.createdAt)}</p>
      </div>
    </button>
  `;
};

// Render all issues
const renderIssues = (issues) => {
  const elements = getElements();
  if (!elements.grid) return;

  if (issues.length === 0) {
    showEmptyState(appState.searchQuery ? 'No issues found matching your search' : 'No issues available');
    return;
  }

  elements.grid.innerHTML = issues.map(renderIssueCard).join('');
};

// Update issue count display
const updateIssueCount = (count) => {
  const elements = getElements();
  if (elements.issueCount) {
    elements.issueCount.textContent = count;
  }
};

// Update active tab UI
const updateActiveTabUI = (activeTab) => {
  const elements = getElements();
  
  if (elements.mobileTabSelect) {
    elements.mobileTabSelect.value = activeTab;
  }

  elements.tabButtons.forEach(button => {
    const isActive = button.dataset.tab === activeTab;
    button.className = isActive
      ? 'tab-trigger rounded-md bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700'
      : 'tab-trigger rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700';

    if (isActive) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });
};

// ============================================
// MODAL/DIALOG FUNCTIONS
// ============================================

// Populate and show issue details modal
const showIssueDetails = async (issueId) => {
  const elements = getElements();
  
  // First, try to find issue in current state
  let issue = appState.allIssues.find(item => 
    (item._id && item._id === issueId) || (item.id && item.id === issueId)
  );
  
  // If not found, fetch from API
  if (!issue) {
    issue = await fetchIssueById(issueId);
  }
  
  if (!issue) return;

  const { dialog } = elements;
  const isOpen = issue.status === 'open';
  const priorityClasses = getPriorityClasses(issue.priority);
  
  // Update dialog content
  if (dialog.title) dialog.title.textContent = issue.title;
  if (dialog.description) dialog.description.textContent = issue.description;
  
  if (dialog.statusBadge) {
    dialog.statusBadge.innerHTML = isOpen
      ? `Open`
      : `Closed`;
    dialog.statusBadge.className = `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'
    }`;
  }
  
  if (dialog.priorityBadge) {
    dialog.priorityBadge.textContent = issue.priority;
    dialog.priorityBadge.className = `inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase ${priorityClasses}`;
  }
  
  if (dialog.labels) {
    const tagsHtml = (issue.labels || [])
      .map(label => {
        const tagClasses = getTagClasses(label);
        const tagIcon = getTagIcon(label);
        return `<span class="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${tagClasses}">
          <i class="fa ${tagIcon}" aria-hidden="true"></i>${label}
        </span>`;
      })
      .join('');
    dialog.labels.innerHTML = tagsHtml;
  }
  
  if (dialog.author) dialog.author.textContent = issue.author || 'Unknown';
  if (dialog.created) dialog.created.textContent = formatDate(issue.createdAt);
  if (dialog.assignee) dialog.assignee.textContent = issue.assignee || 'Unassigned';
};

// ============================================
// EVENT HANDLERS
// ============================================

// Handle tab change
const handleTabChange = async (tab) => {
  appState.currentFilter = tab;
  appState.searchQuery = ''; // Reset search when changing tabs
  
  const elements = getElements();
  if (elements.searchInput) {
    elements.searchInput.value = ''; // Clear search input
  }
  
  const filteredIssues = getFilteredIssues();
  renderIssues(filteredIssues);
  updateActiveTabUI(tab);
  updateIssueCount(filteredIssues.length);
};

// Handle search
const handleSearch = async () => {
  const elements = getElements();
  const query = elements.searchInput?.value.trim() || '';
  
  appState.searchQuery = query;
  showLoading();
  
  // If query is empty, fetch all issues; otherwise search
  const searchResults = query === '' 
    ? await fetchAllIssues() 
    : await searchIssues(query);
  appState.allIssues = searchResults;
  
  const filteredIssues = getFilteredIssues();
  renderIssues(filteredIssues);
  updateIssueCount(filteredIssues.length);
};

// Handle issue card click
const handleIssueClick = (event) => {
  const trigger = event.target.closest('[data-issue-id]');
  if (!trigger) return;
  
  const issueId = trigger.dataset.issueId;
  showIssueDetails(issueId);
};

// ============================================
// INITIALIZATION
// ============================================

// Initialize event listeners
const initializeEventListeners = () => {
  const elements = getElements();
  
  // Tab buttons click
  elements.tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab || 'all';
      handleTabChange(tab);
    });
  });
  
  // Mobile tab select change
  if (elements.mobileTabSelect) {
    elements.mobileTabSelect.addEventListener('change', (event) => {
      handleTabChange(event.target.value);
    });
  }
  
  // Issue card click
  if (elements.grid) {
    elements.grid.addEventListener('click', handleIssueClick);
  }
  
  // Search functionality
  if (elements.searchInput) {
    elements.searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    });
    
    // Auto-reload all issues when search is cleared
    elements.searchInput.addEventListener('input', (event) => {
      if (event.target.value.trim() === '') {
        handleSearch();
      }
    });
  }
  
  if (elements.searchButton) {
    elements.searchButton.addEventListener('click', handleSearch);
  }
};

// Load initial data
const initializeApp = async () => {
  showLoading();
  
  const issues = await fetchAllIssues();
  appState.allIssues = issues;
  appState.currentFilter = 'all';
  
  const filteredIssues = getFilteredIssues();
  renderIssues(filteredIssues);
  updateIssueCount(filteredIssues.length);
  updateActiveTabUI('all');
  
  initializeEventListeners();
};

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
