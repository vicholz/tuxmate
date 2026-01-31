// TuxMate - Main Application
// Vanilla JavaScript implementation

class TuxMateApp {
    constructor() {
        this.selectedDistro = 'ubuntu';
        this.selectedApps = new Set();
        this.expandedCategories = new Set();
        this.helper = 'yay';
        this.hasHelper = false;
        this.includeFlatpakApps = true;
        this.searchQuery = '';
        this.theme = 'dark';
        this.dataLoaded = false;
    }

    async init() {
        // Show loading state
        this.showLoading();
        
        // Load data from JSON
        const loaded = await loadData();
        if (!loaded) {
            this.showError('Failed to load application data. Please refresh the page.');
            return;
        }
        
        this.dataLoaded = true;
        
        // Set all categories as expanded by default
        this.expandedCategories = new Set(categories);
        
        // Load saved state
        this.loadState();
        
        // Initialize UI
        this.hideLoading();
        this.renderDistroSelector();
        this.renderCategories();
        this.renderFooter();
        this.setupEventListeners();
        this.updateCommand();
        this.initTheme();
        
        // Auto-save on any change
        this.setupAutoSave();
    }

    showLoading() {
        const grid = document.getElementById('app-grid');
        if (grid) {
            grid.innerHTML = '<div class="loading">Loading apps...</div>';
        }
    }

    hideLoading() {
        // Loading will be replaced by actual content
    }

    showError(message) {
        const grid = document.getElementById('app-grid');
        if (grid) {
            grid.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    loadState() {
        const saved = Storage.loadLastUsed();
        this.selectedDistro = saved.distro;
        this.helper = saved.helper;
        this.hasHelper = saved.hasHelper;
        this.includeFlatpakApps = saved.includeFlatpakApps;
        
        // Check if flatpaksupport was in the saved selection
        const hasFlatpakSupport = saved.apps.includes('flatpaksupport');
        
        // Filter apps based on availability and Flatpak settings
        this.selectedApps = new Set(saved.apps.filter(id => {
            const app = apps.find(a => a.id === id);
            if (!app) return false;
            
            const isAvailable = this.isAppAvailable(app);
            const isFlatpakOnly = !isAvailable && app.targets.flatpak;
            // Keep if available for distro, OR if Flatpak-only and flatpak is selected and shown
            return isAvailable || (isFlatpakOnly && hasFlatpakSupport && this.includeFlatpakApps);
        }));
    }

    saveState() {
        Storage.autoSave({
            distro: this.selectedDistro,
            apps: [...this.selectedApps],
            helper: this.helper,
            hasHelper: this.hasHelper,
            includeFlatpakApps: this.includeFlatpakApps,
        });
    }

    setupAutoSave() {
        // Debounce save
        let saveTimeout;
        const debouncedSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => this.saveState(), 500);
        };
        
        // Override methods to trigger save
        const originalToggleApp = this.toggleApp.bind(this);
        this.toggleApp = (appId) => {
            originalToggleApp(appId);
            debouncedSave();
        };
    }

    initTheme() {
        const savedTheme = localStorage.getItem('tuxmate_theme') || 'dark';
        this.theme = savedTheme;
        document.body.classList.toggle('light', savedTheme === 'light');
        this.updateThemeToggle();
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.body.classList.toggle('light', this.theme === 'light');
        localStorage.setItem('tuxmate_theme', this.theme);
        this.updateThemeToggle();
    }

    updateThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.innerHTML = this.theme === 'dark' 
                ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>';
        }
    }

    isAppAvailable(app) {
        if (!app || !app.targets) return false;
        return this.selectedDistro in app.targets;
    }

    toggleApp(appId) {
        const app = apps.find(a => a.id === appId);
        if (!app) return;
        
        // Check if app is available (either for distro or flatpak when flatpak package is selected)
        const isAvailable = this.isAppAvailable(app);
        const isFlatpakOnly = !isAvailable && app.targets.flatpak;
        const flatpakInstalled = this.isFlatpakSelected();
        const isFlatpakEnabled = isFlatpakOnly && flatpakInstalled;
        const canSelect = isAvailable || isFlatpakEnabled;
        
        if (!canSelect) return;

        if (this.selectedApps.has(appId)) {
            this.selectedApps.delete(appId);
            
            // If flatpaksupport was deselected, also deselect all Flatpak-only apps
            if (appId === 'flatpaksupport') {
                const newSelected = new Set();
                this.selectedApps.forEach(id => {
                    const a = apps.find(x => x.id === id);
                    if (a && this.isAppAvailable(a)) {
                        newSelected.add(id);
                    }
                });
                this.selectedApps = newSelected;
            }
        } else {
            this.selectedApps.add(appId);
        }
        
        // If flatpaksupport was toggled, re-render to update Flatpak-only app states
        if (appId === 'flatpaksupport') {
            this.renderCategories();
        } else {
            this.updateAppItem(appId);
        }
        
        this.updateCommand();
        this.updateCategoryCount(app.category);
        this.saveState();
    }

    setDistro(distroId) {
        this.selectedDistro = distroId;
        
        // Filter out apps not available in new distro
        // Keep flatpaksupport first to check if Flatpak-only apps should be kept
        const keepFlatpak = this.selectedApps.has('flatpaksupport');
        const newSelected = new Set();
        
        this.selectedApps.forEach(appId => {
            const app = apps.find(a => a.id === appId);
            if (!app) return;
            
            const isAvailable = this.isAppAvailable(app);
            const isFlatpakOnly = !isAvailable && app.targets.flatpak;
            
            // Keep if available for distro, OR if it's a Flatpak-only app and flatpak is selected
            if (isAvailable || (isFlatpakOnly && keepFlatpak && this.includeFlatpakApps)) {
                newSelected.add(appId);
            }
        });
        this.selectedApps = newSelected;
        
        // Re-render everything
        this.renderDistroSelector();
        this.renderCategories();
        this.renderFooter(); // Re-render footer to update options (like helper selector for Arch)
        this.updateCommand();
        this.saveState();
    }

    toggleCategory(category) {
        if (this.expandedCategories.has(category)) {
            this.expandedCategories.delete(category);
        } else {
            this.expandedCategories.add(category);
        }
        
        const section = document.querySelector(`[data-category="${category}"]`);
        if (section) {
            const content = section.querySelector('.category-content');
            const chevron = section.querySelector('.chevron');
            const isExpanded = this.expandedCategories.has(category);
            
            content.style.maxHeight = isExpanded ? content.scrollHeight + 'px' : '0';
            content.style.opacity = isExpanded ? '1' : '0';
            chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';
        }
    }

    clearAll() {
        this.selectedApps.clear();
        this.renderCategories();
        this.updateCommand();
        this.saveState();
    }

    selectAll() {
        const flatpakInstalled = this.isFlatpakSelected();
        
        apps.forEach(app => {
            const isAvailable = this.isAppAvailable(app);
            const isFlatpakOnly = !isAvailable && app.targets.flatpak;
            // Can only select Flatpak-only apps if flatpaksupport is selected and includeFlatpakApps is on
            const canSelect = isAvailable || (isFlatpakOnly && flatpakInstalled && this.includeFlatpakApps);
            
            if (canSelect) {
                this.selectedApps.add(app.id);
            }
        });
        this.renderCategories();
        this.updateCommand();
        this.saveState();
    }

    // Rendering methods
    renderDistroSelector() {
        const container = document.getElementById('distro-selector');
        const currentDistro = getDistroById(this.selectedDistro);
        
        container.innerHTML = `
            <button class="distro-button" id="distro-button" style="border-left-color: ${currentDistro.color}">
                <img src="${currentDistro.iconUrl}" alt="${currentDistro.name}" class="distro-icon">
                <span class="distro-name">${currentDistro.name}</span>
                <svg class="chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="distro-dropdown" id="distro-dropdown">
                ${distros.map(d => `
                    <button class="distro-option ${d.id === this.selectedDistro ? 'selected' : ''}" 
                            data-distro="${d.id}"
                            style="${d.id === this.selectedDistro ? `background-color: ${d.color}22; border-left-color: ${d.color}` : ''}">
                        <img src="${d.iconUrl}" alt="${d.name}" class="distro-icon">
                        <span>${d.name}</span>
                        ${d.id === this.selectedDistro ? '<svg class="check" viewBox="0 0 24 24" fill="' + d.color + '"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderCategories() {
        const container = document.getElementById('app-grid');
        const filteredApps = this.getFilteredApps();
        
        // Group apps by category
        const categoriesWithApps = categories
            .map(cat => ({
                category: cat,
                apps: filteredApps.filter(app => app.category === cat)
            }))
            .filter(c => c.apps.length > 0);

        container.innerHTML = categoriesWithApps.map(({ category, apps: catApps }) => {
            const selectedCount = catApps.filter(a => this.selectedApps.has(a.id)).length;
            const color = categoryColors[category] || '#6b7280';
            const isExpanded = this.expandedCategories.has(category);
            
            return `
                <div class="category-section" data-category="${category}">
                    <div class="category-header" style="border-left-color: ${color}">
                        <button class="category-toggle" data-toggle="${category}">
                            <svg class="chevron" style="transform: rotate(${isExpanded ? '0' : '-90'}deg)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                            <span class="category-name">${category}</span>
                            ${selectedCount > 0 ? `<span class="category-count" style="background: ${color}">${selectedCount}</span>` : ''}
                        </button>
                    </div>
                    <div class="category-content" style="max-height: ${isExpanded ? '1000px' : '0'}; opacity: ${isExpanded ? '1' : '0'}">
                        ${catApps.map(app => this.renderAppItem(app, color)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAppItem(app, color) {
        const isSelected = this.selectedApps.has(app.id);
        const isAvailable = this.isAppAvailable(app);
        const isFlatpakOnly = !isAvailable && app.targets.flatpak;
        const flatpakInstalled = this.isFlatpakSelected();
        const isFlatpakEnabled = isFlatpakOnly && flatpakInstalled;
        const canSelect = isAvailable || isFlatpakEnabled;
        const isAur = this.selectedDistro === 'arch' && app.targets?.arch && isAurPackage(app.targets.arch);
        
        // Use flatpak color for flatpak-only apps, AUR color for AUR, otherwise category color
        let checkboxColor = color;
        if (isFlatpakEnabled) {
            checkboxColor = '#4A90D9'; // Flatpak blue
        } else if (isAur) {
            checkboxColor = '#1793d1'; // Arch blue
        }
        
        // Determine checkbox class - disabled if flatpak-only but flatpak not selected
        let checkboxClass = 'checkbox';
        if (isFlatpakOnly && !flatpakInstalled) {
            checkboxClass += ' checkbox-flatpak-disabled';
        }
        
        const availableClass = canSelect ? '' : (isFlatpakOnly ? 'flatpak-only' : 'unavailable');
        
        return `
            <div class="app-item ${availableClass} ${isSelected ? 'selected' : ''}" 
                 data-app="${app.id}"
                 title="${app.description}${isFlatpakOnly && !flatpakInstalled ? ' (Select Flatpak package to enable)' : ''}">
                <div class="${checkboxClass}" style="border-color: ${isSelected ? checkboxColor : (isFlatpakOnly && !flatpakInstalled ? '#4A90D9' : 'var(--border-secondary)')}; background-color: ${isSelected ? checkboxColor : 'transparent'}">
                    ${isSelected ? '<svg viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
                    ${isFlatpakOnly && !flatpakInstalled && !isSelected ? '<svg viewBox="0 0 24 24" fill="#4A90D9" opacity="0.5"><path d="M19 13H5v-2h14v2z"/></svg>' : ''}
                </div>
                <img src="${app.iconUrl}" alt="${app.name}" class="app-icon" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><rect fill=%22%23666%22 width=%2224%22 height=%2224%22 rx=%224%22/></svg>'">
                <span class="app-name">${app.name}</span>
                ${isAur ? '<span class="aur-badge" title="AUR Package">AUR</span>' : ''}
                ${isFlatpakOnly ? '<span class="flatpak-badge" title="Available via Flatpak only">Flatpak</span>' : ''}
            </div>
        `;
    }

    renderFooter() {
        const footer = document.getElementById('footer');
        const distro = getDistroById(this.selectedDistro);
        
        footer.innerHTML = `
            <div class="footer-container">
                <div class="footer-glow"></div>
                <div class="footer-content">
                    <!-- Options Bar -->
                    <div class="options-bar">
                        <div class="search-container">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input type="text" id="search-input" placeholder="Search apps... (/)" value="${this.searchQuery}">
                        </div>
                        <div class="options-buttons">
                            ${this.selectedDistro !== 'flatpak' && this.selectedDistro !== 'snap' ? `
                            <label class="flatpak-toggle">
                                <input type="checkbox" id="include-flatpak" ${this.includeFlatpakApps ? 'checked' : ''}>
                                <span>Include Flatpak apps</span>
                            </label>
                            ` : ''}
                            ${this.selectedDistro === 'arch' && this.hasAurPackages() ? `
                            <div class="helper-selector">
                                <button class="helper-btn ${this.helper === 'yay' ? 'active' : ''}" data-helper="yay">yay</button>
                                <button class="helper-btn ${this.helper === 'paru' ? 'active' : ''}" data-helper="paru">paru</button>
                            </div>
                            <label class="has-helper-toggle">
                                <input type="checkbox" id="has-helper" ${this.hasHelper ? 'checked' : ''}>
                                <span>${this.helper} installed</span>
                            </label>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Command Bar -->
                    <div class="command-bar" style="border-left-color: ${distro.color}">
                        <button class="preview-btn" id="preview-btn" style="background: ${distro.color}22; color: ${distro.color}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                            <span>Review</span>
                            <span class="count">[${this.selectedApps.size}]</span>
                        </button>
                        <div class="command-display" id="command-display">
                            <code>${this.getCommandPreview()}</code>
                        </div>
                        <div class="command-buttons">
                            <button class="cmd-btn" id="clear-btn" title="Clear All">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                Clear
                            </button>
                            <button class="cmd-btn" id="download-btn" title="Download Script">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                Download
                            </button>
                            <button class="cmd-btn" id="copy-btn" title="Copy Command">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Check if Flatpak package manager is selected
    isFlatpakSelected() {
        return this.selectedApps.has('flatpaksupport');
    }

    getFilteredApps() {
        let filtered = apps;
        
        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(app => 
                app.name.toLowerCase().includes(query) ||
                app.id.toLowerCase().includes(query) ||
                app.description.toLowerCase().includes(query)
            );
        }
        
        // Filter based on distro and includeFlatpakApps setting
        if (this.selectedDistro !== 'flatpak') {
            if (this.includeFlatpakApps) {
                // Show apps available for distro OR available via Flatpak
                filtered = filtered.filter(app => 
                    this.isAppAvailable(app) || app.targets.flatpak
                );
            } else {
                // Only show apps available for current distro (hide Flatpak-only apps)
                filtered = filtered.filter(app => this.isAppAvailable(app));
            }
        } else if (this.selectedDistro !== 'flatpak' && this.includeFlatpakApps) {
            // Show apps available for distro OR available via flatpak
            filtered = filtered.filter(app => 
                this.isAppAvailable(app) || app.targets.flatpak
            );
        }
        
        return filtered;
    }

    getCommandPreview() {
        if (this.selectedApps.size === 0) {
            return '# Select apps above to generate command';
        }
        
        const cmd = CommandGenerator.generate(
            this.selectedDistro, 
            [...this.selectedApps],
            {
                helper: this.helper,
                hasHelper: this.hasHelper,
                includeFlatpakApps: this.includeFlatpakApps,
            }
        );
        
        // For preview, show first line only if too long
        const lines = cmd.split('\n');
        if (lines.length > 1) {
            return lines[0] + ' ...';
        }
        return cmd;
    }

    updateCommand() {
        const display = document.getElementById('command-display');
        const countEl = document.querySelector('.count');
        
        if (display) {
            display.innerHTML = `<code>${this.escapeHtml(this.getCommandPreview())}</code>`;
        }
        if (countEl) {
            countEl.textContent = `[${this.selectedApps.size}]`;
        }
        
        // Update button states
        const clearBtn = document.getElementById('clear-btn');
        const downloadBtn = document.getElementById('download-btn');
        const copyBtn = document.getElementById('copy-btn');
        const previewBtn = document.getElementById('preview-btn');
        
        const disabled = this.selectedApps.size === 0;
        [clearBtn, downloadBtn, copyBtn, previewBtn].forEach(btn => {
            if (btn) btn.classList.toggle('disabled', disabled);
        });
    }

    updateAppItem(appId) {
        const item = document.querySelector(`[data-app="${appId}"]`);
        if (!item) return;
        
        const app = apps.find(a => a.id === appId);
        const isSelected = this.selectedApps.has(appId);
        const color = categoryColors[app.category] || '#6b7280';
        const isAur = this.selectedDistro === 'arch' && app.targets?.arch && isAurPackage(app.targets.arch);
        const checkboxColor = isAur ? '#1793d1' : color;
        
        item.classList.toggle('selected', isSelected);
        
        const checkbox = item.querySelector('.checkbox');
        checkbox.style.borderColor = isSelected ? checkboxColor : 'var(--border-secondary)';
        checkbox.style.backgroundColor = isSelected ? checkboxColor : 'transparent';
        checkbox.innerHTML = isSelected ? '<svg viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : '';
    }

    updateCategoryCount(category) {
        const section = document.querySelector(`[data-category="${category}"]`);
        if (!section) return;
        
        const catApps = apps.filter(a => a.category === category);
        const selectedCount = catApps.filter(a => this.selectedApps.has(a.id)).length;
        const color = categoryColors[category] || '#6b7280';
        
        const header = section.querySelector('.category-header');
        let countEl = header.querySelector('.category-count');
        
        if (selectedCount > 0) {
            if (!countEl) {
                countEl = document.createElement('span');
                countEl.className = 'category-count';
                countEl.style.background = color;
                header.querySelector('.category-toggle').appendChild(countEl);
            }
            countEl.textContent = selectedCount;
        } else if (countEl) {
            countEl.remove();
        }
    }

    updateFooterDistroColor() {
        const distro = getDistroById(this.selectedDistro);
        const commandBar = document.querySelector('.command-bar');
        const previewBtn = document.getElementById('preview-btn');
        
        if (commandBar) {
            commandBar.style.borderLeftColor = distro.color;
        }
        if (previewBtn) {
            previewBtn.style.background = `${distro.color}22`;
            previewBtn.style.color = distro.color;
        }
    }

    hasAurPackages() {
        return [...this.selectedApps].some(appId => {
            const app = apps.find(a => a.id === appId);
            return app && app.targets?.arch && isAurPackage(app.targets.arch);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event handling
    setupEventListeners() {
        // Distro selector
        document.addEventListener('click', (e) => {
            const button = e.target.closest('#distro-button');
            const dropdown = document.getElementById('distro-dropdown');
            
            if (button) {
                dropdown.classList.toggle('open');
            } else if (!e.target.closest('.distro-dropdown')) {
                dropdown?.classList.remove('open');
            }
            
            const distroOption = e.target.closest('.distro-option');
            if (distroOption) {
                this.setDistro(distroOption.dataset.distro);
                dropdown?.classList.remove('open');
            }
        });

        // Category toggles
        document.addEventListener('click', (e) => {
            const toggle = e.target.closest('[data-toggle]');
            if (toggle) {
                this.toggleCategory(toggle.dataset.toggle);
            }
        });

        // App selection
        document.addEventListener('click', (e) => {
            const item = e.target.closest('.app-item');
            if (item && !item.classList.contains('unavailable')) {
                this.toggleApp(item.dataset.app);
            }
        });

        // Search input
        document.addEventListener('input', (e) => {
            if (e.target.id === 'search-input') {
                this.searchQuery = e.target.value;
                this.renderCategories();
            }
        });

        // Keyboard shortcut for search
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                document.getElementById('search-input')?.focus();
            }
            
            if (e.key === 'Escape') {
                document.getElementById('search-input')?.blur();
                this.closePreviewModal();
            }
        });

        // Include flatpak apps toggle (shows/hides flatpak-only apps)
        document.addEventListener('change', (e) => {
            if (e.target.id === 'include-flatpak') {
                this.includeFlatpakApps = e.target.checked;
                
                // If hiding Flatpak apps, deselect any Flatpak-only apps
                if (!this.includeFlatpakApps) {
                    const newSelected = new Set();
                    this.selectedApps.forEach(appId => {
                        const app = apps.find(a => a.id === appId);
                        if (app && this.isAppAvailable(app)) {
                            newSelected.add(appId);
                        }
                    });
                    this.selectedApps = newSelected;
                }
                
                this.renderCategories();
                this.updateCommand();
                this.saveState();
            }
            
            if (e.target.id === 'has-helper') {
                this.hasHelper = e.target.checked;
                this.updateCommand();
                this.saveState();
            }
        });

        // Helper selector
        document.addEventListener('click', (e) => {
            const helperBtn = e.target.closest('.helper-btn');
            if (helperBtn) {
                this.helper = helperBtn.dataset.helper;
                document.querySelectorAll('.helper-btn').forEach(b => 
                    b.classList.toggle('active', b.dataset.helper === this.helper)
                );
                document.querySelector('.has-helper-toggle span').textContent = `${this.helper} installed`;
                this.updateCommand();
                this.saveState();
            }
        });

        // Command buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('#clear-btn')) {
                this.clearAll();
            }
            
            if (e.target.closest('#copy-btn')) {
                this.copyCommand();
            }
            
            if (e.target.closest('#download-btn')) {
                this.downloadScript();
            }
            
            if (e.target.closest('#preview-btn') || e.target.closest('#command-display')) {
                if (this.selectedApps.size > 0) {
                    this.showPreviewModal();
                }
            }
        });

        // Theme toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#theme-toggle')) {
                this.toggleTheme();
            }
        });

        // Preset/storage buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('#export-btn')) {
                this.exportSelection();
            }
            if (e.target.closest('#import-btn')) {
                this.importSelection();
            }
            if (e.target.closest('#save-preset-btn')) {
                this.savePreset();
            }
            if (e.target.closest('#load-preset-btn')) {
                this.showLoadPresetModal();
            }
            if (e.target.closest('#reset-btn')) {
                this.resetAll();
            }
        });
    }

    // Actions
    async copyCommand() {
        if (this.selectedApps.size === 0) return;
        
        const cmd = CommandGenerator.generate(
            this.selectedDistro,
            [...this.selectedApps],
            {
                helper: this.helper,
                hasHelper: this.hasHelper,
                includeFlatpakApps: this.includeFlatpakApps,
            }
        );
        
        try {
            await navigator.clipboard.writeText(cmd);
            this.showToast('Command copied to clipboard!');
        } catch (err) {
            console.error('Copy failed:', err);
            this.showToast('Failed to copy command', 'error');
        }
    }

    downloadScript() {
        if (this.selectedApps.size === 0) return;
        
        const script = CommandGenerator.generateDownloadScript(
            this.selectedDistro,
            [...this.selectedApps],
            {
                helper: this.helper,
                hasHelper: this.hasHelper,
                includeFlatpakApps: this.includeFlatpakApps,
            }
        );
        
        const isNix = this.selectedDistro === 'nix';
        const filename = isNix ? 'configuration.nix' : `tuxmate-${this.selectedDistro}.sh`;
        const mimeType = isNix ? 'text/plain' : 'text/x-shellscript';
        
        const blob = new Blob([script], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.showToast(`Downloaded ${filename}`);
    }

    showPreviewModal() {
        const cmd = CommandGenerator.generate(
            this.selectedDistro,
            [...this.selectedApps],
            {
                helper: this.helper,
                hasHelper: this.hasHelper,
                includeFlatpakApps: this.includeFlatpakApps,
            }
        );
        
        const modal = document.createElement('div');
        modal.id = 'preview-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Review Script</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <pre><code>${this.escapeHtml(cmd)}</code></pre>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="modal-close-btn">Close</button>
                    <button class="btn btn-primary" id="modal-download-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download
                    </button>
                    <button class="btn btn-primary" id="modal-copy-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target.matches('.modal-overlay, .modal-close, #modal-close-btn')) {
                this.closePreviewModal();
            }
            if (e.target.matches('#modal-download-btn') || e.target.closest('#modal-download-btn')) {
                this.downloadScript();
            }
            if (e.target.matches('#modal-copy-btn') || e.target.closest('#modal-copy-btn')) {
                this.copyCommand();
            }
        });
    }

    closePreviewModal() {
        document.getElementById('preview-modal')?.remove();
    }

    exportSelection() {
        const json = Storage.exportSelection({
            distro: this.selectedDistro,
            apps: [...this.selectedApps],
            helper: this.helper,
            hasHelper: this.hasHelper,
            includeFlatpakApps: this.includeFlatpakApps,
        });
        
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tuxmate-selection.json';
        a.click();
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.showToast('Selection exported');
    }

    importSelection() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = Storage.importSelection(e.target.result);
                if (data) {
                    this.selectedDistro = data.distro;
                    this.selectedApps = new Set(data.apps);
                    this.helper = data.helper;
                    this.hasHelper = data.hasHelper;
                    this.includeFlatpakApps = data.includeFlatpakApps;
                    
                    this.renderDistroSelector();
                    this.renderCategories();
                    this.renderFooter();
                    this.updateCommand();
                    this.saveState();
                    
                    this.showToast('Selection imported');
                } else {
                    this.showToast('Invalid file format', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    savePreset() {
        const name = prompt('Enter a name for this preset:');
        if (!name || !name.trim()) return;
        
        Storage.savePreset(name.trim(), {
            distro: this.selectedDistro,
            apps: [...this.selectedApps],
            helper: this.helper,
            hasHelper: this.hasHelper,
            includeFlatpakApps: this.includeFlatpakApps,
        });
        
        this.showToast(`Preset "${name}" saved`);
    }

    showLoadPresetModal() {
        const presets = Storage.getPresets();
        const names = Object.keys(presets);
        
        if (names.length === 0) {
            this.showToast('No saved presets', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'preset-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Load Preset</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="preset-list">
                        ${names.map(name => `
                            <div class="preset-item">
                                <button class="preset-load" data-preset="${name}">${name}</button>
                                <button class="preset-delete" data-preset="${name}" title="Delete">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target.matches('.modal-overlay, .modal-close')) {
                modal.remove();
            }
            
            const loadBtn = e.target.closest('.preset-load');
            if (loadBtn) {
                this.loadPreset(loadBtn.dataset.preset);
                modal.remove();
            }
            
            const deleteBtn = e.target.closest('.preset-delete');
            if (deleteBtn) {
                if (confirm(`Delete preset "${deleteBtn.dataset.preset}"?`)) {
                    Storage.deletePreset(deleteBtn.dataset.preset);
                    deleteBtn.closest('.preset-item').remove();
                    this.showToast('Preset deleted');
                }
            }
        });
    }

    loadPreset(name) {
        const data = Storage.loadPreset(name);
        if (!data) return;
        
        this.selectedDistro = data.distro;
        this.selectedApps = new Set(data.apps);
        this.helper = data.helper || 'yay';
        this.hasHelper = data.hasHelper || false;
        this.includeFlatpakApps = data.includeFlatpakApps !== undefined ? data.includeFlatpakApps : true;
        
        this.renderDistroSelector();
        this.renderCategories();
        this.renderFooter();
        this.updateCommand();
        this.saveState();
        
        this.showToast(`Loaded preset "${name}"`);
    }

    resetAll() {
        if (!confirm('This will clear all selections and saved data. Continue?')) return;
        
        Storage.clearAll();
        this.selectedDistro = 'ubuntu';
        this.selectedApps = new Set();
        this.helper = 'yay';
        this.hasHelper = false;
        this.includeFlatpakApps = true;
        this.searchQuery = '';
        
        this.renderDistroSelector();
        this.renderCategories();
        this.renderFooter();
        this.updateCommand();
        
        this.showToast('All data cleared');
    }

    showToast(message, type = 'success') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new TuxMateApp();
    await window.app.init();
});
