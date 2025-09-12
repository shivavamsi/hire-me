export class ThemeManager {
    constructor() {
        this.storageKey = 'portfolio-theme';
        this.themes = {
            LIGHT: 'light',
            DARK: 'dark'
        };
        this.currentTheme = this.themes.LIGHT;
        this.mediaQuery = null;
        this.themeToggle = null;
        this.themeIcon = null;
    }

    async init() {
        try {
            this.themeToggle = document.getElementById('theme-toggle');
            this.themeIcon = document.getElementById('theme-icon');

            if (!this.themeToggle || !this.themeIcon) {
                return;
            }

            this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            this.loadSavedTheme();
            this.setupEventListeners();
            this.applyTheme();

        } catch (error) {
            console.error('Error initializing ThemeManager:', error);
        }
    }

    setupEventListeners() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });

        }

    }

    loadSavedTheme() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved && Object.values(this.themes).includes(saved)) {
            this.currentTheme = saved;
        }
    }

    saveTheme() {
        localStorage.setItem(this.storageKey, this.currentTheme);
    }

    toggleTheme() {
        // Toggle between light and dark
        this.currentTheme = this.currentTheme === this.themes.LIGHT ? this.themes.DARK : this.themes.LIGHT;
        this.saveTheme();
        this.applyTheme();
    }

    applyTheme() {
        const htmlElement = document.documentElement;
        const effectiveTheme = this.currentTheme;

        htmlElement.setAttribute('data-bs-theme', effectiveTheme);
        this.updateThemeIcon(effectiveTheme);

        this.dispatchThemeChange(effectiveTheme);
    }

    updateThemeIcon(effectiveTheme) {
        if (!this.themeIcon) return;

        const icons = {
            [this.themes.LIGHT]: 'bi-sun-fill',
            [this.themes.DARK]: 'bi-moon-stars-fill'
        };

        const iconClass = icons[this.currentTheme] || icons[this.themes.LIGHT];
        this.themeIcon.className = `bi ${iconClass}`;

        // Update tooltip
        const tooltips = {
            [this.themes.LIGHT]: 'Light theme',
            [this.themes.DARK]: 'Dark theme'
        };

        if (this.themeToggle) {
            this.themeToggle.setAttribute('title', tooltips[this.currentTheme]);
        }
    }

    dispatchThemeChange(theme) {
        const event = new CustomEvent('themeChange', {
            detail: {
                theme: theme,
                source: this.currentTheme
            }
        });

        document.dispatchEvent(event);
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getEffectiveTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (!Object.values(this.themes).includes(theme)) {
            return;
        }

        this.currentTheme = theme;
        this.saveTheme();
        this.applyTheme();
    }
}
