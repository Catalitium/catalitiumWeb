// Core functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    initializeMobileMenu();
    initializeSmoothScroll();
    initializeLoadingAnimation();
    initializeIntersectionObserver();
    initializeScrollProgress();
    initializeGoogleAnalytics();
    initializeFeatureCards();
    initializeTypingEffect();
});

// Dark mode functionality
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const mobileDarkModeToggle = document.getElementById('mobileDarkModeToggle');
    const html = document.documentElement;

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    }

    // Toggle dark mode
    function toggleDarkMode() {
        html.classList.toggle('dark');
        localStorage.setItem('darkMode', html.classList.contains('dark'));
    }

    if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
    if (mobileDarkModeToggle) mobileDarkModeToggle.addEventListener('click', toggleDarkMode);
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    let isMobileMenuOpen = false;

    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.addEventListener('click', () => {
        isMobileMenuOpen = !isMobileMenuOpen;
        mobileMenu.classList.toggle('hidden');
        mobileMenuButton.innerHTML = isMobileMenuOpen ? 
            '<i class="fas fa-times text-gray-600 dark:text-gray-300"></i>' : 
            '<i class="fas fa-bars text-gray-600 dark:text-gray-300"></i>';
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMobileMenuOpen && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            isMobileMenuOpen = false;
            mobileMenu.classList.add('hidden');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars text-gray-600 dark:text-gray-300"></i>';
        }
    });

    // Close mobile menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            isMobileMenuOpen = false;
            mobileMenu.classList.add('hidden');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars text-gray-600 dark:text-gray-300"></i>';
        });
    });
}

// Smooth scroll functionality
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Loading animation
function initializeLoadingAnimation() {
    window.addEventListener('load', () => {
        const loader = document.querySelector('.loading');
        if (loader) loader.classList.add('hidden');
    });
}

// Intersection Observer for animations
function initializeIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-4');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-4');
        observer.observe(section);
    });
}

// Scroll progress indicator
function initializeScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-300';
    progressBar.style.width = '0%';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Feature cards hover effect
function initializeFeatureCards() {
    document.querySelectorAll('.group').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// Typing effect for hero text
function initializeTypingEffect() {
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
        const text = heroText.textContent;
        heroText.textContent = '';
        let i = 0;

        function typeWriter() {
            if (i < text.length) {
                heroText.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }

        typeWriter();
    }
}

// Google Analytics initialization
function initializeGoogleAnalytics() {
    // Track PDF downloads
    document.querySelectorAll('a[href$=".pdf"]').forEach(pdfLink => {
        pdfLink.addEventListener('click', function() {
            gtag('event', 'pdf_download', {
                'event_category': 'conversion',
                'event_label': this.getAttribute('href').split('/').pop()
            });
        });
    });

    // Track section visibility
    document.querySelectorAll('section').forEach(section => {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gtag('event', 'section_view', {
                        'event_category': 'content_engagement',
                        'event_label': section.id || 'unnamed_section'
                    });
                }
            });
        });
        sectionObserver.observe(section);
    });

    // Track FAQ interactions
    document.querySelectorAll('.faq-item').forEach(faq => {
        faq.addEventListener('click', function() {
            gtag('event', 'faq_interaction', {
                'event_category': 'content_engagement',
                'event_label': this.querySelector('h3')?.textContent || 'unknown_faq'
            });
        });
    });

    // Track entry point
    gtag('event', 'page_entry', {
        'event_category': 'user_journey',
        'event_label': window.location.pathname
    });

    // Track navigation flow
    let previousPage = document.referrer;
    if (previousPage) {
        gtag('event', 'navigation_flow', {
            'event_category': 'user_journey',
            'event_label': previousPage
        });
    }

    // Track exit intent
    document.addEventListener('mouseout', function(e) {
        if (e.clientY <= 0) {
            gtag('event', 'exit_intent', {
                'event_category': 'user_journey',
                'event_label': 'top_of_page'
            });
        }
    });
} 