// Absolute Humidity Calculator JavaScript
class AbsoluteHumidityCalculator {
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
            this.calculateAbsoluteHumidity();
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
                this.calculateAbsoluteHumidity();
            });
        });
        
        // Unit change handler
        const unitRadios = this.form.querySelectorAll('input[name="cunit"]');
        unitRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateTemperatureUnits();
                this.calculateAbsoluteHumidity();
            });
        });
        
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
    
    updateTemperatureUnits() {
        const unit = document.querySelector('input[name="cunit"]:checked').value;
        const unitSymbol = unit === 'celsius' ? '°C' : '°F';
        
        const tempUnits = document.querySelectorAll('.temp-unit');
        tempUnits.forEach(span => {
            span.textContent = unitSymbol;
        });
    }
    
    calculateAbsoluteHumidity() {
        const unit = document.querySelector('input[name="cunit"]:checked').value;
        const pressure = parseFloat(document.getElementById('cpressure').value) || 101.325;
        
        let airTemp = parseFloat(document.getElementById('cairtemp').value);
        let relativeHumidity = parseFloat(document.getElementById('crelhumidity').value);
        
        if (isNaN(airTemp) || isNaN(relativeHumidity)) {
            this.hideResults();
            return;
        }
        
        if (relativeHumidity < 0 || relativeHumidity > 100) {
            this.showError('Relative humidity must be between 0% and 100%');
            return;
        }
        
        // Convert to Celsius if needed
        let airTempC = airTemp;
        if (unit === 'fahrenheit') {
            airTempC = (airTemp - 32) * 5/9;
        }
        
        // Calculate absolute humidity
        const absoluteHumidity = this.calculateAbsoluteHumidityValue(airTempC, relativeHumidity, pressure);
        
        // Calculate related parameters
        const dewPoint = this.calculateDewPoint(airTempC, relativeHumidity);
        const vaporPressure = this.getSaturatedVaporPressure(airTempC) * (relativeHumidity / 100);
        const specificHumidity = this.calculateSpecificHumidity(absoluteHumidity, pressure);
        const mixingRatio = this.calculateMixingRatio(absoluteHumidity, pressure);
        
        this.showResults({
            airTemp: airTemp,
            airTempC: airTempC,
            relativeHumidity: relativeHumidity,
            absoluteHumidity: absoluteHumidity,
            dewPoint: dewPoint,
            vaporPressure: vaporPressure,
            specificHumidity: specificHumidity,
            mixingRatio: mixingRatio,
            pressure: pressure,
            unit: unit
        });
    }
    
    calculateAbsoluteHumidityValue(tempC, rh, pressure) {
        // Calculate saturated vapor pressure using Magnus formula
        const satVapPress = this.getSaturatedVaporPressure(tempC);
        
        // Calculate actual vapor pressure
        const actualVapPress = satVapPress * (rh / 100);
        
        // Convert to absolute humidity using ideal gas law
        // AH = (e * 1000) / (Rv * T)
        // where Rv = 461.5 J/(kg·K) for water vapor
        const absoluteHumidity = (actualVapPress * 1000) / (461.5 * (tempC + 273.15));
        
        return absoluteHumidity;
    }
    
    getSaturatedVaporPressure(tempC) {
        // Magnus formula for saturated vapor pressure (kPa)
        const a = 6.112;
        const b = 17.67;
        const c = 243.5;
        
        return a * Math.exp((b * tempC) / (c + tempC));
    }
    
    calculateDewPoint(tempC, rh) {
        // Calculate dew point using Magnus formula
        const a = 17.27;
        const b = 237.7;
        
        const alpha = ((a * tempC) / (b + tempC)) + Math.log(rh / 100);
        const dewPoint = (b * alpha) / (a - alpha);
        
        return dewPoint;
    }
    
    calculateSpecificHumidity(absoluteHumidity, pressure) {
        // Convert absolute humidity to specific humidity
        // q = w / (1 + w) where w is mixing ratio
        const mixingRatio = this.calculateMixingRatio(absoluteHumidity, pressure) / 1000; // Convert to kg/kg
        const specificHumidity = mixingRatio / (1 + mixingRatio) * 1000; // Convert back to g/kg
        
        return specificHumidity;
    }
    
    calculateMixingRatio(absoluteHumidity, pressure) {
        // Calculate mixing ratio from absolute humidity
        // w = (e / (P - e)) * (Rd / Rv)
        // Simplified approximation: w ≈ AH * Rd * T / (P * 1000)
        // where Rd = 287 J/(kg·K) for dry air
        
        // More direct calculation using vapor pressure
        const vaporPressure = absoluteHumidity * 461.5 * (273.15 + 20) / 1000; // Approximate
        const mixingRatio = (vaporPressure / (pressure - vaporPressure)) * (287 / 461.5) * 1000;
        
        return mixingRatio;
    }
    
    getHumidityLevel(absoluteHumidity) {
        if (absoluteHumidity < 5) {
            return {
                level: 'Very Dry',
                description: 'Low moisture content, may cause discomfort',
                color: '#ff9800'
            };
        } else if (absoluteHumidity <= 12) {
            return {
                level: 'Comfortable',
                description: 'Optimal moisture content for most applications',
                color: '#4caf50'
            };
        } else if (absoluteHumidity <= 18) {
            return {
                level: 'Moderate',
                description: 'Acceptable moisture levels',
                color: '#2196f3'
            };
        } else if (absoluteHumidity <= 25) {
            return {
                level: 'High',
                description: 'Elevated moisture content',
                color: '#ff9800'
            };
        } else {
            return {
                level: 'Very High',
                description: 'Excessive moisture content',
                color: '#f44336'
            };
        }
    }
    
    showResults(data) {
        if (!this.resultSection || !this.resultsContent) return;
        
        const humidityLevel = this.getHumidityLevel(data.absoluteHumidity);
        
        // Convert dew point to display unit if needed
        let displayDewPoint = data.dewPoint;
        if (data.unit === 'fahrenheit') {
            displayDewPoint = data.dewPoint * 9/5 + 32;
        }
        
        this.resultsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Calculation Results</h4>
                    <p><strong>Absolute Humidity:</strong> ${data.absoluteHumidity.toFixed(2)} g/m³</p>
                    <p><strong>Air Temperature:</strong> ${data.airTemp.toFixed(1)}${data.unit === 'celsius' ? '°C' : '°F'}</p>
                    <p><strong>Relative Humidity:</strong> ${data.relativeHumidity.toFixed(1)}%</p>
                    <p><strong>Dew Point:</strong> ${displayDewPoint.toFixed(1)}${data.unit === 'celsius' ? '°C' : '°F'}</p>
                </div>
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Moisture Assessment</h4>
                    <div style="padding: 10px; background: ${humidityLevel.color}; border-radius: 5px; color: white;">
                        <strong>${humidityLevel.level}</strong><br>
                        ${humidityLevel.description}
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Related Humidity Parameters</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Vapor Pressure:</strong> ${data.vaporPressure.toFixed(3)} kPa</p>
                    <p><strong>Specific Humidity:</strong> ${data.specificHumidity.toFixed(2)} g/kg</p>
                    <p><strong>Mixing Ratio:</strong> ${data.mixingRatio.toFixed(2)} g/kg</p>
                    <p><strong>Atmospheric Pressure:</strong> ${data.pressure} kPa</p>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Calculation Method</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Formula:</strong> AH = (e × 1000) / (Rv × T)</p>
                    <p><strong>Where:</strong></p>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>e = actual vapor pressure (kPa)</li>
                        <li>Rv = 461.5 J/(kg·K) (specific gas constant for water vapor)</li>
                        <li>T = absolute temperature (K)</li>
                    </ul>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Applications</h4>
                <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; font-size: 14px;">
                    <p><strong>HVAC Design:</strong> Calculate latent cooling loads and dehumidification requirements</p>
                    <p><strong>Process Control:</strong> Monitor moisture content in manufacturing processes</p>
                    <p><strong>Material Storage:</strong> Assess moisture exposure for sensitive materials</p>
                    <p><strong>Energy Calculations:</strong> Determine energy required for moisture removal</p>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Comparison with Other Humidity Measures</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Absolute vs Relative Humidity:</strong> Absolute humidity is independent of temperature, while relative humidity varies with temperature</p>
                    <p><strong>Absolute vs Specific Humidity:</strong> Specific humidity accounts for air density changes with altitude and temperature</p>
                    <p><strong>Absolute vs Mixing Ratio:</strong> Mixing ratio is based on dry air mass, useful in meteorological applications</p>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Typical Values Reference</h4>
                <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Desert Air (35°C, 20% RH):</strong> ~7.1 g/m³</p>
                    <p><strong>Comfortable Indoor (22°C, 50% RH):</strong> ~9.7 g/m³</p>
                    <p><strong>Tropical Climate (30°C, 80% RH):</strong> ~24.3 g/m³</p>
                    <p><strong>Saturated Air (25°C, 100% RH):</strong> ~23.0 g/m³</p>
                </div>
            </div>
        `;
        
        this.resultSection.style.display = 'block';
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
        document.getElementById('cairtemp').value = '25';
        document.getElementById('crelhumidity').value = '60';
        document.getElementById('cpressure').value = '101.325';
        document.querySelector('input[name="cunit"][value="celsius"]').checked = true;
        this.updateTemperatureUnits();
        this.hideResults();
    }
    
    performSearch() {
        const searchInput = document.getElementById('calcSearchTerm');
        const searchOutput = document.getElementById('calcSearchOut');
        
        if (!searchInput || !searchOutput) return;
        
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;
        
        const calculators = [
            { name: 'Absolute Humidity Calculator', url: 'absolute-humidity-calculator.html', keywords: ['absolute', 'humidity', 'moisture', 'content'] },
            { name: 'Relative Humidity Calculator', url: 'relative-humidity-calculator.html', keywords: ['relative', 'humidity', 'rh'] },
            { name: 'Dew Point Calculator', url: 'dew-point-calculator.html', keywords: ['dew', 'point', 'temperature'] },
            { name: 'Mixing Ratio Calculator', url: 'mixing-ratio-calculator.html', keywords: ['mixing', 'ratio', 'specific'] }
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

// Initialize absolute humidity calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AbsoluteHumidityCalculator();
});
