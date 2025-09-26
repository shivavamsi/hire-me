export class ScrollEffects {
    constructor() {
        this.animatedElements = [];
        this.parallaxElements = [];
        this.observer = null;
        this.isReducedMotion = false;
        this.lastScrollTop = 0;
    }

    async init() {
        try {
            this.isReducedMotion = this.checkReducedMotionPreference();

            if (!this.isReducedMotion) {
                this.setupIntersectionObserver();
                this.findAnimatableElements();
                this.setupParallaxElements();
            }

        } catch (error) {
            console.error('Error initializing ScrollEffects:', error);
        }
    }

    checkReducedMotionPreference() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0]
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.handleIntersection(entry);
            });
        }, options);
    }

    findAnimatableElements() {
        const selectors = [
            '.card',
            '.hero-section h1',
            '.hero-section h2',
            '.hero-section p',
            '.hero-section .btn',
            'section h2',
            '.profile-image',
            '.badge'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                this.prepareElementForAnimation(element, index);
                this.observer?.observe(element);
            });
        });
    }

    prepareElementForAnimation(element, index = 0) {
        if (this.isReducedMotion) return;

        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;

        this.animatedElements.push(element);
    }

    handleIntersection(entry) {
        if (this.isReducedMotion) return;

        const element = entry.target;

        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            this.animateIn(element);
        }
    }

    animateIn(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';

        if (element.classList.contains('card')) {
            element.addEventListener('transitionend', () => {
                this.addHoverEffects(element);
            }, { once: true });
        }
    }

    addHoverEffects(element) {
        if (this.isReducedMotion) return;

        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-5px) scale(1.02)';
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0) scale(1)';
        });
    }

    setupParallaxElements() {
        if (this.isReducedMotion) return;

        const parallaxCandidates = document.querySelectorAll('.hero-section, .profile-image-container');

        parallaxCandidates.forEach(element => {
            this.parallaxElements.push({
                element: element,
                speed: element.classList.contains('hero-section') ? 0.3 : 0.5,
                offset: 0
            });
        });
    }

    handleScroll() {
        if (this.isReducedMotion || this.parallaxElements.length === 0) return;

        const scrollTop = window.pageYOffset;

        // Only update if scroll position changed significantly
        if (Math.abs(scrollTop - this.lastScrollTop) < 2) return;
        this.lastScrollTop = scrollTop;

        // Use passive transform with will-change for better performance
        requestAnimationFrame(() => {
            this.parallaxElements.forEach(item => {
                const { element, speed } = item;
                const yPos = Math.round(scrollTop * speed * 100) / 100; // Round for subpixel rendering
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        });
    }

    handleResize() {
        if (this.isReducedMotion) return;

        this.parallaxElements.forEach(item => {
            item.element.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            this.handleScroll();
        }, 100);
    }

    addScrollIndicator() {
        if (this.isReducedMotion) return;

        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.innerHTML = '<i class="bi bi-chevron-down"></i>';
        indicator.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            color: var(--bs-primary);
            font-size: 2rem;
            animation: bounce 2s infinite;
            cursor: pointer;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
                40% { transform: translateX(-50%) translateY(-10px); }
                60% { transform: translateX(-50%) translateY(-5px); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(indicator);

        indicator.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });

        window.addEventListener('scroll', () => {
            const heroSection = document.getElementById('home');
            if (heroSection) {
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
                if (window.pageYOffset > heroBottom - window.innerHeight / 2) {
                    indicator.style.opacity = '0';
                    indicator.style.pointerEvents = 'none';
                } else {
                    indicator.style.opacity = '1';
                    indicator.style.pointerEvents = 'auto';
                }
            }
        });
    }

    createFloatingElements() {
        if (this.isReducedMotion) return;

        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        const shapes = ['circle', 'triangle', 'square'];
        const colors = ['var(--bs-primary)', 'var(--accent-color)', 'var(--bs-info)'];

        for (let i = 0; i < 6; i++) {
            const shape = document.createElement('div');
            const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];

            shape.className = `floating-shape floating-${shapeType}`;
            shape.style.cssText = `
                position: absolute;
                width: ${20 + Math.random() * 40}px;
                height: ${20 + Math.random() * 40}px;
                background: ${color};
                opacity: 0.1;
                border-radius: ${shapeType === 'circle' ? '50%' : '0'};
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: float ${5 + Math.random() * 10}s ease-in-out infinite;
                z-index: -1;
            `;

            heroSection.appendChild(shape);
        }

        const floatStyle = document.createElement('style');
        floatStyle.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(180deg); }
            }
        `;
        document.head.appendChild(floatStyle);
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }

        this.animatedElements.forEach(element => {
            element.style.opacity = '';
            element.style.transform = '';
            element.style.transition = '';
        });

        this.parallaxElements.forEach(item => {
            item.element.style.transform = '';
        });

        this.animatedElements = [];
        this.parallaxElements = [];
    }
}
