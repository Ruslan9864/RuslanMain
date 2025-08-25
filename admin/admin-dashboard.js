/**
 * Admin Dashboard System
 * Dashboard statistics, recent activity, and quick actions
 */

class AdminDashboard {
    constructor() {
        this.stats = {
            draft: 0,
            review: 0,
            scheduled: 0,
            published: 0
        };
        this.recentActivity = [];
        this.autoRefreshInterval = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDashboardData();
        this.startAutoRefresh();
    }

    bindEvents() {
        // Dashboard load event
        document.addEventListener('dashboardLoad', () => {
            this.loadDashboardData();
        });

        // Quick action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-action-btn')) {
                this.handleQuickAction(e.target.closest('.quick-action-btn'));
            }
        });

        // New post button
        const newPostBtn = document.getElementById('newPostBtn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => this.createNewPost());
        }

        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                this.handleNavigation(e.target.closest('.nav-link'));
            }
        });
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadStats(),
                this.loadRecentActivity()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Ошибка загрузки данных дашборда');
        }
    }

    async loadStats() {
        try {
            const response = await adminAuth.apiRequest('/stats');
            const data = await response.json();

            if (response.ok) {
                this.stats = data.stats;
                this.updateStatsDisplay();
            } else {
                throw new Error(data.message || 'Ошибка загрузки статистики');
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            // Use mock data for development
            this.loadMockStats();
        }
    }

    loadMockStats() {
        this.stats = {
            draft: 3,
            review: 2,
            scheduled: 1,
            published: 15
        };
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        // Update stat numbers
        document.getElementById('draftCount').textContent = this.stats.draft;
        document.getElementById('reviewCount').textContent = this.stats.review;
        document.getElementById('scheduledCount').textContent = this.stats.scheduled;
        document.getElementById('publishedCount').textContent = this.stats.published;

        // Add animation
        this.animateStats();
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(element => {
            const finalValue = parseInt(element.textContent);
            this.animateNumber(element, 0, finalValue, 1000);
        });
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const difference = end - start;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (difference * easeOutQuart));
            
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    async loadRecentActivity() {
        try {
            const response = await adminAuth.apiRequest('/activity/recent');
            const data = await response.json();

            if (response.ok) {
                this.recentActivity = data.activities;
                this.updateActivityDisplay();
            } else {
                throw new Error(data.message || 'Ошибка загрузки активности');
            }
        } catch (error) {
            console.error('Error loading activity:', error);
            // Use mock data for development
            this.loadMockActivity();
        }
    }

    loadMockActivity() {
        this.recentActivity = [
            {
                id: 1,
                type: 'post_created',
                title: 'Новая статья "Брендинг в Узбекистане"',
                user: 'Руслан Рустамов',
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                icon: 'fas fa-plus',
                color: 'var(--success-color)'
            },
            {
                id: 2,
                type: 'post_published',
                title: 'Опубликована статья "AI в дизайне"',
                user: 'Руслан Рустамов',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                icon: 'fas fa-check-circle',
                color: 'var(--success-color)'
            },
            {
                id: 3,
                type: 'media_uploaded',
                title: 'Загружено 5 изображений',
                user: 'Руслан Рустамов',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
                icon: 'fas fa-image',
                color: 'var(--info-color)'
            },
            {
                id: 4,
                type: 'post_updated',
                title: 'Обновлена статья "HoReCa брендинг"',
                user: 'Руслан Рустамов',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
                icon: 'fas fa-edit',
                color: 'var(--warning-color)'
            }
        ];
        this.updateActivityDisplay();
    }

    updateActivityDisplay() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;

        activityContainer.innerHTML = '';

        this.recentActivity.forEach(activity => {
            const activityElement = this.createActivityElement(activity);
            activityContainer.appendChild(activityElement);
        });

        // Show "no activity" message if empty
        if (this.recentActivity.length === 0) {
            activityContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Нет последней активности</p>
                </div>
            `;
        }
    }

    createActivityElement(activity) {
        const element = document.createElement('div');
        element.className = 'activity-item';
        element.innerHTML = `
            <div class="activity-icon" style="background-color: ${activity.color}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${this.formatTimestamp(activity.timestamp)} • ${activity.user}</div>
            </div>
        `;

        return element;
    }

    formatTimestamp(timestamp) {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) {
            return 'Только что';
        } else if (minutes < 60) {
            return `${minutes} мин. назад`;
        } else if (hours < 24) {
            return `${hours} ч. назад`;
        } else {
            return `${days} дн. назад`;
        }
    }

    handleQuickAction(button) {
        const action = button.dataset.action;
        
        switch (action) {
            case 'new-post':
                this.createNewPost();
                break;
            case 'upload-media':
                this.openMediaUpload();
                break;
            case 'view-analytics':
                this.viewAnalytics();
                break;
            default:
                console.warn('Unknown quick action:', action);
        }
    }

    createNewPost() {
        // Navigate to posts section and trigger new post creation
        this.navigateToSection('posts');
        
        // Trigger new post modal
        setTimeout(() => {
            const event = new CustomEvent('createNewPost');
            document.dispatchEvent(event);
        }, 100);
    }

    openMediaUpload() {
        // Navigate to media section
        this.navigateToSection('media');
        
        // Trigger media upload
        setTimeout(() => {
            const event = new CustomEvent('openMediaUpload');
            document.dispatchEvent(event);
        }, 100);
    }

    viewAnalytics() {
        // Show analytics modal or navigate to analytics page
        this.showNotification('Аналитика будет доступна в следующей версии', 'info');
    }

    handleNavigation(link) {
        const section = link.dataset.section;
        if (section) {
            this.navigateToSection(section);
        }
    }

    navigateToSection(sectionName) {
        // Update active navigation link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Show corresponding section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update URL
        window.history.pushState({}, '', `#${sectionName}`);
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        sidebar.classList.toggle('show');
    }

    startAutoRefresh() {
        // Refresh dashboard data every 5 minutes
        this.autoRefreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, 5 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    showError(message) {
        adminAuth.showNotification(message, 'error');
    }

    showSuccess(message) {
        adminAuth.showNotification(message, 'success');
    }

    // Export dashboard data
    exportDashboardData() {
        const data = {
            stats: this.stats,
            recentActivity: this.recentActivity,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Get dashboard summary for external use
    getDashboardSummary() {
        return {
            totalPosts: this.stats.draft + this.stats.review + this.stats.scheduled + this.stats.published,
            stats: this.stats,
            lastActivity: this.recentActivity[0] || null
        };
    }

    // Cleanup on page unload
    destroy() {
        this.stopAutoRefresh();
    }
}

// Initialize dashboard
const adminDashboard = new AdminDashboard();

// Export for use in other modules
window.adminDashboard = adminDashboard;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    adminDashboard.destroy();
});
