// Temperature Calculator JavaScript
class TemperatureCalculator {
    constructor() {
        this.form = document.querySelector('form[name="calform"]');
        this.resultSection = document.getElementById('result-section');
        this.resultsContent = document.getElementById('results-content');
        
        this.initializeForm();
        this.initializeSearch();
    }
    
    initializeForm() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateTemperature();
        });
        
        // Clear button functionality
        const clearBtn = this.form.querySelector('input[type="button"]');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearForm();
            });
        }
        
        // Real-time calculation on input change
        const inputs = this.form.querySelectorAll('input[type="text"], select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculateTemperature();
            });
            input.addEventListener('change', () => {
                this.calculateTemperature();
            });
        });
        
        // Checkbox change handlers
        const checkboxes = this.form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.calculateTemperature();
            });
        });
    }
    
    initializeSearch() {
        const searchBtn = document.getElementById('bluebtn');
        const searchInput = document.getElementById('calcSearchTerm');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
    }
    
    calculateTemperature() {
        const inputTemp = parseFloat(document.getElementById('cinputtemp').value);
        const fromScale = document.getElementById('cfromscale').value;
        const precision = parseInt(document.getElementById('cprecision').value);
        
        if (isNaN(inputTemp)) {
            this.hideResults();
            return;
        }
        
        // Get selected output scales
        const outputScales = {
            celsius: document.getElementById('ctocelsius').checked,
            fahrenheit: document.getElementById('ctofahrenheit').checked,
            kelvin: document.getElementById('ctokelvin').checked,
            rankine: document.getElementById('ctorankine').checked
        };
        
        // Convert to all scales
        const temperatures = this.convertTemperature(inputTemp, fromScale);
        
        // Check for absolute zero violations
        const absoluteZeroCheck = this.checkAbsoluteZero(temperatures);
        
        this.showResults({
            inputTemp: inputTemp,
            fromScale: fromScale,
            temperatures: temperatures,
            outputScales: outputScales,
            precision: precision,
            absoluteZeroCheck: absoluteZeroCheck
        });
    }
    
    convertTemperature(temp, fromScale) {
        let celsius, fahrenheit, kelvin, rankine;
        
        // First convert to Celsius as base
        switch (fromScale) {
            case 'celsius':
                celsius = temp;
                break;
            case 'fahrenheit':
                celsius = (temp - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = temp - 273.15;
                break;
            case 'rankine':
                celsius = (temp - 491.67) * 5/9;
                break;
        }
        
        // Convert from Celsius to other scales
        fahrenheit = celsius * 9/5 + 32;
        kelvin = celsius + 273.15;
        rankine = (celsius + 273.15) * 9/5;
        
        return {
            celsius: celsius,
            fahrenheit: fahrenheit,
            kelvin: kelvin,
            rankine: rankine
        };
    }
    
    checkAbsoluteZero(temperatures) {
        const warnings = [];
        
        if (temperatures.kelvin < 0) {
            warnings.push('Temperature is below absolute zero (impossible)');
        }
        
        if (temperatures.celsius < -273.15) {
            warnings.push('Celsius temperature is below absolute zero (-273.15°C)');
        }
        
        if (temperatures.fahrenheit < -459.67) {
            warnings.push('Fahrenheit temperature is below absolute zero (-459.67°F)');
        }
        
        if (temperatures.rankine < 0) {
            warnings.push('Rankine temperature is below absolute zero (0°R)');
        }
        
        return warnings;
    }
    
    getTemperatureContext(celsius) {
        if (celsius < -200) {
            return {
                context: 'Cryogenic Range',
                description: 'Liquid nitrogen and helium temperatures',
                color: '#0066cc'
            };
        } else if (celsius < 0) {
            return {
                context: 'Freezing Range',
                description: 'Below water freezing point',
                color: '#3399ff'
            };
        } else if (celsius <= 25) {
            return {
                context: 'Cool to Room Temperature',
                description: 'Comfortable human environment',
                color: '#66cc66'
            };
        } else if (celsius <= 40) {
            return {
                context: 'Warm Temperature',
                description: 'Hot weather or body temperature range',
                color: '#ffcc00'
            };
        } else if (celsius <= 100) {
            return {
                context: 'Hot Temperature',
                description: 'Very hot weather to water boiling',
                color: '#ff9900'
            };
        } else if (celsius <= 1000) {
            return {
                context: 'High Temperature',
                description: 'Industrial processes, furnaces',
                color: '#ff6600'
            };
        } else {
            return {
                context: 'Extreme High Temperature',
                description: 'Metallurgy, plasma physics',
                color: '#ff0000'
            };
        }
    }
    
    showResults(data) {
        if (!this.resultSection || !this.resultsContent) return;

        const context = this.getTemperatureContext(data.temperatures.celsius);

        // Show loading state on mobile
        if (window.mobileOptimization && window.mobileOptimization.isMobile) {
            this.resultSection.style.opacity = '0.5';
        }
        
        let resultsHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Input</h4>
                    <p><strong>${data.inputTemp}</strong> ${this.getScaleSymbol(data.fromScale)}</p>
                </div>
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Temperature Context</h4>
                    <div style="padding: 10px; background: ${context.color}; border-radius: 5px; color: white;">
                        <strong>${context.context}</strong><br>
                        ${context.description}
                    </div>
                </div>
            </div>
        `;
        
        // Add conversion results
        resultsHTML += '<div style="margin-bottom: 15px;"><h4 style="margin: 0 0 10px 0; color: #003366;">Conversion Results</h4>';
        
        if (data.outputScales.celsius) {
            resultsHTML += `<p><strong>Celsius:</strong> ${data.temperatures.celsius.toFixed(data.precision)}°C</p>`;
        }
        
        if (data.outputScales.fahrenheit) {
            resultsHTML += `<p><strong>Fahrenheit:</strong> ${data.temperatures.fahrenheit.toFixed(data.precision)}°F</p>`;
        }
        
        if (data.outputScales.kelvin) {
            resultsHTML += `<p><strong>Kelvin:</strong> ${data.temperatures.kelvin.toFixed(data.precision)} K</p>`;
        }
        
        if (data.outputScales.rankine) {
            resultsHTML += `<p><strong>Rankine:</strong> ${data.temperatures.rankine.toFixed(data.precision)}°R</p>`;
        }
        
        resultsHTML += '</div>';
        
        // Add warnings if any
        if (data.absoluteZeroCheck.length > 0) {
            resultsHTML += `
                <div style="margin-bottom: 15px; padding: 10px; background: #ffebee; border: 1px solid #f44336; border-radius: 5px;">
                    <h4 style="margin: 0 0 10px 0; color: #c62828;">Warnings</h4>
                    ${data.absoluteZeroCheck.map(warning => `<p style="color: #c62828; margin: 5px 0;">${warning}</p>`).join('')}
                </div>
            `;
        }
        
        // Add reference points
        resultsHTML += `
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Reference Points</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Absolute Zero:</strong> -273.15°C = -459.67°F = 0 K</p>
                    <p><strong>Water Freezing:</strong> 0°C = 32°F = 273.15 K</p>
                    <p><strong>Room Temperature:</strong> 20°C = 68°F = 293.15 K</p>
                    <p><strong>Human Body:</strong> 37°C = 98.6°F = 310.15 K</p>
                    <p><strong>Water Boiling:</strong> 100°C = 212°F = 373.15 K</p>
                </div>
            </div>
        `;
        
        // Add conversion formulas
        resultsHTML += `
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Conversion Formulas</h4>
                <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; font-size: 14px;">
                    <p><strong>°F = (°C × 9/5) + 32</strong></p>
                    <p><strong>°C = (°F - 32) × 5/9</strong></p>
                    <p><strong>K = °C + 273.15</strong></p>
                    <p><strong>°R = (°C + 273.15) × 9/5</strong></p>
                </div>
            </div>
        `;
        
        this.resultsContent.innerHTML = resultsHTML;
        this.resultSection.style.display = 'block';

        // Mobile optimization: scroll to results and restore opacity
        if (window.mobileOptimization && window.mobileOptimization.isMobile) {
            setTimeout(() => {
                this.resultSection.style.opacity = '1';
                this.resultSection.style.transition = 'opacity 0.3s ease';

                // Trigger scroll to results
                if (typeof MobileOptimization !== 'undefined') {
                    MobileOptimization.scrollToResults();
                }
            }, 100);
        }
    }
    
    getScaleSymbol(scale) {
        const symbols = {
            celsius: '°C',
            fahrenheit: '°F',
            kelvin: 'K',
            rankine: '°R'
        };
        return symbols[scale] || '';
    }
    
    hideResults() {
        if (this.resultSection) {
            this.resultSection.style.display = 'none';
        }
    }
    
    clearForm() {
        document.getElementById('cinputtemp').value = '25';
        document.getElementById('cfromscale').value = 'celsius';
        document.getElementById('cprecision').value = '2';
        
        // Reset checkboxes
        document.getElementById('ctocelsius').checked = true;
        document.getElementById('ctofahrenheit').checked = true;
        document.getElementById('ctokelvin').checked = true;
        document.getElementById('ctorankine').checked = false;
        
        this.hideResults();
    }
    
    performSearch() {
        const searchInput = document.getElementById('calcSearchTerm');
        const searchOutput = document.getElementById('calcSearchOut');
        
        if (!searchInput || !searchOutput) return;
        
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;
        
        const calculators = [
            { name: 'Temperature Calculator', url: 'temperature-calculator.html', keywords: ['temperature', 'celsius', 'fahrenheit', 'kelvin'] },
            { name: 'Pressure Calculator', url: 'pressure-calculator.html', keywords: ['pressure', 'kpa', 'psi', 'bar'] },
            { name: 'Density Calculator', url: 'density-calculator.html', keywords: ['density', 'mass', 'volume'] },
            { name: 'Psychrometric Calculator', url: 'psychrometric-calculator.html', keywords: ['psychrometric', 'hvac', 'air'] }
        ];
        
        const results = calculators.filter(calc => 
            calc.name.toLowerCase().includes(query) || 
            calc.keywords.some(keyword => keyword.includes(query))
        );
        
        if (results.length > 0) {
            searchOutput.innerHTML = results.map(result => 
                `<div style="padding: 5px 0;"><a href="${result.url}">${result.name}</a></div>`
            ).join('');
        } else {
            searchOutput.innerHTML = '<div style="padding: 5px 0; color: #666;">No calculators found</div>';
        }
    }
}

// Initialize temperature calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TemperatureCalculator();
});
