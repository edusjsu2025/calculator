// Mobile Optimization Module for Dry Calculator
class MobileOptimization {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.touchDevice = this.detectTouch();
        
        this.init();
    }
    
    detectMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    detectTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }
    
    detectTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    init() {
        this.setupResultScrolling();
        this.setupFormOptimizations();
        this.setupTouchOptimizations();
        this.setupKeyboardOptimizations();
        this.setupOrientationHandling();
        
        // Add mobile-specific event listeners
        if (this.isMobile) {
            this.addMobileEventListeners();
        }
    }
    
    setupResultScrolling() {
        // Override the showResults method for all calculators
        this.originalShowResults = [];
        
        // Monitor for result section visibility changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.id === 'result-section' && target.style.display !== 'none') {
                        this.scrollToResults();
                    }
                }
                
                // Also monitor for content changes in results
                if (mutation.type === 'childList' && mutation.target.id === 'results-content') {
                    setTimeout(() => this.scrollToResults(), 100);
                }
            });
        });
        
        // Start observing
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
            observer.observe(resultSection, {
                attributes: true,
                childList: true,
                subtree: true
            });
        }
        
        // Also monitor results-content directly
        const resultsContent = document.getElementById('results-content');
        if (resultsContent) {
            observer.observe(resultsContent, {
                childList: true,
                subtree: true
            });
        }
    }
    
    scrollToResults() {
        if (!this.isMobile) return;
        
        const resultSection = document.getElementById('result-section');
        if (!resultSection || resultSection.style.display === 'none') return;
        
        // Add a small delay to ensure content is rendered
        setTimeout(() => {
            const rect = resultSection.getBoundingClientRect();
            const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
            
            if (!isVisible) {
                // Calculate optimal scroll position
                const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                const offset = 20; // Additional padding
                const targetPosition = resultSection.offsetTop - headerHeight - offset;
                
                // Smooth scroll to results
                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
                
                // Add visual feedback
                this.highlightResults();
            }
        }, 150);
    }
    
    highlightResults() {
        const resultSection = document.getElementById('result-section');
        if (!resultSection) return;
        
        // Add highlight animation
        resultSection.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
        resultSection.style.boxShadow = '0 4px 20px rgba(0, 123, 255, 0.3)';
        resultSection.style.transform = 'scale(1.02)';
        
        // Remove highlight after animation
        setTimeout(() => {
            resultSection.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            resultSection.style.transform = 'scale(1)';
        }, 1000);
    }
    
    setupFormOptimizations() {
        if (!this.isMobile) return;
        
        // Optimize input fields for mobile
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"], select');
        inputs.forEach(input => {
            // Prevent zoom on focus for iOS
            if (parseFloat(getComputedStyle(input).fontSize) < 16) {
                input.style.fontSize = '16px';
            }
            
            // Add mobile-friendly attributes
            if (input.type === 'text' && input.name.includes('temp')) {
                input.setAttribute('inputmode', 'decimal');
                input.setAttribute('pattern', '[0-9]*');
            }
            
            // Optimize for touch
            input.style.minHeight = '44px';
            input.style.padding = '12px';
        });
        
        // Optimize buttons
        const buttons = document.querySelectorAll('input[type="submit"], input[type="button"], button');
        buttons.forEach(button => {
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
            button.style.padding = '12px 20px';
        });
    }
    
    setupTouchOptimizations() {
        if (!this.touchDevice) return;
        
        // Add touch feedback to interactive elements
        const interactiveElements = document.querySelectorAll('button, input[type="submit"], input[type="button"], .scifunc, .scinm, .sciop, .scieq');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                element.style.transform = 'scale(0.95)';
                element.style.transition = 'transform 0.1s ease';
            });
            
            element.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 100);
            });
            
            element.addEventListener('touchcancel', (e) => {
                element.style.transform = 'scale(1)';
            });
        });
    }
    
    setupKeyboardOptimizations() {
        if (!this.isMobile) return;
        
        // Handle virtual keyboard appearance
        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            // If height decreased significantly, keyboard is likely open
            if (heightDifference > 150) {
                document.body.classList.add('keyboard-open');
                
                // Ensure focused input is visible
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT')) {
                    setTimeout(() => {
                        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            } else {
                document.body.classList.remove('keyboard-open');
            }
        });
        
        // Handle input focus
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
        });
    }
    
    setupOrientationHandling() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                // Recalculate layout after orientation change
                this.recalculateLayout();
            }, 500);
        });
    }
    
    recalculateLayout() {
        // Force layout recalculation
        const resultSection = document.getElementById('result-section');
        if (resultSection && resultSection.style.display !== 'none') {
            // Re-scroll to results if they were visible
            setTimeout(() => this.scrollToResults(), 100);
        }
    }
    
    addMobileEventListeners() {
        // Add swipe gestures for navigation (optional)
        let startX, startY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            // Prevent pull-to-refresh on some browsers
            if (window.scrollY === 0 && e.touches[0].clientY > startY) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Add loading states for better UX
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('input[type="submit"]');
                if (submitBtn) {
                    submitBtn.style.opacity = '0.7';
                    submitBtn.value = 'Calculating...';
                    
                    setTimeout(() => {
                        submitBtn.style.opacity = '1';
                        submitBtn.value = 'Calculate';
                    }, 500);
                }
            });
        });
    }
    
    // Public method to manually trigger result scrolling
    static scrollToResults() {
        const instance = window.mobileOptimization;
        if (instance) {
            instance.scrollToResults();
        }
    }
    
    // Public method to check if device is mobile
    static isMobileDevice() {
        const instance = window.mobileOptimization;
        return instance ? instance.isMobile : false;
    }
}

