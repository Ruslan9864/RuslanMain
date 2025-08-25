// Modern JavaScript for RHYTHM Branding Agency

class LandingPage {
  constructor() {
    this.header = document.querySelector('.header');
    this.mobileToggle = document.querySelector('.nav-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    this.stickyCta = document.getElementById('stickyCta');
    this.lastScrollY = window.scrollY;
    this.scrollThreshold = 100;
    this.isScrolling = false;
    
    this.init();
  }

  init() {
    this.setupStickyHeader();
    this.setupStickyCta();
    this.setupIntersectionObserver();
    this.setupSmoothScrolling();
    this.setupLanguageSwitcher();
    this.setupMobileMenu();
    this.setupFormHandling();
    this.setupCaseCards();
    this.setupAdvantageCards();
    this.preloadImages();
    this.setupScrollProgressBar();
    this.setupQuickNavigation();
    this.setupServicesForm();
    this.setupBlog(); // Add this line to initialize blog functionality
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

  // Sticky CTA functionality
  setupStickyCta() {
    if (this.stickyCta) {
      let lastScrollTop = 0;
      const showThreshold = 300; // Show after scrolling 300px
      
      window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > showThreshold) {
          if (scrollTop > lastScrollTop) {
            // Scrolling down - show sticky CTA
            this.stickyCta.classList.add('show');
          } else {
            // Scrolling up - keep showing
            this.stickyCta.classList.add('show');
          }
        } else {
          // Near top - hide sticky CTA
          this.stickyCta.classList.remove('show');
        }
        
        lastScrollTop = scrollTop;
      });
    }
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
          if (entry.target.closest('.advantages-grid')) {
            this.animateAdvantageCards(entry.target.closest('.advantages-grid'));
          }
          if (entry.target.closest('.cases-grid')) {
            this.animateCaseCards(entry.target.closest('.cases-grid'));
          }
        }
      });
    }, observerOptions);

    // Observe advantage cards
    document.querySelectorAll('.advantage-card').forEach(card => {
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

  // Animate Advantage Cards with Stagger
  animateAdvantageCards(container) {
    const cards = container.querySelectorAll('.advantage-card');
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
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all buttons
        langButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Handle language switching
        const targetLang = btn.getAttribute('href');
        if (targetLang) {
          window.location.href = targetLang;
        }
      });
    });
  }

  // Mobile Menu Toggle
  setupMobileMenu() {
    if (this.mobileToggle && this.navMenu) {
      this.mobileToggle.addEventListener('click', () => {
        this.mobileToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
      });

      // Close mobile menu when clicking on links
      this.navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          this.mobileToggle.classList.remove('active');
          this.navMenu.classList.remove('active');
          document.body.style.overflow = '';
        });
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (event) => {
        if (!event.target.closest('.nav') && !event.target.closest('.nav-toggle')) {
          this.navMenu.classList.remove('active');
          this.mobileToggle.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
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
      submitBtn.textContent = 'Спасибо! Скоро свяжемся';
      submitBtn.style.background = 'var(--accent-color)';
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.style.background = '';
        form.reset();
      }, 3000);
    }, 2000);
  }

  // Case Cards Click Handlers
  setupCaseCards() {
    document.querySelectorAll('.case-card').forEach(card => {
      card.addEventListener('click', () => {
        // Add click effect
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
          card.style.transform = '';
        }, 150);
        
        const title = card.querySelector('h3').textContent;
        console.log(`Opening case: ${title}`);
        // Navigation to case details is handled by href in the card
      });
    });
  }

  // Advantage Cards Click Handlers
  setupAdvantageCards() {
    document.querySelectorAll('.advantage-card').forEach(card => {
      card.addEventListener('click', () => {
        // Add click effect
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
          card.style.transform = '';
        }, 150);
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
      background: linear-gradient(90deg, var(--accent-color), var(--accent-hover));
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

  // Setup smooth scrolling for quick navigation
  setupQuickNavigation() {
      const quickNavLinks = document.querySelectorAll('.quick-nav-link');
      
      quickNavLinks.forEach(link => {
          link.addEventListener('click', (e) => {
              e.preventDefault();
              const targetId = link.getAttribute('href').substring(1);
              const targetElement = document.getElementById(targetId);
              
              if (targetElement) {
                  const headerHeight = this.header.offsetHeight;
                  const quickNavHeight = document.querySelector('.quick-nav')?.offsetHeight || 0;
                  const offset = headerHeight + quickNavHeight + 20;
                  
                  window.scrollTo({
                      top: targetElement.offsetTop - offset,
                      behavior: 'smooth'
                  });
              }
          });
      });
  }

  // Setup form submission for services page
  setupServicesForm() {
      const form = document.getElementById('ctaForm');
      if (!form) return;
      
      form.addEventListener('submit', (e) => {
          e.preventDefault();
          
          // Get form data
          const formData = new FormData(form);
          const data = Object.fromEntries(formData);
          
          // Show success message
          this.showFormMessage(form, 'Спасибо! Скоро свяжемся с вами для обсуждения проекта.', 'success');
          
          // Reset form after delay
          setTimeout(() => {
              form.reset();
          }, 3000);
      });
  }

  // Show form message
  showFormMessage(form, message, type = 'success') {
      // Remove existing messages
      const existingMessage = form.querySelector('.form-message');
      if (existingMessage) {
          existingMessage.remove();
      }
      
      // Create message element
      const messageElement = document.createElement('div');
      messageElement.className = `form-message ${type}`;
      messageElement.textContent = message;
      messageElement.style.cssText = `
          padding: var(--spacing-sm);
          margin-top: var(--spacing-md);
          border-radius: var(--border-radius-sm);
          text-align: center;
          font-weight: 500;
      `;
      
      if (type === 'success') {
          messageElement.style.background = 'rgba(120, 193, 77, 0.1)';
          messageElement.style.color = '#5a9a3a';
          messageElement.style.border = '1px solid rgba(120, 193, 77, 0.3)';
      } else {
          messageElement.style.background = 'rgba(220, 53, 69, 0.1)';
          messageElement.style.color = '#dc3545';
          messageElement.style.border = '1px solid rgba(220, 53, 69, 0.3)';
      }
      
      // Insert message after form
      form.parentNode.insertBefore(messageElement, form.nextSibling);
      
      // Auto-remove message after 5 seconds
      setTimeout(() => {
          if (messageElement.parentNode) {
              messageElement.remove();
          }
      }, 5000);
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

    // Setup blog functionality
    setupBlog() {
        this.setupArticleFilters();
        this.setupVideoPlaylists();
        this.setupBlogSearch();
        this.setupFAQAccordion();
        this.setupLeadMagnetForms();
        this.setupNewsletterSubscription();
        this.setupLoadMore();
        this.setupTableOfContents();
        this.setupROICalculator();
    }

    // Article filtering by category
    setupArticleFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const articleCards = document.querySelectorAll('.article-card');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                
                // Update active filter button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter articles
                articleCards.forEach(card => {
                    if (category === 'all' || card.getAttribute('data-category') === category) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeInUp 0.5s ease-out';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Video playlist tabs
    setupVideoPlaylists() {
        const playlistTabs = document.querySelectorAll('.playlist-tab');
        const playlistContents = document.querySelectorAll('.playlist-content');

        playlistTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const playlist = tab.getAttribute('data-playlist');
                
                // Update active tab
                playlistTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding content
                playlistContents.forEach(content => {
                    if (content.getAttribute('data-playlist') === playlist) {
                        content.classList.add('active');
                        content.style.animation = 'fadeInUp 0.5s ease-out';
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });
    }

    // Blog search functionality
    setupBlogSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        const articleCards = document.querySelectorAll('.article-card');

        if (!searchInput || !searchBtn) return;

        const performSearch = () => {
            const query = searchInput.value.toLowerCase().trim();
            
            if (query === '') {
                // Show all articles if search is empty
                articleCards.forEach(card => {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.3s ease-out';
                });
                return;
            }

            articleCards.forEach(card => {
                const title = card.querySelector('h3 a').textContent.toLowerCase();
                const content = card.querySelector('p').textContent.toLowerCase();
                const category = card.querySelector('.article-category').textContent.toLowerCase();
                
                if (title.includes(query) || content.includes(query) || category.includes(query)) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.3s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        };

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // FAQ accordion functionality
    setupFAQAccordion() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const isOpen = answer.style.display === 'block';
                
                // Close all other FAQ items
                faqQuestions.forEach(q => {
                    const a = q.nextElementSibling;
                    if (a !== answer) {
                        a.style.display = 'none';
                        q.style.background = 'var(--color-background-alt)';
                    }
                });
                
                // Toggle current FAQ item
                if (isOpen) {
                    answer.style.display = 'none';
                    question.style.background = 'var(--color-background-alt)';
                } else {
                    answer.style.display = 'block';
                    question.style.background = 'var(--color-border)';
                    answer.style.animation = 'fadeInUp 0.3s ease-out';
                }
            });
        });
    }

    // Lead magnet form handling
    setupLeadMagnetForms() {
        const magnetForms = document.querySelectorAll('.magnet-form');
        
        magnetForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = form.querySelector('input[type="email"]').value;
                const button = form.querySelector('.magnet-btn');
                const originalText = button.textContent;
                
                if (this.validateEmail(email)) {
                    // Simulate form submission
                    button.textContent = 'Отправляем...';
                    button.disabled = true;
                    
                    setTimeout(() => {
                        button.textContent = 'Готово!';
                        button.style.background = 'var(--color-accent-dark)';
                        
                        // Show success message
                        this.showNotification('Материал отправлен на ваш email!', 'success');
                        
                        // Reset form after delay
                        setTimeout(() => {
                            form.reset();
                            button.textContent = originalText;
                            button.disabled = false;
                            button.style.background = '';
                        }, 2000);
                    }, 1500);
                } else {
                    this.showNotification('Пожалуйста, введите корректный email', 'error');
                }
            });
        });
    }

    // Newsletter subscription
    setupNewsletterSubscription() {
        const subscribeForm = document.querySelector('.subscribe-form');
        
        if (subscribeForm) {
            subscribeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = subscribeForm.querySelector('input[type="email"]').value;
                const emailCheckbox = subscribeForm.querySelector('input[name="email"]');
                const telegramCheckbox = subscribeForm.querySelector('input[name="telegram"]');
                const button = subscribeForm.querySelector('.subscribe-btn');
                const originalText = button.textContent;
                
                if (!this.validateEmail(email)) {
                    this.showNotification('Пожалуйста, введите корректный email', 'error');
                    return;
                }
                
                if (!emailCheckbox.checked && !telegramCheckbox.checked) {
                    this.showNotification('Выберите хотя бы один способ подписки', 'error');
                    return;
                }
                
                // Simulate subscription
                button.textContent = 'Подписываем...';
                button.disabled = true;
                
                setTimeout(() => {
                    button.textContent = 'Подписались!';
                    button.style.background = 'var(--color-accent-dark)';
                    
                    this.showNotification('Вы успешно подписались на обновления!', 'success');
                    
                    // Reset form after delay
                    setTimeout(() => {
                        subscribeForm.reset();
                        button.textContent = originalText;
                        button.disabled = false;
                        button.style.background = '';
                    }, 2000);
                }, 1500);
            });
        }
    }

    // Email validation
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        if (type === 'success') {
            notification.style.background = 'var(--color-accent)';
        } else if (type === 'error') {
            notification.style.background = '#e74c3c';
        } else {
            notification.style.background = '#3498db';
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Load more articles functionality
    setupLoadMore() {
        const loadMoreBtn = document.querySelector('.load-more-btn');
        
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                // Simulate loading more articles
                loadMoreBtn.textContent = 'Загружаем...';
                loadMoreBtn.disabled = true;
                
                setTimeout(() => {
                    // Here you would typically fetch more articles from the server
                    this.showNotification('Функция загрузки дополнительных статей будет доступна в полной версии', 'info');
                    
                    loadMoreBtn.textContent = 'Загрузить еще статьи';
                    loadMoreBtn.disabled = false;
                }, 2000);
            });
        }
    }

    // Table of contents smooth scrolling
    setupTableOfContents() {
        const tocLinks = document.querySelectorAll('.article-toc a');
        
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = this.header.offsetHeight;
                    const offset = headerHeight + 20;
                    
                    window.scrollTo({
                        top: targetElement.offsetTop - offset,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ROI calculator functionality
    setupROICalculator() {
        const roiInputs = document.querySelectorAll('.roi-input');
        const roiResult = document.querySelector('.roi-result .result-value');
        
        if (roiInputs.length && roiResult) {
            const calculateROI = () => {
                const avgCheck = parseFloat(roiInputs[0].value) || 0;
                const customers = parseFloat(roiInputs[1].value) || 0;
                
                if (avgCheck > 0 && customers > 0) {
                    // Calculate potential growth (40% average increase)
                    const growth = avgCheck * 0.4 * customers;
                    roiResult.textContent = `+${growth.toLocaleString('ru-RU')} сум/месяц`;
                } else {
                    roiResult.textContent = 'Введите данные для расчета';
                }
            };
            
            roiInputs.forEach(input => {
                input.addEventListener('input', calculateROI);
            });
        }
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
  const interactiveElements = document.querySelectorAll('.cta-btn, .hero-cta, .case-card, .advantage-card');
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
      const navMenu = document.querySelector('.nav-menu');
      const mobileToggle = document.querySelector('.nav-toggle');
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
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

  // Footer accordion functionality for mobile
  setupFooterAccordion();
  
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

// Footer accordion functionality
function setupFooterAccordion() {
  const footerSections = document.querySelectorAll('.footer-section');
  
  footerSections.forEach(section => {
    const heading = section.querySelector('h3');
    const content = section.querySelector('ul, .footer-contacts, .footer-social, .footer-mission');
    
    if (heading && content) {
      // Add accordion button functionality
      heading.style.cursor = 'pointer';
      heading.setAttribute('role', 'button');
      heading.setAttribute('tabindex', '0');
      heading.setAttribute('aria-expanded', 'true');
      
      // Add visual indicator for mobile
      const indicator = document.createElement('span');
      indicator.className = 'accordion-indicator';
      indicator.innerHTML = '▼';
      indicator.style.cssText = `
        display: none;
        margin-left: 8px;
        transition: transform 0.3s ease;
        font-size: 12px;
        color: var(--accent-color);
      `;
      heading.appendChild(indicator);
      
      // Toggle functionality
      const toggleAccordion = () => {
        const isExpanded = heading.getAttribute('aria-expanded') === 'true';
        heading.setAttribute('aria-expanded', !isExpanded);
        
        if (isExpanded) {
          content.style.display = 'none';
          indicator.style.transform = 'rotate(-90deg)';
        } else {
          content.style.display = 'block';
          indicator.style.transform = 'rotate(0deg)';
        }
      };
      
      // Event listeners
      heading.addEventListener('click', toggleAccordion);
      heading.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAccordion();
        }
      });
      
      // Show indicator only on mobile
      const showIndicatorOnMobile = () => {
        if (window.innerWidth <= 768) {
          indicator.style.display = 'inline-block';
          content.style.display = 'none';
          heading.setAttribute('aria-expanded', 'false');
        } else {
          indicator.style.display = 'none';
          content.style.display = 'block';
          heading.setAttribute('aria-expanded', 'true');
        }
      };
      
      // Initial setup and resize handling
      showIndicatorOnMobile();
      window.addEventListener('resize', showIndicatorOnMobile);
    }
  });
}

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