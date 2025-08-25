/**
 * Admin Authentication System
 * JWT-based authentication with secure session management
 */

class AdminAuth {
    constructor() {
        this.tokenKey = 'admin_jwt_token';
        this.userKey = 'admin_user_data';
        this.apiBase = '/api/admin';
        this.isAuthenticated = false;
        this.currentUser = null;
        
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
    }

    bindEvents() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Password toggle
        const passwordToggle = document.querySelector('.password-toggle');
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // User menu toggle
        const userMenuToggle = document.querySelector('.user-menu-toggle');
        if (userMenuToggle) {
            userMenuToggle.addEventListener('click', () => this.toggleUserMenu());
        }

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.querySelector('.user-menu');
            if (userMenu && !userMenu.contains(e.target)) {
                this.closeUserMenu();
            }
        });
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const email = form.email.value.trim();
        const password = form.password.value;
        const remember = form.remember.checked;

        // Clear previous errors
        this.clearErrors();

        // Validate inputs
        if (!this.validateLoginInputs(email, password)) {
            return;
        }

        try {
            // Show loading state
            this.setLoadingState(true);

            // Attempt login
            const response = await this.login(email, password, remember);
            
            if (response.success) {
                this.setAuthenticated(response.user, response.token);
                this.showSuccessMessage('Успешный вход в систему');
                this.redirectToDashboard();
            } else {
                this.showError('email', response.message || 'Ошибка входа');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('email', 'Ошибка соединения. Попробуйте позже.');
        } finally {
            this.setLoadingState(false);
        }
    }

    validateLoginInputs(email, password) {
        let isValid = true;

        // Email validation
        if (!email) {
            this.showError('email', 'Email обязателен');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('email', 'Введите корректный email');
            isValid = false;
        }

        // Password validation
        if (!password) {
            this.showError('password', 'Пароль обязателен');
            isValid = false;
        } else if (password.length < 6) {
            this.showError('password', 'Пароль должен содержать минимум 6 символов');
            isValid = false;
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async login(email, password, remember = false) {
        const response = await fetch(`${this.apiBase}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                remember
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка входа');
        }

        return data;
    }

    setAuthenticated(user, token) {
        this.isAuthenticated = true;
        this.currentUser = user;

        // Store token and user data
        const storage = this.getStorage();
        storage.setItem(this.tokenKey, token);
        storage.setItem(this.userKey, JSON.stringify(user));

        // Update UI
        this.showAdminInterface();
        this.updateUserInfo(user);
    }

    checkAuthStatus() {
        const token = this.getToken();
        
        if (token && this.isValidToken(token)) {
            const userData = this.getUserData();
            if (userData) {
                this.setAuthenticated(userData, token);
                return;
            }
        }

        // Clear invalid data
        this.clearAuthData();
        this.showLoginScreen();
    }

    getToken() {
        return this.getStorage().getItem(this.tokenKey);
    }

    getUserData() {
        const userData = this.getStorage().getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    isValidToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            
            // Check if token is expired
            if (payload.exp && payload.exp < now) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    async handleLogout(event) {
        event.preventDefault();
        
        try {
            // Call logout API
            await this.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local data
            this.clearAuthData();
            this.showLoginScreen();
            this.showSuccessMessage('Вы вышли из системы');
        }
    }

    async logout() {
        const token = this.getToken();
        
        if (token) {
            await fetch(`${this.apiBase}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
        }
    }

    clearAuthData() {
        const storage = this.getStorage();
        storage.removeItem(this.tokenKey);
        storage.removeItem(this.userKey);
        
        this.isAuthenticated = false;
        this.currentUser = null;
    }

    getStorage() {
        // Use sessionStorage for better security
        return sessionStorage;
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminInterface').style.display = 'none';
    }

    showAdminInterface() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminInterface').style.display = 'grid';
    }

    updateUserInfo(user) {
        const userNameElement = document.querySelector('.user-name');
        const userAvatarElement = document.querySelector('.user-avatar');
        
        if (userNameElement) {
            userNameElement.textContent = user.name || user.email;
        }
        
        if (userAvatarElement && user.avatar) {
            userAvatarElement.src = user.avatar;
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.querySelector('.password-toggle i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.className = 'fas fa-eye-slash';
            toggleButton.setAttribute('aria-label', 'Скрыть пароль');
        } else {
            passwordInput.type = 'password';
            toggleButton.className = 'fas fa-eye';
            toggleButton.setAttribute('aria-label', 'Показать пароль');
        }
    }

    toggleUserMenu() {
        const dropdown = document.querySelector('.user-dropdown');
        dropdown.classList.toggle('show');
    }

    closeUserMenu() {
        const dropdown = document.querySelector('.user-dropdown');
        dropdown.classList.remove('show');
    }

    setLoadingState(loading) {
        const submitButton = document.querySelector('#loginForm button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        if (loading) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }

    showError(field, message) {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    showSuccessMessage(message) {
        // Create and show success notification
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="Закрыть">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());
    }

    redirectToDashboard() {
        // Update URL without page reload
        window.history.pushState({}, '', '/admin/');
        
        // Trigger dashboard load
        const event = new CustomEvent('dashboardLoad');
        document.dispatchEvent(event);
    }

    // API request helper with authentication
    async apiRequest(endpoint, options = {}) {
        const token = this.getToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            }
        };

        const response = await fetch(`${this.apiBase}${endpoint}`, {
            ...defaultOptions,
            ...options
        });

        if (response.status === 401) {
            // Token expired or invalid
            this.clearAuthData();
            this.showLoginScreen();
            throw new Error('Сессия истекла. Войдите снова.');
        }

        return response;
    }

    // Check user permissions
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.role) {
            return false;
        }

        const rolePermissions = {
            'admin': ['all'],
            'editor': ['create', 'edit', 'publish', 'delete_own'],
            'author': ['create', 'edit_own', 'submit_review'],
            'viewer': ['view']
        };

        const userPermissions = rolePermissions[this.currentUser.role] || [];
        
        return userPermissions.includes('all') || userPermissions.includes(permission);
    }

    // Get current user role
    getUserRole() {
        return this.currentUser?.role || 'viewer';
    }

    // Check if user is admin
    isAdmin() {
        return this.getUserRole() === 'admin';
    }
}

