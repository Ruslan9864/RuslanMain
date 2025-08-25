/**
 * Admin Panel Main Script
 * Initializes all components and handles global functionality
 */

class AdminMain {
    constructor() {
        this.currentSection = 'dashboard';
        this.modals = new Map();
        this.notifications = [];
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        this.bindGlobalEvents();
        this.initializeComponents();
        this.setupKeyboardShortcuts();
        this.setupServiceWorker();
        this.isInitialized = true;
    }

    bindGlobalEvents() {
        // Global click handlers
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window events
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });

        // URL hash change
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handlePopState();
        });
    }

    initializeComponents() {
        // Initialize all admin components
        this.initializeNotifications();
        this.initializeModals();
        this.initializeTooltips();
        this.initializeConfirmDialogs();
        
        // Load initial section based on URL hash
        this.loadInitialSection();
    }

    loadInitialSection() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        if (window.adminDashboard) {
            window.adminDashboard.navigateToSection(hash);
        }
    }

    handleGlobalClick(e) {
        // Handle modal backdrop clicks
        if (e.target.classList.contains('modal-overlay')) {
            this.closeModal(e.target);
        }

        // Handle notification close clicks
        if (e.target.closest('.notification-close')) {
            this.closeNotification(e.target.closest('.notification'));
        }

        // Handle tooltip triggers
        if (e.target.hasAttribute('data-tooltip')) {
            this.showTooltip(e.target);
        }
    }

    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not typing in input fields
        if (this.isTypingInInput(e.target)) return;

        // Ctrl/Cmd + K: Quick search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.openQuickSearch();
        }

        // Ctrl/Cmd + N: New post
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (window.adminPosts) {
                window.adminPosts.createNewPost();
            }
        }

        // Ctrl/Cmd + U: Upload media
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            if (window.adminMedia) {
                window.adminMedia.showUploadModal();
            }
        }

        // Escape: Close modals/notifications
        if (e.key === 'Escape') {
            this.closeAllModals();
            this.closeAllNotifications();
        }

        // Alt + 1-7: Navigate sections
        if (e.altKey && /^[1-7]$/.test(e.key)) {
            e.preventDefault();
            this.navigateByNumber(parseInt(e.key));
        }
    }

    isTypingInInput(element) {
        const inputTypes = ['input', 'textarea', 'select'];
        return inputTypes.includes(element.tagName.toLowerCase()) || 
               element.contentEditable === 'true';
    }

    openQuickSearch() {
        // Create and show quick search modal
        const modal = this.createQuickSearchModal();
        document.body.appendChild(modal);
        
        // Focus search input
        setTimeout(() => {
            const searchInput = modal.querySelector('#quickSearchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    }

    createQuickSearchModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay quick-search-modal';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="search-header">
                    <i class="fas fa-search"></i>
                    <input type="text" id="quickSearchInput" placeholder="Поиск по статьям, медиа, настройкам..." autocomplete="off">
                    <button class="search-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-results" id="quickSearchResults">
                    <div class="search-placeholder">
                        <i class="fas fa-search"></i>
                        <p>Начните вводить для поиска...</p>
                    </div>
                </div>
                <div class="search-shortcuts">
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>N</kbd> Новая статья
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>U</kbd> Загрузить медиа
                    </div>
                    <div class="shortcut-item">
                        <kbd>Alt</kbd> + <kbd>1-7</kbd> Навигация
                    </div>
                </div>
            </div>
        `;

        // Add search functionality
        const searchInput = modal.querySelector('#quickSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.performQuickSearch(e.target.value);
            });
        }

        return modal;
    }

    async performQuickSearch(query) {
        if (!query.trim()) {
            this.showQuickSearchPlaceholder();
            return;
        }

        const results = await this.searchAllContent(query);
        this.displayQuickSearchResults(results);
    }

    async searchAllContent(query) {
        const results = [];

        // Search posts
        if (window.adminPosts && window.adminPosts.posts) {
            const postResults = window.adminPosts.posts.filter(post =>
                post.title.toLowerCase().includes(query.toLowerCase()) ||
                post.summary.toLowerCase().includes(query.toLowerCase())
            ).map(post => ({
                type: 'post',
                title: post.title,
                subtitle: post.summary,
                url: `#posts`,
                action: () => window.adminPosts.editPost(post.id)
            }));
            results.push(...postResults);
        }

        // Search media
        if (window.adminMedia && window.adminMedia.media) {
            const mediaResults = window.adminMedia.media.filter(item =>
                item.title?.toLowerCase().includes(query.toLowerCase()) ||
                item.originalName.toLowerCase().includes(query.toLowerCase())
            ).map(item => ({
                type: 'media',
                title: item.title || item.originalName,
                subtitle: `Медиа файл`,
                url: `#media`,
                action: () => window.adminMedia.editMedia(item.id)
            }));
            results.push(...mediaResults);
        }

        return results.slice(0, 10); // Limit to 10 results
    }

    displayQuickSearchResults(results) {
        const resultsContainer = document.getElementById('quickSearchResults');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>Ничего не найдено</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = results.map(result => `
            <div class="search-result" onclick="adminMain.executeSearchResult(${results.indexOf(result)})">
                <div class="result-icon">
                    <i class="fas fa-${result.type === 'post' ? 'newspaper' : 'image'}"></i>
                </div>
                <div class="result-content">
                    <div class="result-title">${result.title}</div>
                    <div class="result-subtitle">${result.subtitle}</div>
                </div>
                <div class="result-action">
                    <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        `).join('');
    }

    showQuickSearchPlaceholder() {
        const resultsContainer = document.getElementById('quickSearchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>Начните вводить для поиска...</p>
                </div>
            `;
        }
    }

    executeSearchResult(index) {
        // This would be implemented to execute the search result action
        console.log('Execute search result:', index);
    }

    navigateByNumber(number) {
        const sections = ['dashboard', 'posts', 'media', 'categories', 'tags', 'authors', 'settings'];
        const section = sections[number - 1];
        if (section && window.adminDashboard) {
            window.adminDashboard.navigateToSection(section);
        }
    }

    handleResize() {
        // Handle responsive behavior
        this.updateResponsiveLayout();
    }

    updateResponsiveLayout() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth < 1024;
        
        // Update sidebar behavior
        const sidebar = document.querySelector('.admin-sidebar');
        if (sidebar) {
            if (isMobile || isTablet) {
                sidebar.classList.remove('show');
            }
        }

        // Update modal sizes
        this.updateModalSizes();
    }

    updateModalSizes() {
        const modals = document.querySelectorAll('.modal-container');
        modals.forEach(modal => {
            if (window.innerWidth < 768) {
                modal.style.width = '95vw';
                modal.style.maxWidth = '95vw';
            } else {
                modal.style.width = '';
                modal.style.maxWidth = '';
            }
        });
    }

    handleBeforeUnload() {
        // Check for unsaved changes
        if (this.hasUnsavedChanges()) {
            return 'У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?';
        }
    }

    hasUnsavedChanges() {
        // Check if there are any unsaved changes in forms
        const forms = document.querySelectorAll('form');
        return Array.from(forms).some(form => {
            const formData = new FormData(form);
            const originalData = form.dataset.originalData;
            if (!originalData) return false;
            
            const currentData = JSON.stringify(Object.fromEntries(formData));
            return currentData !== originalData;
        });
    }

    handleHashChange() {
        const hash = window.location.hash.slice(1);
        if (hash && window.adminDashboard) {
            window.adminDashboard.navigateToSection(hash);
        }
    }

    handlePopState() {
        // Handle browser back/forward navigation
        this.loadInitialSection();
    }

    initializeNotifications() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    initializeModals() {
        // Global modal management
        this.modals = new Map();
    }

    initializeTooltips() {
        // Initialize tooltips for elements with data-tooltip attribute
        document.addEventListener('mouseenter', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.showTooltip(e.target);
            }
        });

        document.addEventListener('mouseleave', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.hideTooltip();
            }
        });
    }

    showTooltip(element) {
        const text = element.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        
        // Store reference
        element.tooltip = tooltip;
    }

    hideTooltip() {
        const tooltips = document.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
    }

    initializeConfirmDialogs() {
        // Override default confirm with custom modal
        window.confirm = (message) => {
            return this.showConfirmDialog(message);
        };
    }

    showConfirmDialog(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay confirm-dialog';
            modal.innerHTML = `
                <div class="modal-container">
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove(); resolve(false);">
                            Отмена
                        </button>
                        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); resolve(true);">
                            Подтвердить
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        });
    }

    setupKeyboardShortcuts() {
        // Add keyboard shortcuts help
        this.createKeyboardShortcutsHelp();
    }

    createKeyboardShortcutsHelp() {
        const shortcuts = [
            { key: 'Ctrl + K', description: 'Быстрый поиск' },
            { key: 'Ctrl + N', description: 'Новая статья' },
            { key: 'Ctrl + U', description: 'Загрузить медиа' },
            { key: 'Alt + 1-7', description: 'Навигация по разделам' },
            { key: 'Escape', description: 'Закрыть модальные окна' }
        ];

        // Create shortcuts help modal
        const helpModal = `
            <div class="shortcuts-help" style="display: none;">
                <div class="shortcuts-header">
                    <h3>Горячие клавиши</h3>
                    <button onclick="this.closest('.shortcuts-help').style.display='none'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="shortcuts-list">
                    ${shortcuts.map(shortcut => `
                        <div class="shortcut-item">
                            <kbd>${shortcut.key}</kbd>
                            <span>${shortcut.description}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add to page
        document.body.insertAdjacentHTML('beforeend', helpModal);
    }

    setupServiceWorker() {
        // Register service worker for offline functionality
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/admin/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    closeModal(modal) {
        if (modal) {
            modal.remove();
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.remove());
    }

    closeNotification(notification) {
        if (notification) {
            notification.remove();
        }
    }

    closeAllNotifications() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => notification.remove());
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`Admin Error [${context}]:`, error);
        
        // Show user-friendly error message
        const message = error.message || 'Произошла ошибка. Попробуйте еще раз.';
        if (window.adminAuth) {
            window.adminAuth.showNotification(message, 'error');
        }
    }

    // Performance monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`Performance [${name}]: ${end - start}ms`);
        return result;
    }

    // Analytics tracking
    trackEvent(category, action, label = null, value = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
    }
}

// Initialize main admin functionality
const adminMain = new AdminMain();

// Export for use in other modules
window.adminMain = adminMain;

// Global error handler
window.addEventListener('error', (e) => {
    adminMain.handleError(e.error, 'Global Error');
});

window.addEventListener('unhandledrejection', (e) => {
    adminMain.handleError(e.reason, 'Unhandled Promise Rejection');
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Admin Panel loaded in ${loadTime}ms`);
    });
}
