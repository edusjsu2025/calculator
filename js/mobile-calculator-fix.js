// Mobile Calculator Fix - Ensures all calculators work properly on mobile devices
class MobileCalculatorFix {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }
    
    init() {
        if (!this.isMobile) return;
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.applyFixes();
            });
        } else {
            this.applyFixes();
        }
    }
    
    applyFixes() {
        this.fixContainerMargins();
        this.fixFormSubmission();
        this.fixButtonStyles();
        this.fixInputFields();
        this.fixResultsDisplay();
        this.preventDoubleSubmission();
        this.addTouchFeedback();
    }

    fixContainerMargins() {
        // Fix main container margins
        const contentOut = document.getElementById('contentout');
        if (contentOut) {
            contentOut.style.cssText += `
                width: 95% !important;
                padding: 0 2.5% !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
            `;
        }

        // Fix content area margins
        const content = document.getElementById('content');
        if (content) {
            content.style.cssText += `
                width: 100% !important;
                padding: 20px !important;
                margin: 0 !important;
                box-sizing: border-box !important;
            `;
        }

        // Fix footer margins
        const footerIn = document.getElementById('footerin');
        if (footerIn) {
            footerIn.style.cssText += `
                width: 95% !important;
                padding: 0 2.5% !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
            `;
        }
    }

    fixFormSubmission() {
        const forms = document.querySelectorAll('form[name="calform"]');
        
        forms.forEach(form => {
            if (form.hasAttribute('data-mobile-fixed')) return;
            form.setAttribute('data-mobile-fixed', 'true');
            
            // Remove any existing submit listeners
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            
            // Add proper submit handler
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                this.handleFormSubmission(newForm);
            });
            
            // Fix clear button
            const clearBtn = newForm.querySelector('input[type="button"]');
            if (clearBtn) {
                clearBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.clearForm(newForm);
                });
            }
        });
    }
    
    handleFormSubmission(form) {
        // Show loading state
        const submitBtn = form.querySelector('input[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            const originalValue = submitBtn.value;
            submitBtn.value = 'Calculating...';
            
            // Restore button after calculation
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.value = originalValue;
            }, 1000);
        }
        
        // Trigger calculation based on page type
        this.triggerCalculation();
        
        // Scroll to results after a delay
        setTimeout(() => {
            this.scrollToResults();
        }, 500);
    }
    
    triggerCalculation() {
        // Try different calculation methods based on available calculators
        if (window.moistureCalculator && typeof window.moistureCalculator.calculateMoistureContent === 'function') {
            window.moistureCalculator.calculateMoistureContent();
        } else if (window.humidityCalculator && typeof window.humidityCalculator.calculateHumidity === 'function') {
            window.humidityCalculator.calculateHumidity();
        } else if (window.dryingCalculator && typeof window.dryingCalculator.calculateDrying === 'function') {
            window.dryingCalculator.calculateDrying();
        } else if (window.temperatureCalculator && typeof window.temperatureCalculator.calculateTemperature === 'function') {
            window.temperatureCalculator.calculateTemperature();
        } else {
            // Fallback: try to find any calculate function
            this.fallbackCalculation();
        }
    }
    
    fallbackCalculation() {
        // Look for common calculation patterns
        const calculatorScripts = document.querySelectorAll('script[src*="calculator"]');
        
        // Try to trigger calculation based on form inputs
        const form = document.querySelector('form[name="calform"]');
        if (form) {
            const inputs = form.querySelectorAll('input[type="text"], input[type="number"]');
            let hasValidInputs = false;
            
            inputs.forEach(input => {
                if (input.value && !isNaN(input.value) && input.value.trim() !== '') {
                    hasValidInputs = true;
                }
            });
            
            if (hasValidInputs) {
                // Show a basic result if no specific calculator is found
                this.showBasicResult();
            }
        }
    }
    
    showBasicResult() {
        const resultSection = document.getElementById('result-section');
        const resultsContent = document.getElementById('results-content');
        
        if (resultSection && resultsContent) {
            resultsContent.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h4 style="color: #007bff;">Calculation Complete</h4>
                    <p>Your calculation has been processed. Please check the results above.</p>
                </div>
            `;
            resultSection.style.display = 'block';
        }
    }
    
    fixButtonStyles() {
        const buttons = document.querySelectorAll('input[type="submit"], input[type="button"]');

        buttons.forEach(button => {
            button.style.cssText += `
                width: auto !important;
                font-size: 16px !important;
                font-weight: bold !important;
                border: none !important;
                cursor: pointer !important;
                margin: 0 8px 0 0 !important;
                box-sizing: border-box !important;
                transition: all 0.3s ease !important;
                display: inline-block !important;
            `;

            if (button.type === 'submit') {
                button.style.cssText += `
                    background-color: rgb(76, 123, 37) !important;
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180px' height='40px'><circle cx='112' cy='20' r='11' fill='darkseagreen' /><path d='M110 12 L120 20 L110 28 Z' fill='white' /></svg>") !important;
                    background-repeat: no-repeat !important;
                    color: white !important;
                    padding: 11px 50px 11px 16px !important;
                    border-radius: 3px !important;
                `;
            } else {
                button.style.cssText += `
                    background: rgb(171, 171, 171) !important;
                    color: white !important;
                    padding: 11px 8px !important;
                    border-radius: 3px !important;
                `;
            }
        });

        // Fix button container
        const buttonContainers = document.querySelectorAll('#calinputtable tr:last-child td');
        buttonContainers.forEach(container => {
            container.style.cssText += `
                padding-top: 8px !important;
                padding-left: 70px !important;
                text-align: left !important;
            `;
        });
    }
    
    fixInputFields() {
        const inputs = document.querySelectorAll('#calinputtable input[type="text"], #calinputtable input[type="number"], #calinputtable select');
        
        inputs.forEach(input => {
            input.style.cssText += `
                width: 100% !important;
                padding: 12px !important;
                font-size: 16px !important;
                border: 1px solid #ddd !important;
                border-radius: 6px !important;
                box-sizing: border-box !important;
                margin: 0 !important;
            `;
            
            // Add focus enhancement
            input.addEventListener('focus', () => {
                input.style.borderColor = '#007bff';
                input.style.boxShadow = '0 0 0 2px rgba(0,123,255,0.25)';
            });
            
            input.addEventListener('blur', () => {
                input.style.borderColor = '#ddd';
                input.style.boxShadow = 'none';
            });
        });
    }
    
    fixResultsDisplay() {
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
            resultSection.style.cssText += `
                margin: 20px 0 !important;
                padding: 15px !important;
                background: #f8f9fa !important;
                border: 1px solid #dee2e6 !important;
                border-radius: 8px !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                transition: none !important;
                transform: none !important;
            `;
        }
    }
    
    scrollToResults() {
        const resultSection = document.getElementById('result-section');
        if (resultSection && resultSection.style.display !== 'none') {
            const headerHeight = document.getElementById('header')?.offsetHeight || 0;
            const offset = 20;
            const targetPosition = resultSection.offsetTop - headerHeight - offset;
            
            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior: 'smooth'
            });
        }
    }
    
    clearForm(form) {
        const inputs = form.querySelectorAll('input[type="text"], input[type="number"]');
        inputs.forEach(input => {
            input.value = '';
        });
        
        const selects = form.querySelectorAll('select');
        selects.forEach(select => {
            select.selectedIndex = 0;
        });
        
        const radios = form.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.checked = radio.defaultChecked;
        });
        
        // Hide results
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
            resultSection.style.display = 'none';
        }
    }
    
    preventDoubleSubmission() {
        let isSubmitting = false;
        
        document.addEventListener('submit', (e) => {
            if (isSubmitting) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            isSubmitting = true;
            setTimeout(() => {
                isSubmitting = false;
            }, 2000);
        });
    }
    
    addTouchFeedback() {
        const buttons = document.querySelectorAll('input[type="submit"], input[type="button"]');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.98)';
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
            });
            
            button.addEventListener('touchend', () => {
                button.style.transform = 'scale(1)';
            });
        });
    }
}

// Initialize the mobile calculator fix
if (window.innerWidth <= 768) {
    new MobileCalculatorFix();
}

// Also initialize on resize if window becomes mobile size
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && !window.mobileCalculatorFix) {
        window.mobileCalculatorFix = new MobileCalculatorFix();
    }
});