// Simulated admin account creation
function createAdminAccount(email, password) {
    // In a real implementation, this would be handled by the backend
    // For now, we'll simulate it by storing in localStorage for demo purposes
    const adminUser = {
        id: 1,
        email: email,
        name: 'Rustam Rustamov',
        role: 'admin',
        permissions: ['posts:read', 'posts:write', 'posts:delete', 'media:read', 'media:write', 'media:delete', 'users:read', 'users:write', 'settings:read', 'settings:write'],
        created_at: new Date().toISOString(),
        last_login: null
    };
    
    // Hash the password (in real implementation, this would be done server-side)
    const hashedPassword = btoa(password); // Simple base64 encoding for demo
    
    // Store user data (in real implementation, this would be in a database)
    localStorage.setItem('admin_user', JSON.stringify(adminUser));
    localStorage.setItem('admin_password_hash', hashedPassword);
    
    console.log('Admin account created successfully:', email);
    return adminUser;
}

// Initialize admin account if it doesn't exist
function initializeAdminAccount() {
    const email = 'rrustamov986@gmail.com';
    const password = 'Rrustamov9864';
    
    if (!localStorage.getItem('admin_user')) {
        createAdminAccount(email, password);
    }
}

// Update the login function to handle the created account
async function loginUser(email, password) {
    const loginForm = document.getElementById('loginForm');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Вход...';
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if this is our created admin account
        const storedUser = localStorage.getItem('admin_user');
        const storedPasswordHash = localStorage.getItem('admin_password_hash');
        
        if (storedUser && storedPasswordHash) {
            const user = JSON.parse(storedUser);
            const hashedPassword = btoa(password);
            
            if (user.email === email && hashedPassword === storedPasswordHash) {
                // Generate JWT token (in real implementation, this would come from server)
                const token = btoa(JSON.stringify({
                    user_id: user.id,
                    email: user.email,
                    role: user.role,
                    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
                }));
                
                // Store authentication data
                sessionStorage.setItem('admin_token', token);
                sessionStorage.setItem('admin_user', JSON.stringify(user));
                
                // Update last login
                user.last_login = new Date().toISOString();
                localStorage.setItem('admin_user', JSON.stringify(user));
                
                // Show success message
                showNotification('Успешный вход!', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
                return;
            }
        }
        
        // If not found, show error
        throw new Error('Неверный email или пароль');
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message || 'Ошибка входа', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Initialize admin account when the script loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminAccount();
    
    // Initialize authentication system
    const adminAuth = new AdminAuth();

    // Export for use in other modules
    window.adminAuth = adminAuth;
});
