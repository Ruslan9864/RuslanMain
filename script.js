// Modern JavaScript for Lebedev-inspired Landing Page

class LandingPage {
  constructor() {
    this.header = document.getElementById('header');
    this.mobileToggle = document.getElementById('mobileToggle');
    this.navMenu = document.getElementById('navMenu');
    this.lastScrollY = window.scrollY;
    this.scrollThreshold = 100;
    this.isScrolling = false;
    
    this.init();
  }

  init() {
    this.setupStickyHeader();
    this.setupIntersectionObserver();
    this.setupSmoothScrolling();
    this.setupLanguageSwitcher();
    this.setupMobileMenu();
    this.setupFormHandling();
    this.setupCaseCards();
    this.setupOfferCards();
    this.preloadImages();
    this.setupScrollProgressBar();
  }

  // Sticky Header with Hide/Show Logic
  setupStickyHeader() {
    const throttledScroll = this.throttle(() => {
      const currentScrollY = window.scrollY;
      
      // Add scrolled class for styling
      if (currentScrollY > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
      
      // Hide/show header logic
      if (currentScrollY > this.scrollThreshold) {
        if (currentScrollY > this.lastScrollY && !this.header.classList.contains('hidden')) {
          // Scrolling down - hide header
          this.header.classList.add('hidden');
        } else if (currentScrollY < this.lastScrollY && this.header.classList.contains('hidden')) {
          // Scrolling up - show header
          this.header.classList.remove('hidden');
        }
      }
      
      this.lastScrollY = currentScrollY;
    }, 16);

    window.addEventListener('scroll', throttledScroll);
  }

  // Intersection Observer for Animations
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          
          // Special handling for staggered animations
          if (entry.target.closest('.offers-grid')) {
            this.animateOfferCards(entry.target.closest('.offers-grid'));
          }
          if (entry.target.closest('.cases-grid')) {
            this.animateCaseCards(entry.target.closest('.cases-grid'));
          }
        }
      });
    }, observerOptions);

    // Observe offer cards
    document.querySelectorAll('.offer-card').forEach(card => {
      observer.observe(card);
    });

    // Observe case cards
    document.querySelectorAll('.case-card').forEach(card => {
      observer.observe(card);
    });

    // Observe CTA content
    const ctaContent = document.querySelector('.cta-content');
    if (ctaContent) {
      observer.observe(ctaContent);
    }
  }

  // Animate Offer Cards with Stagger
  animateOfferCards(container) {
    const cards = container.querySelectorAll('.offer-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('aos-animate');
      }, index * 100);
    });
  }

  // Animate Case Cards with Stagger
  animateCaseCards(container) {
    const cards = container.querySelectorAll('.case-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('aos-animate');
      }, index * 150);
    });
  }

  // Smooth Scrolling for Navigation Links
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        
        if (target) {
          const headerHeight = this.header.offsetHeight;
          const targetPosition = target.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Language Switcher
  setupLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        langButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Here you would implement actual language switching logic
        console.log(`Language switched to: ${btn.dataset.lang}`);
      });
    });
  }

  // Mobile Menu Toggle
  setupMobileMenu() {
    // Create mobile menu if it doesn't exist
    if (!document.querySelector('.mobile-menu')) {
      this.createMobileMenu();
    }

    this.mobileToggle.addEventListener('click', () => {
      this.mobileToggle.classList.toggle('active');
      const mobileMenu = document.querySelector('.mobile-menu');
      mobileMenu.classList.toggle('active');
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking on links
    document.querySelectorAll('.mobile-menu a').forEach(link => {
      link.addEventListener('click', () => {
        this.mobileToggle.classList.remove('active');
        document.querySelector('.mobile-menu').classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Create Mobile Menu Dynamically
  createMobileMenu() {
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    
    mobileMenu.innerHTML = `
      <ul class="mobile-menu-list">
        <li><a href="#services">Услуги</a></li>
        <li><a href="#cases">Кейсы</a></li>
        <li><a href="#about">О нас</a></li>
        <li><a href="#content">Контент</a></li>
        <li><a href="#contacts">Контакты</a></li>
      </ul>
      <a href="#contact" class="mobile-menu-cta">Заказать консультацию</a>
      <div class="mobile-menu-lang">
        <button class="lang-btn active" data-lang="ru">RU</button>
        <button class="lang-btn" data-lang="en">EN</button>
      </div>
    `;
    
    document.body.appendChild(mobileMenu);
    
    // Add event listeners for mobile menu language buttons
    mobileMenu.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        mobileMenu.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Sync with main language buttons
        document.querySelectorAll('.lang-switcher .lang-btn').forEach(mainBtn => {
          mainBtn.classList.toggle('active', mainBtn.dataset.lang === btn.dataset.lang);
        });
      });
    });
  }

  // Form Handling
  setupFormHandling() {
    const form = document.getElementById('ctaForm');
    
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(form);
      });

      // Add input validation and styling
      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
          if (!input.value) {
            input.parentElement.classList.remove('focused');
          }
        });
      });
    }
  }

  // Handle Form Submission
  handleFormSubmit(form) {
    const submitBtn = form.querySelector('.form-submit');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Отправляем...';
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    // Simulate form submission
    setTimeout(() => {
      submitBtn.textContent = 'Заявка отправлена!';
      submitBtn.style.background = '#10B981';
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.style.background = '';
        form.reset();
      }, 2000);
    }, 2000);
  }

  // Case Cards Click Handlers
  setupCaseCards() {
    document.querySelectorAll('.case-card').forEach(card => {
      card.addEventListener('click', () => {
        const title = card.querySelector('h3').textContent;
        console.log(`Opening case: ${title}`);
        // Here you would implement modal opening or navigation to case details
      });
    });
  }

  // Offer Cards Click Handlers
  setupOfferCards() {
    document.querySelectorAll('.offer-card').forEach(card => {
      card.addEventListener('click', () => {
        const service = card.querySelector('.offer-text').textContent;
        console.log(`Selected service: ${service}`);
        // Here you would implement service selection logic
      });
    });
  }

  // Preload Images for Better Performance
  preloadImages() {
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
      const imageLoader = new Image();
      imageLoader.src = img.src;
    });
  }

  // Scroll Progress Bar
  setupScrollProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-turquoise), var(--primary-red));
      z-index: 9999;
      transition: width 0.25s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    const updateProgress = this.throttle(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      progressBar.style.width = scrollPercent + '%';
    }, 16);
    
    window.addEventListener('scroll', updateProgress);
  }

  // Utility function for throttling
  throttle(func, wait) {
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

  // Utility function for debouncing
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
}

// Initialize the landing page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LandingPage();
});

// Add some additional interactive features
document.addEventListener('DOMContentLoaded', () => {
  // Logo click handler
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Add parallax effect to hero section
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const parallax = scrolled * 0.5;
      hero.style.transform = `translateY(${parallax}px)`;
    });
  }

  // Add hover sound effects (optional)
  const interactiveElements = document.querySelectorAll('.cta-btn, .hero-cta, .case-card, .offer-card');
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      // You could add subtle sound effects here
      element.style.willChange = 'transform';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.willChange = 'auto';
    });
  });

  // Keyboard navigation improvements
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close mobile menu
      const mobileMenu = document.querySelector('.mobile-menu');
      const mobileToggle = document.querySelector('.mobile-toggle');
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('.cta-btn, .hero-cta, .form-submit, .case-btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Add CSS for ripple animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log(`Page load time: ${pageLoadTime}ms`);
    }, 0);
  });
}

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('/sw.js')
    //   .then(registration => console.log('SW registered'))
    //   .catch(error => console.log('SW registration failed'));
  });
}

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