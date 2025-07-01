// Calculator Mobile Enhancement Module
// This module enhances all calculators with mobile-specific features

class CalculatorMobileEnhancer {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }
    
    init() {
        if (!this.isMobile) return;
        
        this.enhanceCalculatorForm();
        this.setupResultScrolling();
        this.addMobileFeatures();
        this.setupFormValidation();
    }
    
    enhanceCalculatorForm() {
        const form = document.querySelector('form[name="calform"]');
        if (!form) return;

        // Check if form already has event listeners to avoid duplicates
        if (form.hasAttribute('data-mobile-enhanced')) return;
        form.setAttribute('data-mobile-enhanced', 'true');

        // Add mobile-friendly form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Add loading state
            this.showLoadingState();

            // Simulate calculation delay for better UX
            setTimeout(() => {
                this.processCalculation();
            }, 200);
        });

        // Enhance input fields
        this.enhanceInputFields();

        // Enhance buttons
        this.enhanceButtons();
    }
    
    enhanceInputFields() {
        const inputs = document.querySelectorAll('#calinputtable input[type="text"], #calinputtable input[type="number"]');
        
        inputs.forEach(input => {
            // Add mobile-friendly attributes
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'off');
            input.setAttribute('spellcheck', 'false');
            
            // Set appropriate input modes
            if (input.name.includes('temp') || input.name.includes('pressure') || input.name.includes('humidity')) {
                input.setAttribute('inputmode', 'decimal');
                input.setAttribute('pattern', '[0-9]*[.]?[0-9]*');
            }
            
            // Add focus enhancement
            input.addEventListener('focus', () => {
                input.style.borderColor = '#007bff';
                input.style.boxShadow = '0 0 0 2px rgba(0,123,255,0.25)';
                
                // Scroll input into view on mobile
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            });
            
            input.addEventListener('blur', () => {
                input.style.borderColor = '#ddd';
                input.style.boxShadow = 'none';
            });
            
            // Add real-time validation
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
        });
    }
    
    enhanceButtons() {
        const submitBtn = document.querySelector('input[type="submit"]');
        const clearBtn = document.querySelector('input[type="button"]');

        if (submitBtn) {
            submitBtn.style.backgroundColor = 'rgb(76, 123, 37)';
            submitBtn.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'180px\' height=\'40px\'><circle cx=\'112\' cy=\'20\' r=\'11\' fill=\'darkseagreen\' /><path d=\'M110 12 L120 20 L110 28 Z\' fill=\'white\' /></svg>")';
            submitBtn.style.backgroundRepeat = 'no-repeat';
            submitBtn.style.color = 'white';
            submitBtn.style.border = 'none';
            submitBtn.style.borderRadius = '3px';
            submitBtn.style.fontSize = '16px';
            submitBtn.style.fontWeight = 'bold';
            submitBtn.style.cursor = 'pointer';
            submitBtn.style.padding = '11px 50px 11px 16px';
            submitBtn.style.width = 'auto';
            submitBtn.style.margin = '0 8px 0 0';
            submitBtn.style.transition = 'all 0.3s ease';

            submitBtn.addEventListener('mousedown', () => {
                submitBtn.style.transform = 'scale(0.98)';
            });

            submitBtn.addEventListener('mouseup', () => {
                submitBtn.style.transform = 'scale(1)';
            });
        }

        if (clearBtn) {
            clearBtn.style.background = 'rgb(171, 171, 171)';
            clearBtn.style.color = 'white';
            clearBtn.style.border = 'none';
            clearBtn.style.borderRadius = '3px';
            clearBtn.style.fontSize = '16px';
            clearBtn.style.cursor = 'pointer';
            clearBtn.style.padding = '11px 8px';
            clearBtn.style.width = 'auto';
            clearBtn.style.margin = '0 8px 0 0';
            clearBtn.style.transition = 'all 0.3s ease';

            clearBtn.addEventListener('click', () => {
                this.clearForm();
            });
        }
    }
    
    showLoadingState() {
        const submitBtn = document.querySelector('input[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.value = 'Calculating...';
            
            // Add spinner
            submitBtn.style.position = 'relative';
            submitBtn.style.paddingLeft = '40px';
            
            const spinner = document.createElement('div');
            spinner.className = 'mobile-spinner';
            spinner.innerHTML = '⟳';
            spinner.style.cssText = `
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                animation: spin 1s linear infinite;
                font-size: 16px;
            `;
            
            submitBtn.style.position = 'relative';
            submitBtn.appendChild(spinner);
        }
        
        // Add CSS for spinner animation if not exists
        if (!document.querySelector('#spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.textContent = `
                @keyframes spin {
                    0% { transform: translateY(-50%) rotate(0deg); }
                    100% { transform: translateY(-50%) rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    hideLoadingState() {
        const submitBtn = document.querySelector('input[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.value = 'Calculate';
            submitBtn.style.paddingLeft = '20px';
            
            const spinner = submitBtn.querySelector('.mobile-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }
    
    processCalculation() {
        // Try to trigger the original calculation first
        const form = document.querySelector('form[name="calform"]');

        // Look for specific calculator instances
        if (window.moistureCalculator && typeof window.moistureCalculator.calculateMoistureContent === 'function') {
            window.moistureCalculator.calculateMoistureContent();
        } else if (window.humidityCalculator && typeof window.humidityCalculator.calculateHumidity === 'function') {
            window.humidityCalculator.calculateHumidity();
        } else if (window.dryingCalculator && typeof window.dryingCalculator.calculateDrying === 'function') {
            window.dryingCalculator.calculateDrying();
        } else {
            // Fallback: try to find and trigger any calculate function
            const calculatorClasses = ['MoistureCalculator', 'HumidityCalculator', 'DryingCalculator', 'TemperatureCalculator'];
            let calculationTriggered = false;

            for (const className of calculatorClasses) {
                if (window[className] && window[className].prototype && window[className].prototype.calculate) {
                    // Try to find an instance or create one
                    const instances = document.querySelectorAll('[data-calculator-instance]');
                    if (instances.length > 0) {
                        const instance = instances[0].calculatorInstance;
                        if (instance && typeof instance.calculate === 'function') {
                            instance.calculate();
                            calculationTriggered = true;
                            break;
                        }
                    }
                }
            }

            if (!calculationTriggered) {
                // Last resort: trigger form submission normally
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                form.dispatchEvent(submitEvent);
            }
        }

        // Hide loading state
        this.hideLoadingState();
    }
    
    setupResultScrolling() {
        // Monitor for result section changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.id === 'result-section' && target.style.display !== 'none') {
                        this.scrollToResults();
                    }
                }
            });
        });
        
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
            observer.observe(resultSection, { attributes: true });
        }
    }
    
    scrollToResults() {
        const resultSection = document.getElementById('result-section');
        if (!resultSection || resultSection.style.display === 'none') return;
        
        setTimeout(() => {
            const headerHeight = document.getElementById('header')?.offsetHeight || 0;
            const offset = 20;
            const targetPosition = resultSection.offsetTop - headerHeight - offset;
            
            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
            
            // Add highlight effect
            this.highlightResults(resultSection);
            
            // Hide loading state
            this.hideLoadingState();
        }, 200);
    }
    
    highlightResults(resultSection) {
        // Simplified highlight without transform to prevent layout shifts
        resultSection.style.transition = 'box-shadow 0.3s ease';
        resultSection.style.boxShadow = '0 4px 20px rgba(0, 123, 255, 0.3)';

        // Add success indicator
        const indicator = document.createElement('div');
        indicator.innerHTML = '✓ Calculation Complete';
        indicator.style.cssText = `
            position: absolute;
            top: -10px;
            right: 10px;
            background: #28a745;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 2s ease;
        `;

        resultSection.style.position = 'relative';
        resultSection.appendChild(indicator);

        // Add fadeInOut animation
        if (!document.querySelector('#indicator-style')) {
            const style = document.createElement('style');
            style.id = 'indicator-style';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    20% { opacity: 1; transform: translateY(0); }
                    80% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove effects after animation
        setTimeout(() => {
            resultSection.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 2000);
    }
    
    validateInput(input) {
        const value = input.value.trim();
        
        // Remove any existing validation indicators
        const existingIndicator = input.parentNode.querySelector('.validation-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (value === '') return;
        
        // Check if it's a valid number
        const isValid = !isNaN(value) && value !== '';
        
        // Add validation indicator
        const indicator = document.createElement('span');
        indicator.className = 'validation-indicator';
        indicator.innerHTML = isValid ? '✓' : '✗';
        indicator.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: ${isValid ? '#28a745' : '#dc3545'};
            font-weight: bold;
            font-size: 16px;
        `;
        
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(indicator);
        
        // Update input styling
        input.style.borderColor = isValid ? '#28a745' : '#dc3545';
    }
    
    clearForm() {
        const inputs = document.querySelectorAll('#calinputtable input[type="text"], #calinputtable input[type="number"]');
        inputs.forEach(input => {
            input.value = '';
            input.style.borderColor = '#ddd';
            
            const indicator = input.parentNode.querySelector('.validation-indicator');
            if (indicator) {
                indicator.remove();
            }
        });
        
        // Hide results
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
            resultSection.style.display = 'none';
        }
        
        // Focus first input
        const firstInput = document.querySelector('#calinputtable input[type="text"], #calinputtable input[type="number"]');
        if (firstInput) {
            firstInput.focus();
        }
    }
    
    addMobileFeatures() {
        // Add haptic feedback for supported devices
        if ('vibrate' in navigator) {
            const buttons = document.querySelectorAll('input[type="submit"], input[type="button"]');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    navigator.vibrate(50); // Short vibration
                });
            });
        }
        
        // Add double-tap to clear functionality
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected
                const target = e.target;
                if (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'number')) {
                    target.select();
                }
            }
            lastTap = currentTime;
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 768) {
        window.calculatorMobileEnhancer = new CalculatorMobileEnhancer();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalculatorMobileEnhancer;
}
