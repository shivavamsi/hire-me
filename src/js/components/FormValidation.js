export class FormValidation {
    constructor() {
        this.forms = [];
        this.validators = new Map();
        this.errorMessages = {
            required: 'This field is required',
            email: 'Please enter a valid email address',
            minLength: 'This field must be at least {min} characters long',
            maxLength: 'This field cannot exceed {max} characters',
            pattern: 'Please enter a valid format'
        };
    }

    async init() {
        try {
            this.setupValidators();
            this.findAndInitializeForms();

        } catch (error) {
            console.error('Error initializing FormValidation:', error);
        }
    }

    setupValidators() {
        this.validators.set('required', (value) => {
            return value && value.trim().length > 0;
        });

        this.validators.set('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return !value || emailRegex.test(value.trim());
        });

        this.validators.set('minLength', (value, min) => {
            return !value || value.trim().length >= parseInt(min);
        });

        this.validators.set('maxLength', (value, max) => {
            return !value || value.trim().length <= parseInt(max);
        });

        this.validators.set('pattern', (value, pattern) => {
            if (!value) return true;
            const regex = new RegExp(pattern);
            return regex.test(value);
        });

        this.validators.set('phone', (value) => {
            if (!value) return true;
            const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(value.replace(/[\s\-()]/g, ''));
        });

        this.validators.set('url', (value) => {
            if (!value) return true;
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });
    }

    findAndInitializeForms() {
        const forms = document.querySelectorAll('form[data-validate="true"], .contact-form, .newsletter-form');

        forms.forEach(form => {
            this.initializeForm(form);
        });

        document.addEventListener('DOMContentLoaded', () => {
            const dynamicForms = document.querySelectorAll('form[data-validate="true"]');
            dynamicForms.forEach(form => {
                if (!this.forms.includes(form)) {
                    this.initializeForm(form);
                }
            });
        });
    }

    initializeForm(form) {
        if (this.forms.includes(form)) return;

        this.forms.push(form);

        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            this.setupInputValidation(input);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(form);
        });

        const resetButton = form.querySelector('button[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetForm(form);
            });
        }
    }

    setupInputValidation(input) {
        input.addEventListener('blur', () => {
            this.validateField(input);
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('is-invalid')) {
                this.validateField(input);
            }
        });

        if (input.type === 'email') {
            input.addEventListener('input', this.debounce(() => {
                this.validateField(input);
            }, 500));
        }
    }

    validateField(input) {
        const rules = this.getValidationRules(input);
        const value = input.value;

        this.clearFieldErrors(input);

        for (const rule of rules) {
            const isValid = this.runValidation(rule, value);

            if (!isValid) {
                this.showFieldError(input, rule);
                return false;
            }
        }

        this.showFieldSuccess(input);
        return true;
    }

    getValidationRules(input) {
        const rules = [];

        if (input.hasAttribute('required')) {
            rules.push({ type: 'required' });
        }

        if (input.type === 'email') {
            rules.push({ type: 'email' });
        }

        if (input.hasAttribute('minlength')) {
            rules.push({ type: 'minLength', param: input.getAttribute('minlength') });
        }

        if (input.hasAttribute('maxlength')) {
            rules.push({ type: 'maxLength', param: input.getAttribute('maxlength') });
        }

        if (input.hasAttribute('pattern')) {
            rules.push({ type: 'pattern', param: input.getAttribute('pattern') });
        }

        if (input.type === 'tel') {
            rules.push({ type: 'phone' });
        }

        if (input.type === 'url') {
            rules.push({ type: 'url' });
        }

        const customRules = input.getAttribute('data-validate');
        if (customRules) {
            customRules.split(',').forEach(rule => {
                const [type, param] = rule.split(':');
                rules.push({ type: type.trim(), param: param?.trim() });
            });
        }

        return rules;
    }

    runValidation(rule, value) {
        const validator = this.validators.get(rule.type);

        if (!validator) {
            return true;
        }

        return validator(value, rule.param);
    }

    showFieldError(input, rule) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');

        const errorMessage = this.getErrorMessage(rule);
        const feedback = this.getOrCreateFeedback(input, 'invalid-feedback');
        feedback.textContent = errorMessage;
    }

    showFieldSuccess(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');

        const feedback = this.getOrCreateFeedback(input, 'valid-feedback');
        feedback.textContent = 'Looks good!';
    }

    clearFieldErrors(input) {
        input.classList.remove('is-valid', 'is-invalid');

        const feedback = input.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = '';
        }
    }

    getOrCreateFeedback(input, className) {
        let feedback = input.parentNode.querySelector(`.${className}`);

        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = className;
            input.parentNode.appendChild(feedback);
        }

        return feedback;
    }

    getErrorMessage(rule) {
        let message = this.errorMessages[rule.type] || this.errorMessages.pattern;

        if (rule.param) {
            message = message.replace(`{${rule.type.replace('Length', '')}}`, rule.param);
        }

        return message;
    }

    async handleFormSubmit(form) {
        const isValid = this.validateForm(form);

        if (!isValid) {
            this.focusFirstInvalidField(form);
            return;
        }

        this.setFormLoading(form, true);

        try {
            const formData = this.getFormData(form);
            const result = await this.submitForm(formData, form);

            if (result.success) {
                this.showFormSuccess(form, result.message);
                this.resetForm(form);
            } else {
                this.showFormError(form, result.message);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormError(form, 'An error occurred. Please try again.');
        } finally {
            this.setFormLoading(form, false);
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    async submitForm(_data) {
        // Note: action and method would be used when implementing actual form submission
        // const action = form.action || '/submit';
        // const method = form.method || 'POST';

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Thank you for your message! I\'ll get back to you soon.'
                });
            }, 1000);
        });
    }

    setFormLoading(form, loading) {
        const submitButton = form.querySelector('button[type="submit"]');
        // Note: spinner would be used for more complex loading states
        // const spinner = form.querySelector('.loading-spinner');

        if (submitButton) {
            submitButton.disabled = loading;

            if (loading) {
                submitButton.classList.add('loading');
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
            } else {
                submitButton.classList.remove('loading');
                submitButton.innerHTML = submitButton.getAttribute('data-original-text') || 'Send Message';
            }
        }
    }

    showFormSuccess(form, message) {
        this.showFormAlert(form, message, 'success');
    }

    showFormError(form, message) {
        this.showFormAlert(form, message, 'danger');
    }

    showFormAlert(form, message, type) {
        this.clearFormAlerts(form);

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        form.insertAdjacentElement('beforebegin', alert);

        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    clearFormAlerts(form) {
        const alerts = form.parentNode.querySelectorAll('.alert');
        alerts.forEach(alert => alert.remove());
    }

    focusFirstInvalidField(form) {
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
            firstInvalid.focus();
        }
    }

    resetForm(form) {
        form.reset();

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this.clearFieldErrors(input);
        });

        this.clearFormAlerts(form);
    }

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

    addCustomValidator(name, validator, errorMessage) {
        this.validators.set(name, validator);
        if (errorMessage) {
            this.errorMessages[name] = errorMessage;
        }
    }

    removeForm(form) {
        const index = this.forms.indexOf(form);
        if (index > -1) {
            this.forms.splice(index, 1);
        }
    }
}
