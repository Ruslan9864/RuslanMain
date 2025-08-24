// Services Page JavaScript Functionality

class ServicesPage {
  constructor() {
    this.subNav = document.getElementById('subNav');
    this.faqItems = document.querySelectorAll('.faq-item');
    this.packageCards = document.querySelectorAll('.package-card');
    this.expressModal = document.getElementById('express-modal');
    this.modalClose = document.querySelector('.modal-close');
    this.currentActiveSection = '';
    
    this.init();
  }

  init() {
    this.setupStickySubNav();
    this.setupFAQ();
    this.setupPackageCards();
    this.setupModal();
    this.setupSmoothScrolling();
    this.setupFormHandling();
    this.setupIntersectionObserver();
    this.setupLanguageSwitcher();
  }

  // Sticky Sub Navigation with Active State
  setupStickySubNav() {
    const subNavLinks = document.querySelectorAll('.sub-nav-link');
    
    // Update active state based on scroll position
    const updateActiveNav = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPos = window.scrollY + 200; // Offset for header height
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          if (this.currentActiveSection !== sectionId) {
            this.currentActiveSection = sectionId;
            
            // Update active nav link
            subNavLinks.forEach(link => {
              link.classList.remove('active');
              if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
              }
            });
          }
        }
      });
    };

    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveNav();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial call
    updateActiveNav();
  }

  // FAQ Accordion Functionality
  setupFAQ() {
    this.faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      question.addEventListener('click', () => {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        
        // Close all other FAQ items
        this.faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherQuestion = otherItem.querySelector('.faq-question');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            
            otherQuestion.setAttribute('aria-expanded', 'false');
            otherAnswer.style.maxHeight = '0';
          }
        });
        
        // Toggle current item
        question.setAttribute('aria-expanded', !isExpanded);
        
        if (!isExpanded) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          answer.style.maxHeight = '0';
        }
      });
      
      // Keyboard support
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    });
  }

  // Package Cards Interactions
  setupPackageCards() {
    this.packageCards.forEach(card => {
      const primaryCta = card.querySelector('.package-cta.primary');
      
      // Pre-fill form when package is selected
      if (primaryCta && primaryCta.getAttribute('href') === '#contact') {
        primaryCta.addEventListener('click', (e) => {
          const packageName = primaryCta.getAttribute('data-package');
          this.preFillForm(packageName);
        });
      }
      
      // Hover effects
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  }

  // Modal Functionality
  setupModal() {
    // Open modal
    const expressLinks = document.querySelectorAll('[href="#express-modal"]');
    expressLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    });
    
    // Close modal
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => {
        this.closeModal();
      });
    }
    
    // Close on outside click
    this.expressModal.addEventListener('click', (e) => {
      if (e.target === this.expressModal) {
        this.closeModal();
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.expressModal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }

  openModal() {
    this.expressModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    const firstFocusable = this.expressModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  closeModal() {
    this.expressModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Return focus to trigger element
    const trigger = document.querySelector('[href="#express-modal"]');
    if (trigger) {
      trigger.focus();
    }
  }

  // Smooth Scrolling with Offset
  setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href === '#express-modal') return; // Skip modal links
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          const headerHeight = document.getElementById('header').offsetHeight;
          const subNavHeight = this.subNav.offsetHeight;
          const totalOffset = headerHeight + subNavHeight + 20;
          
          const targetPosition = target.offsetTop - totalOffset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
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

      // Auto-fill package selection based on URL hash
      this.autoFillPackageFromHash();
    }
  }

  // Pre-fill form with selected package
  preFillForm(packageName) {
    const packageSelect = document.getElementById('package');
    if (packageSelect) {
      const option = Array.from(packageSelect.options).find(opt => 
        opt.text.includes(packageName) || opt.value === packageName.toLowerCase().replace(' ', '-')
      );
      
      if (option) {
        packageSelect.value = option.value;
        packageSelect.dispatchEvent(new Event('change'));
      }
    }
  }

  // Auto-fill package from URL hash
  autoFillPackageFromHash() {
    const hash = window.location.hash;
    if (hash && hash.includes('package=')) {
      const packageParam = new URLSearchParams(hash.split('?')[1]);
      const packageName = packageParam.get('package');
      if (packageName) {
        this.preFillForm(packageName);
      }
    }
  }

  // Handle form submission
  handleFormSubmit(form) {
    const submitBtn = form.querySelector('.form-submit.primary');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Отправляем...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
      submitBtn.textContent = 'Заявка отправлена!';
      submitBtn.style.background = '#10B981';
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        form.reset();
      }, 2000);
    }, 2000);
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
          
          // Special handling for package cards
          if (entry.target.classList.contains('package-card')) {
            this.animatePackageCard(entry.target);
          }
          
          // Special handling for cluster cards
          if (entry.target.classList.contains('cluster-card')) {
            this.animateClusterCard(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe package cards
    document.querySelectorAll('.package-card').forEach(card => {
      observer.observe(card);
    });

    // Observe cluster cards
    document.querySelectorAll('.cluster-card').forEach(card => {
      observer.observe(card);
    });
  }

  // Animate package cards with stagger
  animatePackageCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100);
  }

  // Animate cluster cards with stagger
  animateClusterCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 150);
  }

  // Language Switcher
  setupLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        langButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        
        // Add active class to clicked button
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        
        // Here you would implement actual language switching logic
        const selectedLang = btn.dataset.lang;
        console.log(`Language switched to: ${selectedLang}`);
        
        // Update page content based on language
        this.updatePageLanguage(selectedLang);
      });
    });
  }

  // Update page language (placeholder for actual implementation)
  updatePageLanguage(lang) {
    // This would typically involve:
    // 1. Loading language-specific content
    // 2. Updating all text elements
    // 3. Updating meta tags
    // 4. Updating URLs
    
    console.log(`Updating page content to ${lang}`);
    
    // Example of what this might do:
    if (lang === 'en') {
      // Update to English
      document.querySelector('.hero-title').textContent = 'Branding as a system: strategy → visual → communications';
      document.querySelector('.hero-subtitle').textContent = 'About ROI, status and the calm power of brand';
      // ... more translations
    } else {
      // Update to Russian
      document.querySelector('.hero-title').textContent = 'Брендинг как система: стратегия → визуал → коммуникации';
      document.querySelector('.hero-subtitle').textContent = 'Про ROI, статус и спокойную силу бренда';
      // ... more translations
    }
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
}