// CSS for mobile optimizations
const mobileCSS = `
<style>
/* Mobile-specific optimizations */
@media (max-width: 768px) {
    /* Container margin fixes */
    #contentout {
        width: 95% !important;
        padding: 0 2.5% !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
    }

    #content {
        width: 100% !important;
        padding: 20px !important;
        margin: 0 !important;
        box-sizing: border-box !important;
    }

    /* Keyboard open state */
    body.keyboard-open {
        position: fixed;
        width: 100%;
    }
    
    /* Result section mobile enhancements */
    #result-section {
        margin: 20px 0 !important;
        padding: 15px !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        transition: box-shadow 0.3s ease !important;
        transform: none !important;
    }
    
    /* Touch feedback */
    .touch-feedback {
        transform: scale(0.95);
        transition: transform 0.1s ease;
    }
    
    /* Loading state */
    .loading {
        opacity: 0.7;
        pointer-events: none;
    }
    
    /* Improved form spacing */
    #calinputtable tr {
        margin-bottom: 15px !important;
    }
    
    /* Better button spacing and consistency */
    input[type="submit"], input[type="button"] {
        margin: 8px 0 !important;
        min-height: 50px !important;
        font-size: 16px !important;
        font-weight: bold !important;
        border-radius: 6px !important;
        border: none !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        box-sizing: border-box !important;
    }

    input[type="submit"] {
        background-color: rgb(76, 123, 37) !important;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180px' height='40px'><circle cx='112' cy='20' r='11' fill='darkseagreen' /><path d='M110 12 L120 20 L110 28 Z' fill='white' /></svg>") !important;
        background-repeat: no-repeat !important;
        color: white !important;
        padding: 11px 50px 11px 16px !important;
        border-radius: 3px !important;
        width: auto !important;
        margin: 0 8px 0 0 !important;
    }

    input[type="submit"]:hover, input[type="submit"]:active {
        background-color: rgb(68, 68, 68) !important;
    }

    input[type="button"] {
        background: rgb(171, 171, 171) !important;
        color: white !important;
        padding: 11px 8px !important;
        border-radius: 3px !important;
        width: auto !important;
        margin: 0 8px 0 0 !important;
    }

    input[type="button"]:hover, input[type="button"]:active {
        background: rgb(68, 68, 68) !important;
    }
    
    /* Scroll indicator for results */
    #result-section::before {
        content: "📊 Results";
        display: block;
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
        text-align: center;
    }
}

/* Smooth scrolling for all devices */
html {
    scroll-behavior: smooth;
}

/* Focus improvements */
input:focus, select:focus, button:focus {
    outline: 2px solid #007bff !important;
    outline-offset: 2px !important;
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', mobileCSS);

// Initialize mobile optimization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mobileOptimization = new MobileOptimization();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileOptimization;
}
