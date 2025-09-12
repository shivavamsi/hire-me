export class NavigationManager {
  constructor() {
    this.sections = [];
    this.currentSection = null;
    this.scrollOffset = 100;
    this.throttleTimeout = null;
  }

  async init() {
    try {
      this.sections = Array.from(document.querySelectorAll('section[id]'));

      this.setupEventListeners();
      this.updateActiveNavigation();

    } catch (error) {
      console.error('Error initializing NavigationManager:', error);
    }
  }

  setupEventListeners() {
    // Scroll handling
    window.addEventListener('scroll', () => {
      if (this.throttleTimeout) {
        clearTimeout(this.throttleTimeout);
      }

      this.throttleTimeout = setTimeout(() => {
        this.updateActiveNavigation();
      }, 16); // ~60fps
    });
  }

  updateActiveNavigation() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    let activeSection = null;
    let minDistance = Infinity;

    this.sections.forEach(section => {
      if (!section) return;

      const sectionTop = section.offsetTop - this.scrollOffset;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
        const distance = Math.abs(scrollTop - sectionTop);
        if (distance < minDistance) {
          minDistance = distance;
          activeSection = section;
        }
      }
    });

    if (!activeSection && this.sections.length > 0) {
      if (scrollTop < this.sections[0].offsetTop) {
        activeSection = this.sections[0];
      } else {
        activeSection = this.sections[this.sections.length - 1];
      }
    }

    this.setActiveNavLink(activeSection);
  }

  setActiveNavLink(activeSection) {
    if (this.currentSection === activeSection) {
      return;
    }

    if (activeSection) {
      this.currentSection = activeSection;
      this.dispatchNavigationChange(activeSection.id);
    }
  }

  smoothScrollToSection(target) {
    if (!target || target === '#') return;

    let element;
    try {
      element = document.querySelector(target);
    } catch (_e) {
      return;
    }
    if (!element) return;

    const elementPosition = element.offsetTop - 20;

    window.scrollTo({
      top: elementPosition, behavior: 'smooth'
    });

    setTimeout(() => {
      this.updateActiveNavigation();
    }, 100);
  }

  dispatchNavigationChange(sectionId) {
    const event = new CustomEvent('navigationChange', {
      detail: {
        sectionId: sectionId, section: this.currentSection
      }
    });

    document.dispatchEvent(event);

    if (history.replaceState) {
      history.replaceState(null, null, `#${sectionId}`);
    }
  }

  navigateToSection(sectionId) {
    const target = `#${sectionId}`;
    this.smoothScrollToSection(target);
  }

  getCurrentSection() {
    return this.currentSection;
  }
}
