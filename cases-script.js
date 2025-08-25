// Cases Page JavaScript

// Case data for modals
const caseData = {
    hilton: {
        title: "Hilton Samarkand",
        category: "HoReCa",
        task: "Ребрендинг премиального отеля в историческом центре Самарканда для повышения узнаваемости и привлечения международных туристов.",
        approach: "Провели глубокий анализ конкурентов и целевой аудитории. Создали уникальную визуальную идентичность, объединяющую современный люкс и восточную эстетику. Разработали комплексную коммуникационную стратегию.",
        result: "Новый бренд помог отелю занять лидирующие позиции в регионе, привлечь премиальную аудиторию и увеличить средний чек.",
        roi: {
            bookings: "+280%",
            revenue: "+150%",
            recognition: "+320%",
            satisfaction: "4.9/5"
        },
        testimonial: "Руслан создал бренд, который идеально отражает дух нашего отеля. Результаты превзошли все ожидания.",
        author: "Менеджер по маркетингу, Hilton Samarkand"
    },
    srs: {
        title: "Silk Road Samarkand",
        category: "Девелопмент",
        task: "Создание бренда для крупнейшего туристического комплекса в Узбекистане, объединяющего отели, рестораны и развлекательные зоны.",
        approach: "Разработали стратегию позиционирования как 'Ворота в историю'. Создали визуальную систему, отражающую богатое культурное наследие региона. Интегрировали бренд во все точки контакта.",
        result: "Комплекс стал узнаваемым символом туризма в Узбекистане, привлекая как местных, так и иностранных гостей.",
        roi: {
            visitors: "+450%",
            sales: "+320%",
            media: "+280%",
            partnerships: "+180%"
        },
        testimonial: "Профессиональный подход и глубокое понимание местного контекста помогли создать уникальный бренд.",
        author: "Директор по развитию, Silk Road Samarkand"
    },
    restaurant: {
        title: "Ресторан 'Ритм'",
        category: "HoReCa",
        task: "Создание бренда с нуля для нового ресторана в центре города, специализирующегося на современной узбекской кухне.",
        approach: "Провели исследование целевой аудитории и конкурентов. Создали концепцию 'Традиции в современном ритме'. Разработали запоминающийся логотип и фирменный стиль.",
        result: "Ресторан быстро стал популярным местом среди местных жителей и туристов, создав уникальную атмосферу.",
        roi: {
            customers: "+180%",
            repeat: "+90%",
            reviews: "4.8/5",
            social: "+250%"
        },
        testimonial: "Бренд помог нам выделиться среди конкурентов и создать лояльную клиентскую базу.",
        author: "Владелец ресторана 'Ритм'"
    },
    tech: {
        title: "FinTech Startup",
        category: "B2C",
        task: "Ребрендинг финансового стартапа для повышения доверия пользователей и увеличения конверсии.",
        approach: "Провели аудит существующего бренда и анализ конкурентов. Создали новую визуальную идентичность, подчеркивающую надежность и инновационность. Обновили UX/UI дизайн.",
        result: "Новый бренд значительно повысил доверие пользователей и улучшил показатели конверсии.",
        roi: {
            conversion: "+340%",
            registrations: "+220%",
            trust: "+180%",
            retention: "+150%"
        },
        testimonial: "Ребрендинг помог нам завоевать доверие пользователей и увеличить рост бизнеса.",
        author: "CEO, FinTech Startup"
    },
    ecommerce: {
        title: "E-commerce Platform",
        category: "B2C",
        task: "Создание визуальной идентичности для онлайн-магазина, специализирующегося на премиальных товарах.",
        approach: "Разработали стратегию позиционирования как 'Премиум доступен каждому'. Создали элегантный и современный дизайн, подчеркивающий качество товаров.",
        result: "Новая идентичность помогла привлечь премиальную аудиторию и увеличить средний чек.",
        roi: {
            sales: "+520%",
            cart: "+180%",
            premium: "+250%",
            loyalty: "+200%"
        },
        testimonial: "Дизайн помог нам позиционироваться как премиальный бренд и привлечь качественную аудиторию.",
        author: "Маркетинг-директор, E-commerce Platform"
    },
    medical: {
        title: "Медицинский центр",
        category: "B2C",
        task: "Создание доверительного бренда для медицинской клиники, специализирующейся на профилактической медицине.",
        approach: "Провели исследование восприятия медицинских брендов. Создали теплую и доверительную визуальную идентичность. Разработали коммуникационную стратегию, подчеркивающую заботу о пациентах.",
        result: "Новый бренд помог преодолеть страх перед медицинскими процедурами и увеличить количество записей.",
        roi: {
            appointments: "+390%",
            trust: "+250%",
            referrals: "+180%",
            satisfaction: "4.9/5"
        },
        testimonial: "Бренд помог нам создать атмосферу доверия и заботы, что очень важно в медицине.",
        author: "Главный врач, Медицинский центр"
    }
};

// Filter functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const caseCards = document.querySelectorAll('.case-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cases
            caseCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.6s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});

// Modal functionality
function openCaseModal(caseId) {
    const modal = document.getElementById('caseModal');
    const modalBody = modal.querySelector('.modal-body');
    const caseInfo = caseData[caseId];
    
    if (!caseInfo) return;
    
    // Create modal content
    modalBody.innerHTML = `
        <div class="case-detail">
            <div class="case-detail-images">
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop" alt="${caseInfo.title}" class="case-detail-image">
            </div>
            <div class="case-detail-info">
                <h2>${caseInfo.title}</h2>
                <div class="case-detail-category">${caseInfo.category}</div>
                
                <div class="case-detail-section">
                    <h3>Задача</h3>
                    <p>${caseInfo.task}</p>
                </div>
                
                <div class="case-detail-section">
                    <h3>Подход</h3>
                    <p>${caseInfo.approach}</p>
                </div>
                
                <div class="case-detail-section">
                    <h3>Результат</h3>
                    <p>${caseInfo.result}</p>
                </div>
                
                <div class="case-detail-stats">
                    ${Object.entries(caseInfo.roi).map(([key, value]) => `
                        <div class="case-detail-stat">
                            <span class="case-detail-stat-number">${value}</span>
                            <span class="case-detail-stat-label">${getStatLabel(key)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="case-detail-testimonial">
                    <blockquote>${caseInfo.testimonial}</blockquote>
                    <cite>— ${caseInfo.author}</cite>
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCaseModal() {
    const modal = document.getElementById('caseModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Helper function to get readable stat labels
function getStatLabel(key) {
    const labels = {
        bookings: 'Бронирования',
        revenue: 'Выручка',
        recognition: 'Узнаваемость',
        satisfaction: 'Удовлетворенность',
        visitors: 'Посетители',
        sales: 'Продажи',
        media: 'Медиа упоминания',
        partnerships: 'Партнерства',
        customers: 'Клиенты',
        repeat: 'Повторные',
        reviews: 'Отзывы',
        social: 'Соцсети',
        conversion: 'Конверсия',
        registrations: 'Регистрации',
        trust: 'Доверие',
        retention: 'Удержание',
        cart: 'Корзина',
        premium: 'Премиум',
        loyalty: 'Лояльность',
        appointments: 'Записи',
        referrals: 'Рекомендации'
    };
    
    return labels[key] || key;
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('caseModal');
    if (e.target === modal) {
        closeCaseModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCaseModal();
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe case cards for animation
document.querySelectorAll('.case-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(card);
});
