// Dew Point Calculator JavaScript
class DewPointCalculator {
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
            this.calculateDewPoint();
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
                this.calculateDewPoint();
            });
        });
        
        // Unit change handler
        const unitRadios = this.form.querySelectorAll('input[name="cunit"]');
        unitRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateTemperatureUnits();
                this.calculateDewPoint();
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
    
    calculateDewPoint() {
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
        
        // Calculate dew point using Magnus formula
        const dewPointC = this.calculateDewPointMagnus(airTempC, relativeHumidity);
        
        // Convert back to display unit if needed
        let dewPointDisplay = dewPointC;
        if (unit === 'fahrenheit') {
            dewPointDisplay = dewPointC * 9/5 + 32;
        }
        
        // Calculate additional psychrometric properties
        const absoluteHumidity = this.calculateAbsoluteHumidity(airTempC, relativeHumidity);
        const vaporPressure = this.getSaturatedVaporPressure(dewPointC);
        const satVaporPressure = this.getSaturatedVaporPressure(airTempC);
        
        this.showResults({
            airTemp: airTemp,
            airTempC: airTempC,
            relativeHumidity: relativeHumidity,
            dewPoint: dewPointDisplay,
            dewPointC: dewPointC,
            absoluteHumidity: absoluteHumidity,
            vaporPressure: vaporPressure,
            satVaporPressure: satVaporPressure,
            pressure: pressure,
            unit: unit
        });
    }
    
    calculateDewPointMagnus(tempC, rh) {
        // Magnus formula for dew point calculation
        const a = 17.27;
        const b = 237.7;
        
        const alpha = ((a * tempC) / (b + tempC)) + Math.log(rh / 100);
        const dewPoint = (b * alpha) / (a - alpha);
        
        return dewPoint;
    }
    
    getSaturatedVaporPressure(tempC) {
        // Magnus formula for saturated vapor pressure (kPa)
        const a = 6.112;
        const b = 17.67;
        const c = 243.5;
        
        return a * Math.exp((b * tempC) / (c + tempC));
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
    
    assessComfortLevel(dewPointC) {
        if (dewPointC < 10) {
            return {
                level: 'Very Dry',
                description: 'May feel dry, static electricity possible',
                color: '#ff9800',
                comfort: 'Low humidity conditions'
            };
        } else if (dewPointC <= 13) {
            return {
                level: 'Comfortable',
                description: 'Pleasant for most people',
                color: '#4caf50',
                comfort: 'Optimal comfort range'
            };
        } else if (dewPointC <= 16) {
            return {
                level: 'Slightly Humid',
                description: 'Noticeable but acceptable',
                color: '#2196f3',
                comfort: 'Slightly elevated humidity'
            };
        } else if (dewPointC <= 18) {
            return {
                level: 'Humid',
                description: 'Somewhat uncomfortable',
                color: '#ff9800',
                comfort: 'Moderately uncomfortable'
            };
        } else if (dewPointC <= 21) {
            return {
                level: 'Very Humid',
                description: 'Oppressive for most people',
                color: '#f44336',
                comfort: 'Uncomfortable conditions'
            };
        } else {
            return {
                level: 'Extremely Humid',
                description: 'Dangerous, heat stress risk',
                color: '#d32f2f',
                comfort: 'Potentially dangerous'
            };
        }
    }
    
    getCondensationRisk(airTempC, dewPointC) {
        const tempDifference = airTempC - dewPointC;
        
        if (tempDifference < 1) {
            return {
                risk: 'Very High',
                description: 'Condensation likely on any cool surface',
                color: '#d32f2f'
            };
        } else if (tempDifference < 3) {
            return {
                risk: 'High',
                description: 'Condensation possible on cold surfaces',
                color: '#f44336'
            };
        } else if (tempDifference < 5) {
            return {
                risk: 'Moderate',
                description: 'Condensation on very cold surfaces',
                color: '#ff9800'
            };
        } else if (tempDifference < 10) {
            return {
                risk: 'Low',
                description: 'Minimal condensation risk',
                color: '#2196f3'
            };
        } else {
            return {
                risk: 'Very Low',
                description: 'No condensation expected',
                color: '#4caf50'
            };
        }
    }
    
    showResults(data) {
        if (!this.resultSection || !this.resultsContent) return;
        
        const comfortLevel = this.assessComfortLevel(data.dewPointC);
        const condensationRisk = this.getCondensationRisk(data.airTempC, data.dewPointC);
        const tempDifference = data.airTempC - data.dewPointC;
        
        this.resultsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Calculation Results</h4>
                    <p><strong>Dew Point:</strong> ${data.dewPoint.toFixed(1)}${data.unit === 'celsius' ? '°C' : '°F'}</p>
                    <p><strong>Air Temperature:</strong> ${data.airTemp.toFixed(1)}${data.unit === 'celsius' ? '°C' : '°F'}</p>
                    <p><strong>Relative Humidity:</strong> ${data.relativeHumidity.toFixed(1)}%</p>
                    <p><strong>Temperature Difference:</strong> ${tempDifference.toFixed(1)}°C</p>
                </div>
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Comfort Assessment</h4>
                    <div style="padding: 10px; background: ${comfortLevel.color}; border-radius: 5px; color: white;">
                        <strong>${comfortLevel.level}</strong><br>
                        ${comfortLevel.description}
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Condensation Risk</h4>
                    <div style="padding: 10px; background: ${condensationRisk.color}; border-radius: 5px; color: white;">
                        <strong>${condensationRisk.risk} Risk</strong><br>
                        ${condensationRisk.description}
                    </div>
                </div>
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Additional Properties</h4>
                    <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                        <p><strong>Absolute Humidity:</strong> ${data.absoluteHumidity.toFixed(2)} g/m³</p>
                        <p><strong>Vapor Pressure:</strong> ${data.vaporPressure.toFixed(2)} kPa</p>
                        <p><strong>Sat. Vapor Pressure:</strong> ${data.satVaporPressure.toFixed(2)} kPa</p>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Calculation Method</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Formula Used:</strong> Magnus Formula</p>
                    <p><strong>α = ln(RH/100) + (17.27 × T)/(237.7 + T)</strong></p>
                    <p><strong>Td = (237.7 × α)/(17.27 - α)</strong></p>
                    <p>Where T = Air Temperature (°C), RH = Relative Humidity (%), Td = Dew Point (°C)</p>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Practical Applications</h4>
                <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; font-size: 14px;">
                    <p><strong>HVAC Design:</strong> Ensure surface temperatures stay above ${data.dewPointC.toFixed(1)}°C to prevent condensation</p>
                    <p><strong>Building Science:</strong> Use for insulation design and vapor barrier placement</p>
                    <p><strong>Weather Forecasting:</strong> Fog formation likely when air temperature approaches dew point</p>
                    <p><strong>Comfort Control:</strong> ${comfortLevel.comfort} - adjust humidity accordingly</p>
                </div>
            </div>
            
            ${tempDifference < 5 ? `
                <div style="margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Condensation Prevention</h4>
                    <div style="background: #fff3e0; border: 1px solid #ff9800; padding: 15px; border-radius: 5px; font-size: 14px;">
                        <p><strong>Recommended Actions:</strong></p>
                        <ul>
                            <li>Increase surface temperatures above ${(data.dewPointC + 2).toFixed(1)}°C</li>
                            <li>Improve insulation on cold surfaces</li>
                            <li>Reduce indoor humidity through ventilation</li>
                            <li>Use dehumidification if necessary</li>
                            <li>Ensure adequate air circulation</li>
                        </ul>
                    </div>
                </div>
            ` : ''}
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Environmental Conditions</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Atmospheric Pressure:</strong> ${data.pressure} kPa</p>
                    <p><strong>Temperature Unit:</strong> ${data.unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}</p>
                    <p><strong>Calculation Accuracy:</strong> ±0.5°C for temperatures between -40°C and +50°C</p>
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
            { name: 'Dew Point Calculator', url: 'dew-point-calculator.html', keywords: ['dew', 'point', 'temperature', 'condensation'] },
            { name: 'Relative Humidity Calculator', url: 'relative-humidity-calculator.html', keywords: ['humidity', 'relative', 'rh'] },
            { name: 'Wet Bulb Calculator', url: 'wet-bulb-calculator.html', keywords: ['wet', 'bulb', 'temperature'] },
            { name: 'Absolute Humidity Calculator', url: 'absolute-humidity-calculator.html', keywords: ['absolute', 'humidity', 'moisture'] }
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

// Initialize dew point calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DewPointCalculator();
});
