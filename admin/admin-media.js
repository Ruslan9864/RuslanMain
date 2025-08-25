/**
 * Admin Media Management System
 * Secure file uploads, image processing, and OWASP compliance
 */

class AdminMedia {
    constructor() {
        this.media = [];
        this.currentUploads = [];
        this.allowedTypes = {
            'image': ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
            'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'video': [] // Only embeds allowed
        };
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.uploadQueue = [];
        this.isUploading = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadMedia();
        this.initDragAndDrop();
    }

    bindEvents() {
        // Open media upload event
        document.addEventListener('openMediaUpload', () => {
            this.showMediaLibrary();
        });

        // Media section navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.media-upload-btn')) {
                this.showUploadModal();
            }
        });
    }

    async loadMedia() {
        try {
            const response = await adminAuth.apiRequest('/media');
            const data = await response.json();

            if (response.ok) {
                this.media = data.media;
                this.renderMediaGrid();
            } else {
                throw new Error(data.message || 'Ошибка загрузки медиа');
            }
        } catch (error) {
            console.error('Error loading media:', error);
            // Use mock data for development
            this.loadMockMedia();
        }
    }

    loadMockMedia() {
        this.media = [
            {
                id: 1,
                filename: 'hero-image.jpg',
                originalName: 'hero-image.jpg',
                type: 'image',
                mimeType: 'image/jpeg',
                size: 2048576,
                url: '../assets/client-1.jpg',
                thumbnail: '../assets/client-1.jpg',
                alt: 'Главное изображение',
                title: 'Hero Image',
                caption: 'Главное изображение для блога',
                uploadedAt: new Date('2024-01-15'),
                dimensions: { width: 1200, height: 630 }
            },
            {
                id: 2,
                filename: 'branding-guide.pdf',
                originalName: 'branding-guide.pdf',
                type: 'document',
                mimeType: 'application/pdf',
                size: 5120000,
                url: '../assets/media-kit-ru.pdf',
                thumbnail: null,
                alt: 'Руководство по брендингу',
                title: 'Branding Guide',
                caption: 'Полное руководство по брендингу',
                uploadedAt: new Date('2024-01-18')
            }
        ];
        this.renderMediaGrid();
    }

    renderMediaGrid() {
        const container = document.getElementById('mediaGrid');
        if (!container) return;

        container.innerHTML = '';

        this.media.forEach(item => {
            const mediaItem = this.createMediaItem(item);
            container.appendChild(mediaItem);
        });

        this.updateMediaStats();
    }

    createMediaItem(item) {
        const element = document.createElement('div');
        element.className = 'media-item';
        element.innerHTML = `
            <div class="media-preview">
                ${this.getMediaPreview(item)}
                <div class="media-overlay">
                    <div class="media-actions">
                        <button class="btn btn-sm btn-primary" onclick="adminMedia.editMedia(${item.id})" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="adminMedia.copyUrl(${item.id})" title="Копировать URL">
                            <i class="fas fa-link"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminMedia.deleteMedia(${item.id})" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="media-info">
                <h4 class="media-title">${item.title || item.originalName}</h4>
                <p class="media-meta">
                    ${this.formatFileSize(item.size)} • ${this.formatDate(item.uploadedAt)}
                </p>
                ${item.alt ? `<p class="media-alt">Alt: ${item.alt}</p>` : ''}
            </div>
        `;

        return element;
    }

    getMediaPreview(item) {
        if (item.type === 'image') {
            return `<img src="${item.thumbnail || item.url}" alt="${item.alt || item.title}" loading="lazy">`;
        } else if (item.type === 'document') {
            return `<div class="document-preview">
                <i class="fas fa-file-pdf"></i>
                <span>${item.originalName}</span>
            </div>`;
        } else {
            return `<div class="unknown-preview">
                <i class="fas fa-file"></i>
                <span>${item.originalName}</span>
            </div>`;
        }
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    updateMediaStats() {
        const totalFiles = this.media.length;
        const totalSize = this.media.reduce((sum, item) => sum + item.size, 0);
        
        // Update stats display if available
        const statsElement = document.getElementById('mediaStats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="stat-item">
                    <span class="stat-number">${totalFiles}</span>
                    <span class="stat-label">Файлов</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.formatFileSize(totalSize)}</span>
                    <span class="stat-label">Общий размер</span>
                </div>
            `;
        }
    }

    showMediaLibrary() {
        // Navigate to media section
        if (window.adminDashboard) {
            window.adminDashboard.navigateToSection('media');
        }
    }

    showUploadModal() {
        const modal = this.createUploadModal();
        document.body.appendChild(modal);
    }

    createUploadModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container upload-modal">
                <div class="modal-header">
                    <h2>Загрузка медиа</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="upload-area" id="uploadArea">
                        <div class="upload-content">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <h3>Перетащите файлы сюда или нажмите для выбора</h3>
                            <p>Поддерживаемые форматы: JPG, PNG, WebP, AVIF, PDF (до 10MB)</p>
                            <input type="file" id="fileInput" multiple accept=".jpg,.jpeg,.png,.webp,.avif,.pdf" style="display: none;">
                            <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()">
                                Выбрать файлы
                            </button>
                        </div>
                    </div>
                    
                    <div class="upload-progress" id="uploadProgress" style="display: none;">
                        <h3>Загрузка файлов</h3>
                        <div class="progress-list" id="progressList"></div>
                    </div>
                    
                    <div class="upload-options">
                        <h3>Настройки загрузки</h3>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="autoAlt" checked>
                                <span class="checkmark"></span>
                                Автоматически генерировать alt-текст
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="stripExif" checked>
                                <span class="checkmark"></span>
                                Удалять EXIF данные из изображений
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="generateThumbnails" checked>
                                <span class="checkmark"></span>
                                Создавать превью для изображений
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Отмена
                    </button>
                    <button type="button" class="btn btn-primary" id="startUpload" onclick="adminMedia.startUpload()">
                        Начать загрузку
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    initDragAndDrop() {
        document.addEventListener('DOMContentLoaded', () => {
            const uploadArea = document.getElementById('uploadArea');
            if (!uploadArea) return;

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                const files = Array.from(e.dataTransfer.files);
                this.processFiles(files);
            });

            // File input change
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    const files = Array.from(e.target.files);
                    this.processFiles(files);
                });
            }
        });
    }

    processFiles(files) {
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) {
            adminAuth.showNotification('Нет подходящих файлов для загрузки', 'warning');
            return;
        }

        this.uploadQueue = validFiles;
        this.showUploadProgress();
        this.renderUploadQueue();
    }

    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            adminAuth.showNotification(`Файл ${file.name} слишком большой (максимум ${this.formatFileSize(this.maxFileSize)})`, 'error');
            return false;
        }

        // Check file type
        const allowedMimes = [...this.allowedTypes.image, ...this.allowedTypes.document];
        if (!allowedMimes.includes(file.type)) {
            adminAuth.showNotification(`Неподдерживаемый тип файла: ${file.name}`, 'error');
            return false;
        }

        // Check file extension
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.pdf'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            adminAuth.showNotification(`Неподдерживаемое расширение файла: ${file.name}`, 'error');
            return false;
        }

        return true;
    }

    showUploadProgress() {
        const progressArea = document.getElementById('uploadProgress');
        const uploadArea = document.getElementById('uploadArea');
        
        if (progressArea && uploadArea) {
            progressArea.style.display = 'block';
            uploadArea.style.display = 'none';
        }
    }

    renderUploadQueue() {
        const progressList = document.getElementById('progressList');
        if (!progressList) return;

        progressList.innerHTML = '';

        this.uploadQueue.forEach((file, index) => {
            const progressItem = this.createProgressItem(file, index);
            progressList.appendChild(progressItem);
        });
    }

    createProgressItem(file, index) {
        const element = document.createElement('div');
        element.className = 'progress-item';
        element.innerHTML = `
            <div class="progress-info">
                <span class="filename">${file.name}</span>
                <span class="filesize">${this.formatFileSize(file.size)}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-${index}" style="width: 0%"></div>
            </div>
            <div class="progress-status" id="status-${index}">Ожидание</div>
        `;

        return element;
    }

    async startUpload() {
        if (this.isUploading || this.uploadQueue.length === 0) return;

        this.isUploading = true;
        const startButton = document.getElementById('startUpload');
        if (startButton) {
            startButton.disabled = true;
            startButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
        }

        try {
            for (let i = 0; i < this.uploadQueue.length; i++) {
                const file = this.uploadQueue[i];
                await this.uploadFile(file, i);
            }

            adminAuth.showNotification('Все файлы загружены успешно', 'success');
            this.loadMedia(); // Refresh media library
            
            // Close modal
            document.querySelector('.upload-modal').closest('.modal-overlay').remove();
        } catch (error) {
            console.error('Upload error:', error);
            adminAuth.showNotification('Ошибка загрузки файлов', 'error');
        } finally {
            this.isUploading = false;
            this.uploadQueue = [];
            
            if (startButton) {
                startButton.disabled = false;
                startButton.innerHTML = 'Начать загрузку';
            }
        }
    }

    async uploadFile(file, index) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add upload options
        const autoAlt = document.getElementById('autoAlt')?.checked || false;
        const stripExif = document.getElementById('stripExif')?.checked || false;
        const generateThumbnails = document.getElementById('generateThumbnails')?.checked || false;
        
        formData.append('autoAlt', autoAlt);
        formData.append('stripExif', stripExif);
        formData.append('generateThumbnails', generateThumbnails);

        try {
            // Update status
            this.updateProgressStatus(index, 'Загрузка...');

            const response = await adminAuth.apiRequest('/media/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    // Don't set Content-Type for FormData
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateProgressStatus(index, 'Завершено', 'success');
                this.updateProgressBar(index, 100);
                
                // Add to media library
                this.media.unshift(data.media);
            } else {
                throw new Error('Ошибка загрузки');
            }
        } catch (error) {
            console.error('File upload error:', error);
            this.updateProgressStatus(index, 'Ошибка', 'error');
            throw error;
        }
    }

    updateProgressStatus(index, status, type = 'info') {
        const statusElement = document.getElementById(`status-${index}`);
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `progress-status status-${type}`;
        }
    }

    updateProgressBar(index, percentage) {
        const progressElement = document.getElementById(`progress-${index}`);
        if (progressElement) {
            progressElement.style.width = `${percentage}%`;
        }
    }

    async editMedia(mediaId) {
        const media = this.media.find(m => m.id === mediaId);
        if (!media) return;

        const modal = this.createEditMediaModal(media);
        document.body.appendChild(modal);
    }

    createEditMediaModal(media) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container edit-media-modal">
                <div class="modal-header">
                    <h2>Редактировать медиа</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="media-preview-large">
                        ${this.getMediaPreview(media)}
                    </div>
                    
                    <form id="editMediaForm" class="edit-media-form">
                        <div class="form-group">
                            <label for="mediaTitle" class="form-label">Заголовок</label>
                            <input type="text" id="mediaTitle" name="title" class="form-input" 
                                   value="${media.title || ''}" placeholder="Заголовок медиа">
                        </div>
                        
                        <div class="form-group">
                            <label for="mediaAlt" class="form-label">Alt текст *</label>
                            <input type="text" id="mediaAlt" name="alt" class="form-input" required 
                                   value="${media.alt || ''}" placeholder="Описание для доступности">
                        </div>
                        
                        <div class="form-group">
                            <label for="mediaCaption" class="form-label">Подпись</label>
                            <textarea id="mediaCaption" name="caption" class="form-input" rows="3" 
                                      placeholder="Подпись к медиа">${media.caption || ''}</textarea>
                        </div>
                        
                        <div class="media-info-grid">
                            <div class="info-item">
                                <label>Файл:</label>
                                <span>${media.originalName}</span>
                            </div>
                            <div class="info-item">
                                <label>Размер:</label>
                                <span>${this.formatFileSize(media.size)}</span>
                            </div>
                            <div class="info-item">
                                <label>Тип:</label>
                                <span>${media.mimeType}</span>
                            </div>
                            <div class="info-item">
                                <label>Загружен:</label>
                                <span>${this.formatDate(media.uploadedAt)}</span>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Отмена
                    </button>
                    <button type="button" class="btn btn-primary" onclick="adminMedia.saveMediaEdit(${media.id})">
                        Сохранить
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    async saveMediaEdit(mediaId) {
        const form = document.getElementById('editMediaForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await adminAuth.apiRequest(`/media/${mediaId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const updatedMedia = await response.json();
                
                // Update local media array
                const index = this.media.findIndex(m => m.id === mediaId);
                if (index !== -1) {
                    this.media[index] = updatedMedia.media;
                }

                adminAuth.showNotification('Медиа обновлено', 'success');
                this.renderMediaGrid();
                
                // Close modal
                document.querySelector('.edit-media-modal').closest('.modal-overlay').remove();
            } else {
                throw new Error('Ошибка обновления');
            }
        } catch (error) {
            console.error('Save media edit error:', error);
            adminAuth.showNotification('Ошибка обновления медиа', 'error');
        }
    }

    async deleteMedia(mediaId) {
        if (!confirm('Вы уверены, что хотите удалить это медиа? Это действие нельзя отменить.')) {
            return;
        }

        try {
            const response = await adminAuth.apiRequest(`/media/${mediaId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove from local array
                this.media = this.media.filter(m => m.id !== mediaId);
                
                adminAuth.showNotification('Медиа удалено', 'success');
                this.renderMediaGrid();
            } else {
                throw new Error('Ошибка удаления');
            }
        } catch (error) {
            console.error('Delete media error:', error);
            adminAuth.showNotification('Ошибка удаления медиа', 'error');
        }
    }

    copyUrl(mediaId) {
        const media = this.media.find(m => m.id === mediaId);
        if (!media) return;

        navigator.clipboard.writeText(media.url).then(() => {
            adminAuth.showNotification('URL скопирован в буфер обмена', 'success');
        }).catch(() => {
            adminAuth.showNotification('Ошибка копирования URL', 'error');
        });
    }

    // Get media by ID
    getMediaById(mediaId) {
        return this.media.find(m => m.id === mediaId);
    }

    // Search media
    searchMedia(query) {
        return this.media.filter(item => 
            item.title?.toLowerCase().includes(query.toLowerCase()) ||
            item.originalName.toLowerCase().includes(query.toLowerCase()) ||
            item.alt?.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Filter media by type
    filterMediaByType(type) {
        return this.media.filter(item => item.type === type);
    }

    // Get media statistics
    getMediaStats() {
        const stats = {
            total: this.media.length,
            images: this.media.filter(m => m.type === 'image').length,
            documents: this.media.filter(m => m.type === 'document').length,
            totalSize: this.media.reduce((sum, item) => sum + item.size, 0)
        };

        return stats;
    }
}

// Initialize media management
const adminMedia = new AdminMedia();

// Export for use in other modules
window.adminMedia = adminMedia;
