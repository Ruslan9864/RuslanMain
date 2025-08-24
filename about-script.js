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
    
    // Модальное окно для медиакита
    const modal = document.getElementById('media-kit');
    const mediaKitLinks = document.querySelectorAll('a[href="#media-kit"]');
    const closeBtn = document.querySelector('.close');
    
    // Открытие модального окна
    mediaKitLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Закрытие модального окна
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Закрытие по клику вне модального окна
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Плавная прокрутка для якорных ссылок
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#media-kit') return; // Пропускаем медиакит
            
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
    const animateElements = document.querySelectorAll('.value-item, .timeline-item, .testimonial, .cv-item');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Анимация CV чисел
    const cvNumbers = document.querySelectorAll('.cv-number');
    const cvObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                cvObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    cvNumbers.forEach(number => {
        cvObserver.observe(number);
    });
    
    // Функция анимации чисел
    function animateNumber(element) {
        const finalNumber = element.textContent;
        const isPlus = finalNumber.includes('+');
        const numericValue = parseInt(finalNumber.replace('+', ''));
        
        let current = 0;
        const increment = numericValue / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                current = numericValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (isPlus ? '+' : '');
        }, 30);
    }
    
    // Анимация таймлайна
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('timeline-animate');
            }
        });
    }, { threshold: 0.3 });
    
    timelineItems.forEach(item => {
        timelineObserver.observe(item);
    });
    
    // Анимация ритм-метафоры
    const rhythmAnimation = document.querySelector('.rhythm-animation');
    if (rhythmAnimation) {
        const rhythmObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('rhythm-active');
                }
            });
        }, { threshold: 0.5 });
        
        rhythmObserver.observe(rhythmAnimation);
    }
    
    // Параллакс эффект для hero секции
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Анимация значений при наведении
    const valueItems = document.querySelectorAll('.value-item');
    valueItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.value-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.value-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
    
    // Анимация партнерских логотипов
    const partnerLogos = document.querySelectorAll('.partner-logo');
    partnerLogos.forEach(logo => {
        logo.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Анимация CTA кнопок
    const ctaButtons = document.querySelectorAll('.cta-btn');
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Анимация появления для миссии
    const missionText = document.querySelector('.mission-text');
    if (missionText) {
        const missionObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('mission-animate');
                }
            });
        }, { threshold: 0.5 });
        
        missionObserver.observe(missionText);
    }
    
    // Анимация для эксперта
    const expertPhoto = document.querySelector('.expert-photo');
    if (expertPhoto) {
        const expertObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('expert-animate');
                }
            });
        }, { threshold: 0.5 });
        
        expertObserver.observe(expertPhoto);
    }
    
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
        
        .timeline-item {
            opacity: 0;
            transform: translateX(-50px);
            transition: all 0.8s ease;
        }
        
        .timeline-item:nth-child(even) {
            transform: translateX(50px);
        }
        
        .timeline-item.timeline-animate {
            opacity: 1;
            transform: translateX(0);
        }
        
        .rhythm-animation {
            opacity: 0;
            transform: scale(0.8);
            transition: all 1s ease;
        }
        
        .rhythm-animation.rhythm-active {
            opacity: 1;
            transform: scale(1);
        }
        
        .mission-text {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.8s ease;
        }
        
        .mission-text.mission-animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .expert-photo {
            opacity: 0;
            transform: scale(0.9);
            transition: all 0.8s ease;
        }
        
        .expert-photo.expert-animate {
            opacity: 1;
            transform: scale(1);
        }
        
        .value-icon {
            transition: all 0.3s ease;
        }
        
        .partner-logo {
            transition: all 0.3s ease;
        }
        
        .cta-btn {
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
        const parallaxElements = document.querySelectorAll('.mission-values, .timeline, .expert, .social-proof');
        
        parallaxElements.forEach((element, index) => {
            const rate = scrolled * (0.1 + index * 0.02);
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