// Initialize services page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ServicesPage();
});

// Global function for modal (accessible from HTML)
function closeModal() {
  const modal = document.getElementById('express-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Additional interactive features
document.addEventListener('DOMContentLoaded', () => {
  // Package card hover effects
  const packageCards = document.querySelectorAll('.package-card');
  packageCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.willChange = 'transform';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.willChange = 'auto';
    });
  });

  // Cluster card interactions
  const clusterCards = document.querySelectorAll('.cluster-card');
  clusterCards.forEach(card => {
    const cta = card.querySelector('.cluster-cta');
    
    if (cta) {
      cta.addEventListener('click', (e) => {
        const clusterId = card.id;
        console.log(`Navigating to cluster: ${clusterId}`);
        
        // Here you would implement navigation to detailed service section
        // For now, just scroll to the section
        const targetSection = document.getElementById(`${clusterId}-details`);
        if (targetSection) {
          const headerHeight = document.getElementById('header').offsetHeight;
          const subNavHeight = document.getElementById('subNav').offsetHeight;
          const totalOffset = headerHeight + subNavHeight + 20;
          
          const targetPosition = targetSection.offsetTop - totalOffset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    }
  });

  // Price hover effects
  const priceElements = document.querySelectorAll('.price-range');
  priceElements.forEach(price => {
    price.addEventListener('mouseenter', () => {
      price.style.transform = 'scale(1.05)';
    });
    
    price.addEventListener('mouseleave', () => {
      price.style.transform = 'scale(1)';
    });
  });

  // Timing badge animations
  const timingBadges = document.querySelectorAll('.timing');
  timingBadges.forEach(badge => {
    badge.addEventListener('mouseenter', () => {
      badge.style.transform = 'rotate(5deg)';
    });
    
    badge.addEventListener('mouseleave', () => {
      badge.style.transform = 'rotate(0deg)';
    });
  });

  // Express 72h slots info
  const slotsInfo = document.querySelector('.slots-available');
  if (slotsInfo) {
    slotsInfo.addEventListener('click', () => {
      // Open modal when clicking on slots info
      const modal = document.getElementById('express-modal');
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
    
    // Add cursor pointer
    slotsInfo.style.cursor = 'pointer';
  }

  // Performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Services page load time: ${pageLoadTime}ms`);
      }, 0);
    });
  }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ServicesPage;
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
