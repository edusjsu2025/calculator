// Relative Humidity Calculator JavaScript
class HumidityCalculator {
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
            this.calculateRelativeHumidity();
        });
        
        // Clear button functionality
        const clearBtn = this.form.querySelector('input[type="button"]');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearForm();
            });
        }
        
        // Real-time calculation on input change
        const inputs = this.form.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculateRelativeHumidity();
            });
        });
        
        // Method change handler
        const methodRadios = this.form.querySelectorAll('input[name="cmethod"]');
        methodRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.toggleMethodInputs();
                this.calculateRelativeHumidity();
            });
        });
        
        // Unit change handler
        const unitRadios = this.form.querySelectorAll('input[name="cunit"]');
        unitRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateTemperatureUnits();
                this.calculateRelativeHumidity();
            });
        });
        
        this.toggleMethodInputs();
        this.updateTemperatureUnits();
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
    
    toggleMethodInputs() {
        const method = document.querySelector('input[name="cmethod"]:checked').value;
        const wetbulbRow = document.getElementById('wetbulb-row');
        const dewpointRow = document.getElementById('dewpoint-row');
        
        if (method === 'wetbulb') {
            wetbulbRow.style.display = 'table-row';
            dewpointRow.style.display = 'none';
        } else {
            wetbulbRow.style.display = 'none';
            dewpointRow.style.display = 'table-row';
        }
    }
    
    updateTemperatureUnits() {
        const unit = document.querySelector('input[name="cunit"]:checked').value;
        const unitSymbol = unit === 'celsius' ? '°C' : '°F';
        
        const tempUnits = document.querySelectorAll('.temp-unit');
        tempUnits.forEach(span => {
            span.textContent = unitSymbol;
        });
    }
    
    calculateRelativeHumidity() {
        const method = document.querySelector('input[name="cmethod"]:checked').value;
        const unit = document.querySelector('input[name="cunit"]:checked').value;
        const pressure = parseFloat(document.getElementById('cpressure').value) || 101.325;
        
        let dryBulb = parseFloat(document.getElementById('cdrybulb').value);
        if (isNaN(dryBulb)) {
            this.hideResults();
            return;
        }
        
        // Convert to Celsius if needed
        if (unit === 'fahrenheit') {
            dryBulb = (dryBulb - 32) * 5/9;
        }
        
        let relativeHumidity = 0;
        let calculationDetails = {};
        
        if (method === 'wetbulb') {
            let wetBulb = parseFloat(document.getElementById('cwetbulb').value);
            if (isNaN(wetBulb)) {
                this.hideResults();
                return;
            }
            
            if (unit === 'fahrenheit') {
                wetBulb = (wetBulb - 32) * 5/9;
            }
            
            if (wetBulb > dryBulb) {
                this.showError('Wet bulb temperature cannot be higher than dry bulb temperature');
                return;
            }
            
            relativeHumidity = this.calculateRHFromWetBulb(dryBulb, wetBulb, pressure);
            calculationDetails = {
                method: 'Wet Bulb Method',
                dryBulb: dryBulb,
                wetBulb: wetBulb,
                pressure: pressure,
                unit: unit
            };
        } else {
            let dewPoint = parseFloat(document.getElementById('cdewpoint').value);
            if (isNaN(dewPoint)) {
                this.hideResults();
                return;
            }
            
            if (unit === 'fahrenheit') {
                dewPoint = (dewPoint - 32) * 5/9;
            }
            
            if (dewPoint > dryBulb) {
                this.showError('Dew point temperature cannot be higher than dry bulb temperature');
                return;
            }
            
            relativeHumidity = this.calculateRHFromDewPoint(dryBulb, dewPoint);
            calculationDetails = {
                method: 'Dew Point Method',
                dryBulb: dryBulb,
                dewPoint: dewPoint,
                unit: unit
            };
        }
        
        this.showResults(relativeHumidity, calculationDetails);
    }
    
    calculateRHFromWetBulb(dryBulb, wetBulb, pressure) {
        // Psychrometric calculation using wet bulb temperature
        // Simplified calculation - in practice, more complex psychrometric equations are used
        
        const satVapPressDry = this.getSaturatedVaporPressure(dryBulb);
        const satVapPressWet = this.getSaturatedVaporPressure(wetBulb);
        
        // Psychrometric constant (approximately 0.665 kPa/°C at standard pressure)
        const psychrometricConstant = 0.665 * (pressure / 101.325);
        
        const actualVaporPressure = satVapPressWet - psychrometricConstant * (dryBulb - wetBulb);
        const relativeHumidity = (actualVaporPressure / satVapPressDry) * 100;
        
        return Math.max(0, Math.min(100, relativeHumidity));
    }
    
    calculateRHFromDewPoint(dryBulb, dewPoint) {
        // Calculate RH from dew point using vapor pressure
        const satVapPressDry = this.getSaturatedVaporPressure(dryBulb);
        const satVapPressDew = this.getSaturatedVaporPressure(dewPoint);
        
        const relativeHumidity = (satVapPressDew / satVapPressDry) * 100;
        
        return Math.max(0, Math.min(100, relativeHumidity));
    }
    
    getSaturatedVaporPressure(tempC) {
        // Magnus formula for saturated vapor pressure (kPa)
        // Valid for temperature range -45°C to +60°C
        const a = 6.112;
        const b = 17.67;
        const c = 243.5;
        
        return a * Math.exp((b * tempC) / (c + tempC));
    }
    
    showResults(relativeHumidity, details) {
        if (!this.resultSection || !this.resultsContent) return;
        
        const humidityLevel = this.assessHumidityLevel(relativeHumidity);
        const dewPoint = this.calculateDewPoint(details.dryBulb, relativeHumidity);
        const absoluteHumidity = this.calculateAbsoluteHumidity(details.dryBulb, relativeHumidity);
        
        // Convert temperatures back to display unit if needed
        let displayDryBulb = details.dryBulb;
        let displayDewPoint = dewPoint;
        
        if (details.unit === 'fahrenheit') {
            displayDryBulb = details.dryBulb * 9/5 + 32;
            displayDewPoint = dewPoint * 9/5 + 32;
        }
        
        this.resultsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Calculation Results</h4>
                    <p><strong>Relative Humidity:</strong> ${relativeHumidity.toFixed(1)}%</p>
                    <p><strong>Dew Point:</strong> ${displayDewPoint.toFixed(1)}${details.unit === 'celsius' ? '°C' : '°F'}</p>
                    <p><strong>Absolute Humidity:</strong> ${absoluteHumidity.toFixed(2)} g/m³</p>
                    <p><strong>Method:</strong> ${details.method}</p>
                </div>
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Comfort Assessment</h4>
                    <div style="padding: 10px; background: ${humidityLevel.color}; border-radius: 5px; color: white;">
                        <strong>${humidityLevel.level}</strong><br>
                        ${humidityLevel.description}
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Input Parameters</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Dry Bulb Temperature:</strong> ${displayDryBulb.toFixed(1)}${details.unit === 'celsius' ? '°C' : '°F'}</p>
                    ${details.wetBulb !== undefined ? 
                        `<p><strong>Wet Bulb Temperature:</strong> ${(details.unit === 'fahrenheit' ? details.wetBulb * 9/5 + 32 : details.wetBulb).toFixed(1)}${details.unit === 'celsius' ? '°C' : '°F'}</p>` :
                        `<p><strong>Dew Point Temperature:</strong> ${displayDewPoint.toFixed(1)}${details.unit === 'celsius' ? '°C' : '°F'}</p>`
                    }
                    ${details.pressure ? `<p><strong>Atmospheric Pressure:</strong> ${details.pressure} kPa</p>` : ''}
                </div>
            </div>
            
            <div>
                <h4 style="margin: 0 0 10px 0; color: #003366;">Applications</h4>
                <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; font-size: 14px;">
                    <p><strong>HVAC Design:</strong> Use for sizing equipment and determining comfort conditions</p>
                    <p><strong>Agriculture:</strong> Monitor greenhouse conditions and crop storage environments</p>
                    <p><strong>Industrial:</strong> Control manufacturing processes sensitive to humidity</p>
                    <p><strong>Building Science:</strong> Assess condensation risk and indoor air quality</p>
                </div>
            </div>
        `;
        
        this.resultSection.style.display = 'block';
    }
    
    calculateDewPoint(tempC, rh) {
        // Calculate dew point using Magnus formula
        const a = 17.27;
        const b = 237.7;
        
        const alpha = ((a * tempC) / (b + tempC)) + Math.log(rh / 100);
        const dewPoint = (b * alpha) / (a - alpha);
        
        return dewPoint;
    }
    
    calculateAbsoluteHumidity(tempC, rh) {
        // Calculate absolute humidity in g/m³
        const satVapPress = this.getSaturatedVaporPressure(tempC);
        const actualVapPress = satVapPress * (rh / 100);
        
        // Convert to absolute humidity using ideal gas law
        // AH = (e * 1000) / (Rv * T)
        // where Rv = 461.5 J/(kg·K) for water vapor
        const absoluteHumidity = (actualVapPress * 1000) / (461.5 * (tempC + 273.15));
        
        return absoluteHumidity;
    }
    
    assessHumidityLevel(rh) {
        if (rh < 30) {
            return {
                level: 'Too Dry',
                description: 'May cause discomfort, static electricity, and respiratory issues',
                color: '#ff9800'
            };
        } else if (rh <= 50) {
            return {
                level: 'Comfortable',
                description: 'Ideal range for human comfort and most applications',
                color: '#4caf50'
            };
        } else if (rh <= 70) {
            return {
                level: 'Moderate',
                description: 'Acceptable but may feel slightly humid',
                color: '#2196f3'
            };
        } else {
            return {
                level: 'Too Humid',
                description: 'May promote mold growth and condensation problems',
                color: '#f44336'
            };
        }
    }
    
    hideResults() {
        if (this.resultSection) {
            this.resultSection.style.display = 'none';
        }
    }
    
    showError(message) {
        if (!this.resultSection || !this.resultsContent) return;
        
        this.resultsContent.innerHTML = `
            <div style="background: #ffebee; border: 1px solid #f44336; color: #c62828; padding: 15px; border-radius: 5px;">
                <strong>Error:</strong> ${message}
            </div>
        `;
        
        this.resultSection.style.display = 'block';
    }
    
    clearForm() {
        document.getElementById('cdrybulb').value = '25';
        document.getElementById('cwetbulb').value = '20';
        document.getElementById('cdewpoint').value = '15';
        document.getElementById('cpressure').value = '101.325';
        document.querySelector('input[name="cmethod"][value="wetbulb"]').checked = true;
        document.querySelector('input[name="cunit"][value="celsius"]').checked = true;
        this.toggleMethodInputs();
        this.updateTemperatureUnits();
        this.hideResults();
    }
    
    performSearch() {
        const searchInput = document.getElementById('calcSearchTerm');
        const searchOutput = document.getElementById('calcSearchOut');
        
        if (!searchInput || !searchOutput) return;
        
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;
        
        // Simple search functionality
        const calculators = [
            { name: 'Relative Humidity Calculator', url: 'relative-humidity-calculator.html', keywords: ['humidity', 'relative', 'rh', 'air'] },
            { name: 'Absolute Humidity Calculator', url: 'absolute-humidity-calculator.html', keywords: ['absolute', 'humidity', 'moisture'] },
            { name: 'Dew Point Calculator', url: 'dew-point-calculator.html', keywords: ['dew', 'point', 'temperature'] },
            { name: 'Wet Bulb Calculator', url: 'wet-bulb-calculator.html', keywords: ['wet', 'bulb', 'temperature'] },
            { name: 'Psychrometric Calculator', url: 'psychrometric-calculator.html', keywords: ['psychrometric', 'chart', 'air'] }
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

// Initialize humidity calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HumidityCalculator();
});
