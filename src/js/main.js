import { ThemeManager } from './components/ThemeManager.js';
import { NavigationManager } from './components/NavigationManager.js';
import { ScrollEffects } from './components/ScrollEffects.js';
import { FormValidation } from './components/FormValidation.js';

class PortfolioApp {
    constructor() {
        this.themeManager = null;
        this.navigationManager = null;
        this.scrollEffects = null;
        this.formValidation = null;

        this.init();
    }

    async init() {
        try {
            await this.waitForDOM();
            await this.initializeComponents();
            this.setupEventListeners();
            this.handleInitialLoad();
        } catch (error) {
            console.error('Error initializing portfolio app:', error);
        }
    }

    waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    async initializeComponents() {
        this.themeManager = new ThemeManager();
        this.navigationManager = new NavigationManager();
        this.scrollEffects = new ScrollEffects();
        this.formValidation = new FormValidation();

        await Promise.all([
            this.themeManager.init(),
            this.navigationManager.init(),
            this.scrollEffects.init(),
            this.formValidation.init()
        ]);

        this.setCurrentYear();
    }

    setCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    setupEventListeners() {
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));

        document.addEventListener('click', e => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                this.smoothScrollToSection(e.target.getAttribute('href'));
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    handleScroll() {
        if (this.navigationManager) {
            this.navigationManager.updateActiveNavigation();
        }

        if (this.scrollEffects) {
            this.scrollEffects.handleScroll();
        }
    }

    handleResize() {
        if (this.scrollEffects) {
            this.scrollEffects.handleResize();
        }
    }

    handleInitialLoad() {
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                this.smoothScrollToSection(hash);
            }, 100);
        }

        this.preloadImages();
    }

    handleEscapeKey() {
        // No overlay to close anymore
    }

    smoothScrollToSection(target) {
        if (this.navigationManager) {
            this.navigationManager.smoothScrollToSection(target);
        }
    }

    preloadImages() {
        const images = ['assets/images/profile-placeholder.jpg'];

        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    handleError(error, context = '') {
        console.error(`Portfolio App Error ${context}:`, error);
        this.showErrorNotification(`Error: ${error.message}`);
    }

    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize the portfolio application
new PortfolioApp();
