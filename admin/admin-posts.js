/**
 * Admin Posts Management System
 * CRUD operations, WYSIWYG editor, SEO fields, and publishing workflow
 */

class AdminPosts {
    constructor() {
        this.posts = [];
        this.currentPost = null;
        this.editor = null;
        this.autoSaveInterval = null;
        this.lastSaved = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPosts();
        this.initEditor();
    }

    bindEvents() {
        // Create post button
        const createPostBtn = document.getElementById('createPostBtn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => this.createNewPost());
        }

        // Search functionality
        const postsSearch = document.getElementById('postsSearch');
        if (postsSearch) {
            postsSearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Select all posts
        const selectAllPosts = document.getElementById('selectAllPosts');
        if (selectAllPosts) {
            selectAllPosts.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        }

        // Create new post event
        document.addEventListener('createNewPost', () => this.createNewPost());

        // Bulk actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bulk-action-btn')) {
                this.handleBulkAction(e.target.closest('.bulk-action-btn'));
            }
        });
    }

    async loadPosts() {
        try {
            const response = await adminAuth.apiRequest('/posts');
            const data = await response.json();

            if (response.ok) {
                this.posts = data.posts;
                this.renderPostsTable();
            } else {
                throw new Error(data.message || 'Ошибка загрузки статей');
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            // Use mock data for development
            this.loadMockPosts();
        }
    }

    loadMockPosts() {
        this.posts = [
            {
                id: 1,
                title: 'Брендинг в Узбекистане: рост и перспективы',
                slug: 'branding-uzbekistan-growth',
                status: 'published',
                author: 'Руслан Рустамов',
                categories: ['Брендинг', 'Стратегия'],
                createdAt: new Date('2024-01-15'),
                publishedAt: new Date('2024-01-20'),
                summary: 'Анализ развития брендинга в Узбекистане и перспективы роста рынка'
            },
            {
                id: 2,
                title: 'AI в дизайне: новые возможности',
                slug: 'ai-design-possibilities',
                status: 'draft',
                author: 'Руслан Рустамов',
                categories: ['Технологии', 'Дизайн'],
                createdAt: new Date('2024-01-18'),
                summary: 'Как искусственный интеллект меняет подход к дизайну'
            },
            {
                id: 3,
                title: 'HoReCa брендинг: особенности и тренды',
                slug: 'horeca-branding-trends',
                status: 'review',
                author: 'Руслан Рустамов',
                categories: ['HoReCa', 'Брендинг'],
                createdAt: new Date('2024-01-20'),
                summary: 'Специфика брендинга в сфере гостиниц, ресторанов и кафе'
            }
        ];
        this.renderPostsTable();
    }

    renderPostsTable() {
        const tbody = document.getElementById('postsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.posts.forEach(post => {
            const row = this.createPostRow(post);
            tbody.appendChild(row);
        });

        this.updateTableStats();
    }

    createPostRow(post) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="post-checkbox" value="${post.id}">
            </td>
            <td>
                <div class="post-title-cell">
                    <h4 class="post-title">${post.title}</h4>
                    <p class="post-slug">/${post.slug}</p>
                </div>
            </td>
            <td>
                <span class="status-badge status-${post.status}">${this.getStatusText(post.status)}</span>
            </td>
            <td>${post.author}</td>
            <td>
                <div class="categories-list">
                    ${post.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                </div>
            </td>
            <td>${this.formatDate(post.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" onclick="adminPosts.editPost(${post.id})" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="adminPosts.previewPost(${post.id})" title="Предпросмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="adminPosts.deletePost(${post.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    getStatusText(status) {
        const statusMap = {
            'draft': 'Черновик',
            'review': 'На проверке',
            'scheduled': 'Запланировано',
            'published': 'Опубликовано',
            'archived': 'Архив'
        };
        return statusMap[status] || status;
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    updateTableStats() {
        const totalPosts = this.posts.length;
        const publishedPosts = this.posts.filter(p => p.status === 'published').length;
        
        // Update stats if dashboard is available
        if (window.adminDashboard) {
            window.adminDashboard.stats.published = publishedPosts;
            window.adminDashboard.updateStatsDisplay();
        }
    }

    handleSearch(query) {
        const filteredPosts = this.posts.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.slug.toLowerCase().includes(query.toLowerCase()) ||
            post.author.toLowerCase().includes(query.toLowerCase()) ||
            post.categories.some(cat => cat.toLowerCase().includes(query.toLowerCase()))
        );

        this.renderFilteredPosts(filteredPosts);
    }

    renderFilteredPosts(posts) {
        const tbody = document.getElementById('postsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (posts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>Статьи не найдены</p>
                    </td>
                </tr>
            `;
            return;
        }

        posts.forEach(post => {
            const row = this.createPostRow(post);
            tbody.appendChild(row);
        });
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.post-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    handleBulkAction(button) {
        const action = button.dataset.action;
        const selectedPosts = this.getSelectedPosts();

        if (selectedPosts.length === 0) {
            adminAuth.showNotification('Выберите статьи для выполнения действия', 'warning');
            return;
        }

        switch (action) {
            case 'publish':
                this.bulkPublish(selectedPosts);
                break;
            case 'delete':
                this.bulkDelete(selectedPosts);
                break;
            case 'archive':
                this.bulkArchive(selectedPosts);
                break;
            default:
                console.warn('Unknown bulk action:', action);
        }
    }

    getSelectedPosts() {
        const checkboxes = document.querySelectorAll('.post-checkbox:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.value));
    }

    async bulkPublish(postIds) {
        if (!confirm(`Опубликовать ${postIds.length} статей?`)) return;

        try {
            const response = await adminAuth.apiRequest('/posts/bulk-publish', {
                method: 'POST',
                body: JSON.stringify({ postIds })
            });

            if (response.ok) {
                adminAuth.showNotification(`${postIds.length} статей опубликовано`, 'success');
                this.loadPosts();
            } else {
                throw new Error('Ошибка публикации');
            }
        } catch (error) {
            console.error('Bulk publish error:', error);
            adminAuth.showNotification('Ошибка публикации статей', 'error');
        }
    }

    async bulkDelete(postIds) {
        if (!confirm(`Удалить ${postIds.length} статей? Это действие нельзя отменить.`)) return;

        try {
            const response = await adminAuth.apiRequest('/posts/bulk-delete', {
                method: 'DELETE',
                body: JSON.stringify({ postIds })
            });

            if (response.ok) {
                adminAuth.showNotification(`${postIds.length} статей удалено`, 'success');
                this.loadPosts();
            } else {
                throw new Error('Ошибка удаления');
            }
        } catch (error) {
            console.error('Bulk delete error:', error);
            adminAuth.showNotification('Ошибка удаления статей', 'error');
        }
    }

    async bulkArchive(postIds) {
        try {
            const response = await adminAuth.apiRequest('/posts/bulk-archive', {
                method: 'POST',
                body: JSON.stringify({ postIds })
            });

            if (response.ok) {
                adminAuth.showNotification(`${postIds.length} статей отправлено в архив`, 'success');
                this.loadPosts();
            } else {
                throw new Error('Ошибка архивирования');
            }
        } catch (error) {
            console.error('Bulk archive error:', error);
            adminAuth.showNotification('Ошибка архивирования статей', 'error');
        }
    }

    createNewPost() {
        this.currentPost = {
            id: null,
            title: '',
            slug: '',
            status: 'draft',
            language: 'ru',
            summary: '',
            content: '',
            categories: [],
            tags: [],
            seo: {
                metaTitle: '',
                metaDescription: '',
                ogTitle: '',
                ogDescription: '',
                ogImage: '',
                robots: 'index,follow'
            },
            faq: [],
            videoEmbeds: [],
            gallery: []
        };

        this.showPostEditor();
    }

    async editPost(postId) {
        try {
            const response = await adminAuth.apiRequest(`/posts/${postId}`);
            const data = await response.json();

            if (response.ok) {
                this.currentPost = data.post;
                this.showPostEditor();
            } else {
                throw new Error(data.message || 'Ошибка загрузки статьи');
            }
        } catch (error) {
            console.error('Error loading post:', error);
            adminAuth.showNotification('Ошибка загрузки статьи', 'error');
        }
    }

    showPostEditor() {
        const modal = this.createPostEditorModal();
        document.body.appendChild(modal);
        
        // Initialize editor
        this.initEditor();
        
        // Load post data
        this.loadPostData();
        
        // Start autosave
        this.startAutoSave();
    }

    createPostEditorModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container post-editor-modal">
                <div class="modal-header">
                    <h2>${this.currentPost.id ? 'Редактировать статью' : 'Новая статья'}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="postForm" class="post-form">
                        <div class="form-grid">
                            <div class="form-main">
                                <div class="form-group">
                                    <label for="postTitle" class="form-label">Заголовок *</label>
                                    <input type="text" id="postTitle" name="title" class="form-input" required 
                                           maxlength="80" placeholder="Введите заголовок статьи">
                                </div>
                                
                                <div class="form-group">
                                    <label for="postSlug" class="form-label">URL slug</label>
                                    <input type="text" id="postSlug" name="slug" class="form-input" 
                                           placeholder="Автоматически генерируется из заголовка">
                                </div>
                                
                                <div class="form-group">
                                    <label for="postSummary" class="form-label">Краткое описание *</label>
                                    <textarea id="postSummary" name="summary" class="form-input" required 
                                              maxlength="160" rows="3" 
                                              placeholder="Краткое описание для поисковых систем (140-160 символов)"></textarea>
                                    <div class="char-counter">
                                        <span id="summaryCounter">0</span>/160
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="postContent" class="form-label">Содержание *</label>
                                    <div id="editor" class="editor-container"></div>
                                </div>
                            </div>
                            
                            <div class="form-sidebar">
                                <div class="sidebar-section">
                                    <h3>Публикация</h3>
                                    <div class="form-group">
                                        <label for="postStatus" class="form-label">Статус</label>
                                        <select id="postStatus" name="status" class="form-input">
                                            <option value="draft">Черновик</option>
                                            <option value="review">На проверке</option>
                                            <option value="scheduled">Запланировано</option>
                                            <option value="published">Опубликовано</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="postLanguage" class="form-label">Язык</label>
                                        <select id="postLanguage" name="language" class="form-input">
                                            <option value="ru">Русский</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="publishDate" class="form-label">Дата публикации</label>
                                        <input type="datetime-local" id="publishDate" name="publishedAt" class="form-input">
                                    </div>
                                </div>
                                
                                <div class="sidebar-section">
                                    <h3>SEO</h3>
                                    <div class="form-group">
                                        <label for="metaTitle" class="form-label">Meta Title</label>
                                        <input type="text" id="metaTitle" name="seo.metaTitle" class="form-input" 
                                               maxlength="60" placeholder="Заголовок для поисковых систем">
                                        <div class="char-counter">
                                            <span id="metaTitleCounter">0</span>/60
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="metaDescription" class="form-label">Meta Description</label>
                                        <textarea id="metaDescription" name="seo.metaDescription" class="form-input" 
                                                  maxlength="160" rows="3" 
                                                  placeholder="Описание для поисковых систем"></textarea>
                                        <div class="char-counter">
                                            <span id="metaDescCounter">0</span>/160
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="robots" class="form-label">Robots</label>
                                        <select id="robots" name="seo.robots" class="form-input">
                                            <option value="index,follow">index,follow</option>
                                            <option value="noindex,follow">noindex,follow</option>
                                            <option value="index,nofollow">index,nofollow</option>
                                            <option value="noindex,nofollow">noindex,nofollow</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="sidebar-section">
                                    <h3>Категории и теги</h3>
                                    <div class="form-group">
                                        <label for="postCategories" class="form-label">Категории</label>
                                        <select id="postCategories" name="categories" class="form-input" multiple>
                                            <option value="branding">Брендинг</option>
                                            <option value="design">Дизайн</option>
                                            <option value="marketing">Маркетинг</option>
                                            <option value="technology">Технологии</option>
                                            <option value="horeca">HoReCa</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="postTags" class="form-label">Теги</label>
                                        <input type="text" id="postTags" name="tags" class="form-input" 
                                               placeholder="Введите теги через запятую">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <div class="footer-left">
                        <button type="button" class="btn btn-secondary" onclick="adminPosts.saveDraft()">
                            <i class="fas fa-save"></i>
                            Сохранить черновик
                        </button>
                        <button type="button" class="btn btn-primary" onclick="adminPosts.previewPost()">
                            <i class="fas fa-eye"></i>
                            Предпросмотр
                        </button>
                    </div>
                    
                    <div class="footer-right">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Отмена
                        </button>
                        <button type="button" class="btn btn-success" onclick="adminPosts.publishPost()">
                            <i class="fas fa-paper-plane"></i>
                            Опубликовать
                        </button>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    initEditor() {
        // Initialize WYSIWYG editor (using a simple textarea for now)
        // In production, you would use a rich text editor like TinyMCE, CKEditor, or Quill
        const editorContainer = document.getElementById('editor');
        if (editorContainer) {
            editorContainer.innerHTML = `
                <textarea id="postContent" name="content" class="form-input editor-textarea" 
                          rows="20" placeholder="Начните писать содержимое статьи..."></textarea>
            `;
        }

        // Initialize character counters
        this.initCharacterCounters();
    }

    initCharacterCounters() {
        const counters = [
            { input: 'postSummary', counter: 'summaryCounter', max: 160 },
            { input: 'metaTitle', counter: 'metaTitleCounter', max: 60 },
            { input: 'metaDescription', counter: 'metaDescCounter', max: 160 }
        ];

        counters.forEach(({ input, counter, max }) => {
            const inputElement = document.getElementById(input);
            const counterElement = document.getElementById(counter);
            
            if (inputElement && counterElement) {
                inputElement.addEventListener('input', () => {
                    const length = inputElement.value.length;
                    counterElement.textContent = length;
                    
                    if (length > max) {
                        counterElement.style.color = 'var(--danger-color)';
                    } else {
                        counterElement.style.color = 'var(--text-muted)';
                    }
                });
            }
        });
    }

    loadPostData() {
        if (!this.currentPost) return;

        // Fill form fields
        const fields = ['title', 'slug', 'summary', 'status', 'language'];
        fields.forEach(field => {
            const element = document.getElementById(`post${field.charAt(0).toUpperCase() + field.slice(1)}`);
            if (element && this.currentPost[field]) {
                element.value = this.currentPost[field];
            }
        });

        // Load content
        const contentElement = document.getElementById('postContent');
        if (contentElement && this.currentPost.content) {
            contentElement.value = this.currentPost.content;
        }

        // Load SEO data
        if (this.currentPost.seo) {
            Object.keys(this.currentPost.seo).forEach(key => {
                const element = document.getElementById(key === 'metaTitle' ? 'metaTitle' : 
                                                    key === 'metaDescription' ? 'metaDescription' : key);
                if (element && this.currentPost.seo[key]) {
                    element.value = this.currentPost.seo[key];
                }
            });
        }

        // Load categories and tags
        if (this.currentPost.categories) {
            const categoriesElement = document.getElementById('postCategories');
            if (categoriesElement) {
                this.currentPost.categories.forEach(category => {
                    const option = categoriesElement.querySelector(`option[value="${category}"]`);
                    if (option) option.selected = true;
                });
            }
        }

        if (this.currentPost.tags) {
            const tagsElement = document.getElementById('postTags');
            if (tagsElement) {
                tagsElement.value = this.currentPost.tags.join(', ');
            }
        }

        // Trigger character counters
        this.initCharacterCounters();
    }

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 10000); // Auto-save every 10 seconds
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    async autoSave() {
        if (!this.currentPost) return;

        try {
            const formData = this.getFormData();
            const response = await adminAuth.apiRequest('/posts/autosave', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.lastSaved = new Date();
                // Show subtle indicator
                this.showAutoSaveIndicator();
            }
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }

    showAutoSaveIndicator() {
        // Create or update auto-save indicator
        let indicator = document.querySelector('.autosave-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'autosave-indicator';
            document.querySelector('.modal-footer').appendChild(indicator);
        }

        indicator.textContent = `Сохранено ${new Date().toLocaleTimeString()}`;
        indicator.style.opacity = '1';

        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }

    getFormData() {
        const form = document.getElementById('postForm');
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                if (!data[parent]) data[parent] = {};
                data[parent][child] = value;
            } else {
                data[key] = value;
            }
        }

        // Add current post ID if editing
        if (this.currentPost.id) {
            data.id = this.currentPost.id;
        }

        return data;
    }

    async saveDraft() {
        try {
            const formData = this.getFormData();
            formData.status = 'draft';

            const response = await adminAuth.apiRequest('/posts', {
                method: this.currentPost.id ? 'PUT' : 'POST',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                this.currentPost = data.post;
                adminAuth.showNotification('Черновик сохранен', 'success');
                this.loadPosts(); // Refresh posts list
            } else {
                throw new Error('Ошибка сохранения');
            }
        } catch (error) {
            console.error('Save draft error:', error);
            adminAuth.showNotification('Ошибка сохранения черновика', 'error');
        }
    }

    async publishPost() {
        try {
            const formData = this.getFormData();
            formData.status = 'published';

            const response = await adminAuth.apiRequest('/posts', {
                method: this.currentPost.id ? 'PUT' : 'POST',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                this.currentPost = data.post;
                adminAuth.showNotification('Статья опубликована', 'success');
                this.loadPosts(); // Refresh posts list
                
                // Close modal
                document.querySelector('.modal-overlay').remove();
            } else {
                throw new Error('Ошибка публикации');
            }
        } catch (error) {
            console.error('Publish error:', error);
            adminAuth.showNotification('Ошибка публикации статьи', 'error');
        }
    }

    async deletePost(postId) {
        if (!confirm('Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.')) {
            return;
        }

        try {
            const response = await adminAuth.apiRequest(`/posts/${postId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                adminAuth.showNotification('Статья удалена', 'success');
                this.loadPosts();
            } else {
                throw new Error('Ошибка удаления');
            }
        } catch (error) {
            console.error('Delete error:', error);
            adminAuth.showNotification('Ошибка удаления статьи', 'error');
        }
    }

    previewPost(postId = null) {
        const post = postId ? this.posts.find(p => p.id === postId) : this.currentPost;
        if (!post) return;

        // Create preview URL
        const previewUrl = `/blog/${post.slug}?preview=true&token=${adminAuth.getToken()}`;
        
        // Open in new tab
        window.open(previewUrl, '_blank');
    }
}

// Initialize posts management
const adminPosts = new AdminPosts();

// Export for use in other modules
window.adminPosts = adminPosts;
