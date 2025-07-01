// Grain Moisture Calculator JavaScript
class GrainCalculator {
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
            this.calculateGrainMoisture();
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
                this.calculateGrainMoisture();
            });
        });
        
        // Method change handler
        const methodRadios = this.form.querySelectorAll('input[name="cmethod"]');
        methodRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.toggleMethodInputs();
                this.calculateGrainMoisture();
            });
        });
        
        this.toggleMethodInputs();
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
        const ovenInputs = document.getElementById('oven-inputs');
        const ovenInputs2 = document.getElementById('oven-inputs2');
        const meterInput = document.getElementById('meter-input');
        
        if (method === 'oven') {
            ovenInputs.style.display = 'table-row';
            ovenInputs2.style.display = 'table-row';
            meterInput.style.display = 'none';
        } else {
            ovenInputs.style.display = 'none';
            ovenInputs2.style.display = 'none';
            meterInput.style.display = 'table-row';
        }
    }
    
    calculateGrainMoisture() {
        const method = document.querySelector('input[name="cmethod"]:checked').value;
        const grainType = document.getElementById('cgraintype').value;
        const storageDuration = document.getElementById('cstorage').value;
        const temperature = parseFloat(document.getElementById('ctemperature').value) || 20;
        
        let moistureContent = 0;
        let calculationDetails = {};
        
        if (method === 'oven') {
            const wetWeight = parseFloat(document.getElementById('cwetweight').value) || 0;
            const dryWeight = parseFloat(document.getElementById('cdryweight').value) || 0;
            
            if (wetWeight <= 0 || dryWeight <= 0) {
                this.hideResults();
                return;
            }
            
            if (wetWeight < dryWeight) {
                this.showError('Wet weight cannot be less than dry weight');
                return;
            }
            
            // Grain moisture is typically calculated on wet basis
            moistureContent = ((wetWeight - dryWeight) / wetWeight) * 100;
            calculationDetails = {
                method: 'Oven Method (Wet Basis)',
                wetWeight: wetWeight,
                dryWeight: dryWeight,
                waterWeight: wetWeight - dryWeight
            };
        } else {
            const meterReading = parseFloat(document.getElementById('cmeterreading').value) || 0;
            
            if (meterReading < 0) {
                this.hideResults();
                return;
            }
            
            // Apply grain-specific correction if needed
            const correctionFactor = this.getGrainCorrectionFactor(grainType, temperature);
            moistureContent = meterReading * correctionFactor;
            
            calculationDetails = {
                method: 'Moisture Meter',
                meterReading: meterReading,
                correctionFactor: correctionFactor,
                temperatureCorrection: temperature !== 20
            };
        }
        
        this.showResults(moistureContent, calculationDetails, grainType, storageDuration, temperature);
    }
    
    getGrainCorrectionFactor(grainType, temperature) {
        // Base correction factors for different grain types
        const baseFactors = {
            wheat: 1.0,
            corn: 1.02,
            rice: 0.98,
            soybeans: 0.96,
            barley: 1.01,
            oats: 1.03,
            sorghum: 1.01,
            sunflower: 0.94,
            canola: 0.95,
            general: 1.0
        };
        
        // Temperature correction (approximate)
        const tempCorrection = 1 + (temperature - 20) * 0.002;
        
        return (baseFactors[grainType] || 1.0) * tempCorrection;
    }
    
    getGrainInfo(grainType) {
        const grainData = {
            wheat: {
                name: 'Wheat',
                safeShort: 14.0,
                safeLong: 13.0,
                commercial: 13.5,
                characteristics: 'Major cereal grain, sensitive to moisture and temperature'
            },
            corn: {
                name: 'Corn (Maize)',
                safeShort: 15.5,
                safeLong: 14.0,
                commercial: 15.0,
                characteristics: 'High oil content, prone to heating if too wet'
            },
            rice: {
                name: 'Rice',
                safeShort: 14.0,
                safeLong: 13.0,
                commercial: 14.0,
                characteristics: 'Requires careful drying to prevent kernel damage'
            },
            soybeans: {
                name: 'Soybeans',
                safeShort: 13.0,
                safeLong: 11.0,
                commercial: 13.0,
                characteristics: 'High protein and oil content, very sensitive to moisture'
            },
            barley: {
                name: 'Barley',
                safeShort: 14.5,
                safeLong: 13.0,
                commercial: 14.0,
                characteristics: 'Used for malting and feed, quality sensitive to moisture'
            },
            oats: {
                name: 'Oats',
                safeShort: 14.0,
                safeLong: 13.0,
                commercial: 14.0,
                characteristics: 'High hull content, requires careful handling'
            },
            sorghum: {
                name: 'Sorghum',
                safeShort: 14.0,
                safeLong: 13.0,
                commercial: 14.0,
                characteristics: 'Drought-resistant grain, similar to corn in storage'
            },
            sunflower: {
                name: 'Sunflower Seeds',
                safeShort: 10.0,
                safeLong: 8.0,
                commercial: 10.0,
                characteristics: 'High oil content, very sensitive to moisture and heat'
            },
            canola: {
                name: 'Canola',
                safeShort: 10.0,
                safeLong: 8.0,
                commercial: 10.0,
                characteristics: 'Oilseed crop, requires low moisture for safe storage'
            },
            general: {
                name: 'General Grain',
                safeShort: 14.0,
                safeLong: 13.0,
                commercial: 14.0,
                characteristics: 'Average values for mixed grain types'
            }
        };
        return grainData[grainType] || grainData.general;
    }
    
    getStorageRecommendations(storageDuration) {
        const recommendations = {
            immediate: {
                name: 'Immediate Processing',
                description: 'Grain will be processed within days',
                moistureAllowance: 'Higher moisture acceptable',
                considerations: 'Focus on processing efficiency rather than storage stability'
            },
            short: {
                name: 'Short Term Storage (< 6 months)',
                description: 'Storage for one season or less',
                moistureAllowance: 'Standard safe moisture levels',
                considerations: 'Monitor for heating and insect activity'
            },
            medium: {
                name: 'Medium Term Storage (6-12 months)',
                description: 'Storage through one full year',
                moistureAllowance: '1-2% below standard levels',
                considerations: 'Regular monitoring essential, consider aeration'
            },
            long: {
                name: 'Long Term Storage (> 12 months)',
                description: 'Multi-year storage',
                moistureAllowance: '2-3% below standard levels',
                considerations: 'Requires excellent storage conditions and monitoring'
            }
        };
        return recommendations[storageDuration] || recommendations.short;
    }
    
    assessMoistureLevel(moistureContent, grainType, storageDuration, temperature) {
        const grainInfo = this.getGrainInfo(grainType);
        const storageInfo = this.getStorageRecommendations(storageDuration);
        
        let targetMoisture = grainInfo.safeShort;
        if (storageDuration === 'long') {
            targetMoisture = grainInfo.safeLong;
        } else if (storageDuration === 'medium') {
            targetMoisture = grainInfo.safeShort - 1;
        } else if (storageDuration === 'immediate') {
            targetMoisture = grainInfo.commercial + 2;
        }
        
        let assessment = '';
        let color = '#f44336';
        let riskLevel = 'High Risk';
        
        if (moistureContent <= targetMoisture) {
            assessment = 'Safe for Storage';
            color = '#4caf50';
            riskLevel = 'Low Risk';
        } else if (moistureContent <= targetMoisture + 1) {
            assessment = 'Marginal - Monitor Closely';
            color = '#ff9800';
            riskLevel = 'Medium Risk';
        } else if (moistureContent <= targetMoisture + 2) {
            assessment = 'Too High - Dry Before Storage';
            color = '#f44336';
            riskLevel = 'High Risk';
        } else {
            assessment = 'Dangerous - Immediate Action Required';
            color = '#d32f2f';
            riskLevel = 'Very High Risk';
        }
        
        // Temperature adjustment
        if (temperature > 25) {
            riskLevel = 'Higher risk due to elevated temperature';
        }
        
        return {
            level: assessment,
            riskLevel: riskLevel,
            color: color,
            targetMoisture: targetMoisture
        };
    }
    
    showResults(moistureContent, details, grainType, storageDuration, temperature) {
        if (!this.resultSection || !this.resultsContent) return;
        
        const grainInfo = this.getGrainInfo(grainType);
        const storageInfo = this.getStorageRecommendations(storageDuration);
        const assessment = this.assessMoistureLevel(moistureContent, grainType, storageDuration, temperature);
        
        this.resultsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Calculation Results</h4>
                    <p><strong>Moisture Content:</strong> ${moistureContent.toFixed(2)}%</p>
                    <p><strong>Grain Type:</strong> ${grainInfo.name}</p>
                    <p><strong>Measurement Method:</strong> ${details.method}</p>
                    <p><strong>Storage Duration:</strong> ${storageInfo.name}</p>
                </div>
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Storage Assessment</h4>
                    <div style="padding: 10px; background: ${assessment.color}; border-radius: 5px; color: white;">
                        <strong>${assessment.level}</strong><br>
                        ${assessment.riskLevel}
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Grain Information</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Safe Moisture (Short Term):</strong> ${grainInfo.safeShort}%</p>
                    <p><strong>Safe Moisture (Long Term):</strong> ${grainInfo.safeLong}%</p>
                    <p><strong>Commercial Standard:</strong> ${grainInfo.commercial}%</p>
                    <p><strong>Target for ${storageInfo.name}:</strong> ${assessment.targetMoisture}%</p>
                </div>
            </div>
            
            ${details.method === 'Oven Method (Wet Basis)' ? `
                <div style="margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Calculation Details</h4>
                    <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                        <p><strong>Wet Weight:</strong> ${details.wetWeight} grams</p>
                        <p><strong>Dry Weight:</strong> ${details.dryWeight} grams</p>
                        <p><strong>Water Weight:</strong> ${details.waterWeight.toFixed(2)} grams</p>
                        <p><strong>Formula:</strong> MC = [(Wet Weight - Dry Weight) / Wet Weight] × 100%</p>
                    </div>
                </div>
            ` : `
                <div style="margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Meter Reading Details</h4>
                    <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                        <p><strong>Raw Meter Reading:</strong> ${details.meterReading}%</p>
                        <p><strong>Correction Factor:</strong> ${details.correctionFactor.toFixed(3)}</p>
                        <p><strong>Corrected Moisture Content:</strong> ${moistureContent.toFixed(2)}%</p>
                        ${details.temperatureCorrection ? `<p><strong>Temperature Correction Applied:</strong> ${temperature}°C</p>` : ''}
                    </div>
                </div>
            `}
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Storage Recommendations</h4>
                <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Storage Type:</strong> ${storageInfo.description}</p>
                    <p><strong>Moisture Allowance:</strong> ${storageInfo.moistureAllowance}</p>
                    <p><strong>Considerations:</strong> ${storageInfo.considerations}</p>
                    <p><strong>Grain Characteristics:</strong> ${grainInfo.characteristics}</p>
                </div>
            </div>
            
            ${moistureContent > assessment.targetMoisture ? `
                <div style="margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Action Required</h4>
                    <div style="background: #fff3e0; border: 1px solid #ff9800; padding: 15px; border-radius: 5px; font-size: 14px;">
                        <p><strong>Moisture Reduction Needed:</strong> ${(moistureContent - assessment.targetMoisture).toFixed(2)}%</p>
                        <p><strong>Recommended Actions:</strong></p>
                        <ul>
                            <li>Dry grain before storage</li>
                            <li>Increase aeration if already in storage</li>
                            <li>Monitor temperature closely</li>
                            <li>Check for signs of heating or spoilage</li>
                        </ul>
                    </div>
                </div>
            ` : ''}
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
        document.getElementById('cwetweight').value = '100';
        document.getElementById('cdryweight').value = '87';
        document.getElementById('cmeterreading').value = '14';
        document.getElementById('ctemperature').value = '20';
        document.getElementById('cgraintype').value = 'wheat';
        document.getElementById('cstorage').value = 'short';
        document.querySelector('input[name="cmethod"][value="oven"]').checked = true;
        this.toggleMethodInputs();
        this.hideResults();
    }
    
    performSearch() {
        const searchInput = document.getElementById('calcSearchTerm');
        const searchOutput = document.getElementById('calcSearchOut');
        
        if (!searchInput || !searchOutput) return;
        
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;
        
        const calculators = [
            { name: 'Grain Moisture Calculator', url: 'grain-moisture-calculator.html', keywords: ['grain', 'wheat', 'corn', 'rice', 'moisture'] },
            { name: 'Moisture Content Calculator', url: 'moisture-content-calculator.html', keywords: ['moisture', 'content', 'wet', 'dry'] },
            { name: 'Drying Time Calculator', url: 'drying-time-calculator.html', keywords: ['drying', 'time', 'grain'] },
            { name: 'Equilibrium Moisture Calculator', url: 'equilibrium-moisture-calculator.html', keywords: ['equilibrium', 'emc'] }
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

// Initialize grain calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GrainCalculator();
});
