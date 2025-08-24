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
    
    // FAQ Аккордеон
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const answer = this.nextElementSibling;
            
            // Закрываем все другие ответы
            faqQuestions.forEach(q => {
                if (q !== this) {
                    q.setAttribute('aria-expanded', 'false');
                    q.nextElementSibling.hidden = true;
                }
            });
            
            // Переключаем текущий ответ
            this.setAttribute('aria-expanded', !isExpanded);
            answer.hidden = isExpanded;
            
            // Анимация для плавности
            if (!isExpanded) {
                answer.style.opacity = '0';
                answer.style.transform = 'translateY(-10px)';
                answer.hidden = false;
                
                setTimeout(() => {
                    answer.style.transition = 'all 0.3s ease';
                    answer.style.opacity = '1';
                    answer.style.transform = 'translateY(0)';
                }, 10);
            }
        });
        
        // Добавляем поддержку клавиатуры
        question.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Модальное окно для подписки на воркшопы
    const workshopSignup = document.getElementById('workshop-signup');
    const workshopModal = document.getElementById('workshop-modal');
    const closeBtn = document.querySelector('.close');
    
    if (workshopSignup && workshopModal) {
        workshopSignup.addEventListener('click', function() {
            workshopModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Фокус на первое поле формы
            const firstInput = workshopModal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            workshopModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Закрытие модального окна по клику вне его
    if (workshopModal) {
        window.addEventListener('click', function(e) {
            if (e.target === workshopModal) {
                workshopModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Закрытие модального окна по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && workshopModal && workshopModal.style.display === 'block') {
            workshopModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Форма подписки на воркшопы
    const signupForm = document.querySelector('.signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('signup-email').value.trim();
            const interests = document.getElementById('signup-interests').value;
            
            if (email) {
                // Имитация отправки формы
                showSignupSuccess();
                
                // Очищаем форму
                signupForm.reset();
                
                // Закрываем модальное окно через 2 секунды
                setTimeout(() => {
                    workshopModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 2000);
            }
        });
    }
    
    // Показ сообщения об успешной подписке
    function showSignupSuccess() {
        const modalContent = document.querySelector('.modal-content');
        const originalContent = modalContent.innerHTML;
        
        modalContent.innerHTML = `
            <div class="signup-success">
                <div class="success-icon">✓</div>
                <h2>Спасибо за подписку!</h2>
                <p>Мы уведомим вас о новых воркшопах и курсах</p>
            </div>
        `;
        
        // Восстанавливаем содержимое через 2 секунды
        setTimeout(() => {
            modalContent.innerHTML = originalContent;
        }, 2000);
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
    const animateElements = document.querySelectorAll('.faq-item, .workshop-block, .english-version');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Анимация кнопок при наведении
    const buttons = document.querySelectorAll('.workshop-cta, .english-btn, .signup-submit');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Анимация FAQ элементов при наведении
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(120, 193, 77, 0.3)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
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
        
        .faq-item {
            transition: all 0.3s ease;
        }
        
        .workshop-block {
            transition: all 0.3s ease;
        }
        
        .workshop-cta,
        .english-btn,
        .signup-submit {
            transition: all 0.3s ease;
        }
        
        .faq-answer {
            transition: all 0.3s ease;
        }
        
        .signup-success {
            text-align: center;
            padding: 2rem 0;
        }
        
        .success-icon {
            width: 60px;
            height: 60px;
            background: var(--primary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 2rem;
            color: #000000;
            font-weight: bold;
        }
        
        .signup-success h2 {
            color: #ffffff;
            margin-bottom: 1rem;
        }
        
        .signup-success p {
            color: #cccccc;
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
        const parallaxElements = document.querySelectorAll('.faq-section, .workshops-section, .english-version');
        
        parallaxElements.forEach((element, index) => {
            const rate = scrolled * (0.03 + index * 0.01);
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
    
    // Дополнительная функциональность для FAQ
    let openFAQ = null;
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            
            // Если открыт другой FAQ, закрываем его
            if (openFAQ && openFAQ !== this) {
                const openAnswer = openFAQ.nextElementSibling;
                openFAQ.setAttribute('aria-expanded', 'false');
                openAnswer.hidden = true;
            }
            
            // Переключаем текущий FAQ
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            answer.hidden = isExpanded;
            
            // Запоминаем открытый FAQ
            if (!isExpanded) {
                openFAQ = this;
            } else {
                openFAQ = null;
            }
        });
    });
    
    // Анимация для воркшоп блока
    const workshopBlock = document.querySelector('.workshop-block');
    if (workshopBlock) {
        workshopBlock.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 10px 30px rgba(120, 193, 77, 0.3)';
        });
        
        workshopBlock.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    }
    
    // Валидация email в форме подписки
    const signupEmail = document.getElementById('signup-email');
    if (signupEmail) {
        signupEmail.addEventListener('blur', function() {
            const email = this.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email && !emailRegex.test(email)) {
                this.style.borderColor = '#FF6B6B';
                this.setCustomValidity('Введите корректный email');
            } else {
                this.style.borderColor = 'rgba(120, 193, 77, 0.3)';
                this.setCustomValidity('');
            }
        });
        
        signupEmail.addEventListener('input', function() {
            this.style.borderColor = 'rgba(120, 193, 77, 0.3)';
            this.setCustomValidity('');
        });
    }
    
    // Сохранение состояния открытых FAQ в localStorage
    function saveFAQState() {
        const openFAQId = openFAQ ? openFAQ.getAttribute('aria-controls') : null;
        if (openFAQId) {
            localStorage.setItem('openFAQ', openFAQId);
        } else {
            localStorage.removeItem('openFAQ');
        }
    }
    
    function restoreFAQState() {
        const openFAQId = localStorage.getItem('openFAQ');
        if (openFAQId) {
            const question = document.querySelector(`[aria-controls="${openFAQId}"]`);
            if (question) {
                question.click();
            }
        }
    }
    
    // Сохраняем состояние при изменении
    faqQuestions.forEach(question => {
        question.addEventListener('click', saveFAQState);
    });
    
    // Восстанавливаем состояние при загрузке
    window.addEventListener('load', restoreFAQState);
});
