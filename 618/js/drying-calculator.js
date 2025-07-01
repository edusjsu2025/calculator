// Drying Time Calculator JavaScript
class DryingCalculator {
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
            this.calculateDryingTime();
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
                this.calculateDryingTime();
            });
            input.addEventListener('change', () => {
                this.calculateDryingTime();
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
    
    calculateDryingTime() {
        const material = document.getElementById('cmaterial').value;
        const initialMC = parseFloat(document.getElementById('cinitial').value) || 0;
        const targetMC = parseFloat(document.getElementById('ctarget').value) || 0;
        const temperature = parseFloat(document.getElementById('ctemperature').value) || 20;
        const humidity = parseFloat(document.getElementById('chumidity').value) || 50;
        const airVelocity = parseFloat(document.getElementById('cairvelocity').value) || 1;
        const thickness = parseFloat(document.getElementById('cthickness').value) || 25;
        
        if (initialMC <= 0 || targetMC < 0 || temperature <= 0) {
            this.hideResults();
            return;
        }
        
        if (targetMC >= initialMC) {
            this.showError('Target moisture content must be less than initial moisture content');
            return;
        }
        
        if (humidity < 0 || humidity > 100) {
            this.showError('Relative humidity must be between 0% and 100%');
            return;
        }
        
        // Calculate drying time using empirical models
        const dryingTime = this.calculateDryingTimeModel(material, initialMC, targetMC, temperature, humidity, airVelocity, thickness);
        
        this.showResults({
            material,
            initialMC,
            targetMC,
            temperature,
            humidity,
            airVelocity,
            thickness,
            dryingTime
        });
    }
    
    calculateDryingTimeModel(material, initialMC, targetMC, temperature, humidity, airVelocity, thickness) {
        // Get material properties
        const materialProps = this.getMaterialProperties(material);
        
        // Calculate moisture to be removed
        const moistureReduction = initialMC - targetMC;
        
        // Base drying rate (kg water/m²/hour) - simplified model
        let baseDryingRate = materialProps.baseDryingRate;
        
        // Temperature effect (Arrhenius-type relationship)
        const tempEffect = Math.exp((temperature - 20) / 20);
        
        // Humidity effect (driving force)
        const humidityEffect = Math.max(0.1, (100 - humidity) / 100);
        
        // Air velocity effect (mass transfer coefficient)
        const velocityEffect = Math.pow(airVelocity, 0.6);
        
        // Thickness effect (diffusion path)
        const thicknessEffect = Math.pow(thickness / 25, materialProps.thicknessExponent);
        
        // Calculate effective drying rate
        const effectiveDryingRate = baseDryingRate * tempEffect * humidityEffect * velocityEffect / thicknessEffect;
        
        // Calculate drying time (hours)
        // Simplified model: assumes linear drying in falling rate period
        const dryingTimeHours = (moistureReduction / effectiveDryingRate) * materialProps.timeMultiplier;
        
        return {
            hours: dryingTimeHours,
            days: dryingTimeHours / 24,
            effectiveDryingRate: effectiveDryingRate,
            moistureReduction: moistureReduction
        };
    }
    
    getMaterialProperties(material) {
        const properties = {
            wood: {
                name: 'Wood (Lumber)',
                baseDryingRate: 0.5,
                thicknessExponent: 2.0,
                timeMultiplier: 1.0,
                characteristics: 'Anisotropic material, drying rate depends on grain direction'
            },
            grain: {
                name: 'Grain',
                baseDryingRate: 2.0,
                thicknessExponent: 1.5,
                timeMultiplier: 0.8,
                characteristics: 'Small particles, relatively fast drying'
            },
            concrete: {
                name: 'Concrete',
                baseDryingRate: 0.1,
                thicknessExponent: 2.5,
                timeMultiplier: 2.0,
                characteristics: 'Dense material, very slow moisture migration'
            },
            textile: {
                name: 'Textile',
                baseDryingRate: 3.0,
                thicknessExponent: 1.2,
                timeMultiplier: 0.5,
                characteristics: 'Porous material, fast surface evaporation'
            },
            paper: {
                name: 'Paper',
                baseDryingRate: 4.0,
                thicknessExponent: 1.0,
                timeMultiplier: 0.3,
                characteristics: 'Thin, porous material, very fast drying'
            },
            food: {
                name: 'Food Products',
                baseDryingRate: 1.5,
                thicknessExponent: 1.8,
                timeMultiplier: 1.2,
                characteristics: 'Variable properties, temperature sensitive'
            },
            general: {
                name: 'General Material',
                baseDryingRate: 1.0,
                thicknessExponent: 1.5,
                timeMultiplier: 1.0,
                characteristics: 'Average properties for mixed materials'
            }
        };
        return properties[material] || properties.general;
    }
    
    getDryingPhases(initialMC, targetMC, materialProps) {
        // Estimate drying phases
        const totalReduction = initialMC - targetMC;
        const constantRatePhase = Math.min(totalReduction * 0.3, initialMC * 0.2);
        const fallingRatePhase = totalReduction - constantRatePhase;
        
        return {
            constantRate: {
                moistureReduction: constantRatePhase,
                description: 'Surface moisture evaporates at constant rate'
            },
            fallingRate: {
                moistureReduction: fallingRatePhase,
                description: 'Internal moisture migration becomes limiting'
            }
        };
    }
    
    getOptimizationSuggestions(data) {
        const suggestions = [];
        
        if (data.temperature < 40) {
            suggestions.push('Consider increasing temperature to 40-60°C for faster drying');
        }
        if (data.temperature > 80) {
            suggestions.push('High temperature may cause quality issues - monitor carefully');
        }
        if (data.humidity > 70) {
            suggestions.push('High humidity slows drying - improve ventilation or dehumidification');
        }
        if (data.airVelocity < 1) {
            suggestions.push('Increase air velocity to improve mass transfer');
        }
        if (data.airVelocity > 5) {
            suggestions.push('Very high air velocity may not provide proportional benefits');
        }
        if (data.thickness > 50) {
            suggestions.push('Consider reducing thickness or increasing drying time');
        }
        
        return suggestions;
    }
    
    showResults(data) {
        if (!this.resultSection || !this.resultsContent) return;
        
        const materialProps = this.getMaterialProperties(data.material);
        const dryingPhases = this.getDryingPhases(data.initialMC, data.targetMC, materialProps);
        const suggestions = this.getOptimizationSuggestions(data);
        
        this.resultsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Estimated Drying Time</h4>
                    <p><strong>Total Time:</strong> ${data.dryingTime.hours.toFixed(1)} hours</p>
                    <p><strong>Days:</strong> ${data.dryingTime.days.toFixed(1)} days</p>
                    <p><strong>Material:</strong> ${materialProps.name}</p>
                    <p><strong>Moisture Reduction:</strong> ${data.dryingTime.moistureReduction.toFixed(1)}%</p>
                </div>
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Process Parameters</h4>
                    <p><strong>Temperature:</strong> ${data.temperature}°C</p>
                    <p><strong>Relative Humidity:</strong> ${data.humidity}%</p>
                    <p><strong>Air Velocity:</strong> ${data.airVelocity} m/s</p>
                    <p><strong>Thickness:</strong> ${data.thickness} mm</p>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Drying Phases</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Constant Rate Phase:</strong> ${dryingPhases.constantRate.moistureReduction.toFixed(1)}% moisture reduction</p>
                    <p style="font-size: 12px; color: #666;">${dryingPhases.constantRate.description}</p>
                    <p><strong>Falling Rate Phase:</strong> ${dryingPhases.fallingRate.moistureReduction.toFixed(1)}% moisture reduction</p>
                    <p style="font-size: 12px; color: #666;">${dryingPhases.fallingRate.description}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Material Characteristics</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Effective Drying Rate:</strong> ${data.dryingTime.effectiveDryingRate.toFixed(3)} %/hour</p>
                    <p><strong>Material Properties:</strong> ${materialProps.characteristics}</p>
                </div>
            </div>
            
            ${suggestions.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Optimization Suggestions</h4>
                    <div style="background: #fff3e0; border: 1px solid #ff9800; padding: 15px; border-radius: 5px; font-size: 14px;">
                        <ul style="margin: 0; padding-left: 20px;">
                            ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            ` : ''}
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Important Notes</h4>
                <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; font-size: 14px;">
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>Estimates based on simplified models - actual times may vary</li>
                        <li>Monitor material condition during drying process</li>
                        <li>Adjust parameters based on quality requirements</li>
                        <li>Consider energy costs and environmental impact</li>
                        <li>Follow safety guidelines for temperature and ventilation</li>
                    </ul>
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
        document.getElementById('cmaterial').value = 'wood';
        document.getElementById('cinitial').value = '25';
        document.getElementById('ctarget').value = '12';
        document.getElementById('ctemperature').value = '60';
        document.getElementById('chumidity').value = '45';
        document.getElementById('cairvelocity').value = '2.0';
        document.getElementById('cthickness').value = '25';
        this.hideResults();
    }
    
    performSearch() {
        const searchInput = document.getElementById('calcSearchTerm');
        const searchOutput = document.getElementById('calcSearchOut');
        
        if (!searchInput || !searchOutput) return;
        
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;
        
        const calculators = [
            { name: 'Drying Time Calculator', url: 'drying-time-calculator.html', keywords: ['drying', 'time', 'evaporation'] },
            { name: 'Evaporation Rate Calculator', url: 'evaporation-rate-calculator.html', keywords: ['evaporation', 'rate'] },
            { name: 'Kiln Drying Calculator', url: 'kiln-drying-calculator.html', keywords: ['kiln', 'drying', 'lumber'] },
            { name: 'Heat Requirement Calculator', url: 'heat-requirement-calculator.html', keywords: ['heat', 'energy', 'requirement'] }
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

// Initialize drying calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DryingCalculator();
});
