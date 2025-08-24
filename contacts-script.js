// DOM загружен
document.addEventListener('DOMContentLoaded', function() {
    
    // Мобильное меню
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Форма контактов
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const formError = document.getElementById('form-error');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Скрываем предыдущие сообщения
            hideFormMessages();
            
            // Валидация формы
            if (validateForm()) {
                // Имитация отправки формы
                showFormSuccess();
                
                // Очищаем форму
                contactForm.reset();
                
                // Скрываем сообщение об успехе через 5 секунд
                setTimeout(() => {
                    hideFormMessages();
                }, 5000);
            } else {
                showFormError();
            }
        });
    }
    
    // Функция валидации формы
    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        // Проверяем обязательные поля
        if (!name) {
            showFieldError('name', 'Имя обязательно для заполнения');
            return false;
        }
        
        if (!email) {
            showFieldError('email', 'Email обязателен для заполнения');
            return false;
        }
        
        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFieldError('email', 'Введите корректный email');
            return false;
        }
        
        // Валидация телефона (если заполнен)
        if (phone) {
            const phoneRegex = /^(\+998|998)?[0-9]{9}$/;
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                showFieldError('phone', 'Введите корректный номер телефона');
                return false;
            }
        }
        
        return true;
    }
    
    // Показ ошибки для конкретного поля
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#FF6B6B';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        // Удаляем предыдущую ошибку
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = '#FF6B6B';
        
        // Убираем ошибку при вводе
        field.addEventListener('input', function() {
            if (existingError) existingError.remove();
            field.style.borderColor = 'rgba(120, 193, 77, 0.3)';
        }, { once: true });
    }
    
    // Показ сообщения об успехе
    function showFormSuccess() {
        if (formSuccess) {
            formSuccess.style.display = 'block';
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Показ сообщения об ошибке
    function showFormError() {
        if (formError) {
            formError.style.display = 'block';
            formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Скрытие всех сообщений формы
    function hideFormMessages() {
        if (formSuccess) formSuccess.style.display = 'none';
        if (formError) formError.style.display = 'none';
        
        // Убираем ошибки полей
        const fieldErrors = document.querySelectorAll('.field-error');
        fieldErrors.forEach(error => error.remove());
        
        // Восстанавливаем стандартные границы
        const inputs = document.querySelectorAll('.form-input, .form-textarea');
        inputs.forEach(input => {
            input.style.borderColor = 'rgba(120, 193, 77, 0.3)';
        });
    }
    
    // Плавная прокрутка для якорных ссылок
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Наблюдаем за элементами для анимации
    const animateElements = document.querySelectorAll('.contact-form, .quick-contacts-section, .office-map, .cta-block');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Анимация кнопок при наведении
    const buttons = document.querySelectorAll('.messenger-btn, .social-btn, .submit-btn, .cta-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Анимация полей формы при фокусе
    const formInputs = document.querySelectorAll('.form-input, .form-textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'scale(1)';
        });
    });
    
    // Добавляем CSS классы для анимаций
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .fade-in.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .contact-form,
        .quick-contacts-section {
            transition: all 0.3s ease;
        }
        
        .messenger-btn,
        .social-btn,
        .submit-btn,
        .cta-btn {
            transition: all 0.3s ease;
        }
        
        .form-group {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Обработка ошибок загрузки изображений
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            console.warn('Изображение не загружено:', this.src);
        });
    });
    
    // Анимация скролла для плавности
    let ticking = false;
    
    function updateScroll() {
        ticking = false;
        
        // Добавляем параллакс эффект для фона
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.main-content, .office-map');
        
        parallaxElements.forEach((element, index) => {
            const rate = scrolled * (0.05 + index * 0.02);
            element.style.transform = `translateY(${rate}px)`;
        });
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Инициализация всех анимаций
    function initAnimations() {
        // Добавляем задержку для анимации hero
        setTimeout(() => {
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.classList.add('hero-animate');
            }
        }, 300);
    }
    
    // Запускаем анимации после полной загрузки
    window.addEventListener('load', initAnimations);
    
    // Добавляем CSS для hero анимации
    const heroStyle = document.createElement('style');
    heroStyle.textContent = `
        .hero-content {
            opacity: 0;
            transform: translateY(30px);
            transition: all 1s ease;
        }
        
        .hero-content.hero-animate {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(heroStyle);
    
    // Дополнительная функциональность для мессенджеров
    const messengerButtons = document.querySelectorAll('.messenger-btn');
    messengerButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Добавляем анимацию клика
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Логирование для аналитики (можно заменить на реальную аналитику)
            console.log('Клик по мессенджеру:', this.textContent.trim());
        });
    });
    
    // Валидация в реальном времени
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                showFieldError('name', 'Имя обязательно для заполнения');
            }
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email === '') {
                showFieldError('email', 'Email обязателен для заполнения');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showFieldError('email', 'Введите корректный email');
            }
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            const phone = this.value.trim();
            if (phone && !/^(\+998|998)?[0-9]{9}$/.test(phone.replace(/\s/g, ''))) {
                showFieldError('phone', 'Введите корректный номер телефона');
            }
        });
    }
    
    // Очистка ошибок при вводе
    [nameInput, emailInput, phoneInput].forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                const error = this.parentNode.querySelector('.field-error');
                if (error) {
                    error.remove();
                    this.style.borderColor = 'rgba(120, 193, 77, 0.3)';
                }
            });
        }
    });
});

// Language Switch functionality
document.addEventListener('DOMContentLoaded', function() {
  const languageSwitch = document.querySelector('.language-switch');
  if (languageSwitch) {
    const langBtns = languageSwitch.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetLang = btn.getAttribute('href');
        if (targetLang) {
          window.location.href = targetLang;
        }
      });
    });
  }
});
