// Wood Moisture Calculator JavaScript
class WoodCalculator {
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
            this.calculateWoodMoisture();
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
                this.calculateWoodMoisture();
            });
        });
        
        // Method change handler
        const methodRadios = this.form.querySelectorAll('input[name="cmethod"]');
        methodRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.toggleMethodInputs();
                this.calculateWoodMoisture();
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
    
    calculateWoodMoisture() {
        const method = document.querySelector('input[name="cmethod"]:checked').value;
        const species = document.getElementById('cspecies').value;
        const thickness = parseFloat(document.getElementById('cthickness').value) || 25;
        const intendedUse = document.getElementById('cuse').value;
        
        let moistureContent = 0;
        let calculationDetails = {};
        
        if (method === 'oven') {
            const greenWeight = parseFloat(document.getElementById('cgreenweight').value) || 0;
            const ovenWeight = parseFloat(document.getElementById('covenweight').value) || 0;
            
            if (greenWeight <= 0 || ovenWeight <= 0) {
                this.hideResults();
                return;
            }
            
            if (greenWeight < ovenWeight) {
                this.showError('Green weight cannot be less than oven dry weight');
                return;
            }
            
            moistureContent = ((greenWeight - ovenWeight) / ovenWeight) * 100;
            calculationDetails = {
                method: 'Oven Dry Method',
                greenWeight: greenWeight,
                ovenWeight: ovenWeight,
                waterWeight: greenWeight - ovenWeight
            };
        } else {
            const meterReading = parseFloat(document.getElementById('cmeterreading').value) || 0;
            
            if (meterReading < 0) {
                this.hideResults();
                return;
            }
            
            // Apply species correction factor for moisture meter
            const correctionFactor = this.getSpeciesCorrectionFactor(species);
            moistureContent = meterReading * correctionFactor;
            
            calculationDetails = {
                method: 'Moisture Meter',
                meterReading: meterReading,
                correctionFactor: correctionFactor
            };
        }
        
        this.showResults(moistureContent, calculationDetails, species, thickness, intendedUse);
    }
    
    getSpeciesCorrectionFactor(species) {
        const factors = {
            general: 1.0,
            oak: 0.95,
            maple: 0.98,
            pine: 1.02,
            fir: 1.01,
            cedar: 1.05,
            walnut: 0.96,
            cherry: 0.97,
            birch: 0.99,
            ash: 0.94,
            poplar: 1.03,
            mahogany: 0.98
        };
        return factors[species] || 1.0;
    }
    
    getSpeciesInfo(species) {
        const speciesData = {
            general: {
                name: 'General Hardwood',
                fsp: 28,
                shrinkage: 'Moderate',
                characteristics: 'Average properties for mixed hardwood species'
            },
            oak: {
                name: 'Oak',
                fsp: 28,
                shrinkage: 'High',
                characteristics: 'Dense hardwood, excellent for furniture and flooring'
            },
            maple: {
                name: 'Maple',
                fsp: 29,
                shrinkage: 'Moderate',
                characteristics: 'Hard, close-grained wood, good for flooring and furniture'
            },
            pine: {
                name: 'Pine',
                fsp: 30,
                shrinkage: 'Moderate',
                characteristics: 'Softwood, widely used for construction and millwork'
            },
            fir: {
                name: 'Douglas Fir',
                fsp: 28,
                shrinkage: 'Low',
                characteristics: 'Strong softwood, excellent for structural applications'
            },
            cedar: {
                name: 'Cedar',
                fsp: 26,
                shrinkage: 'Very Low',
                characteristics: 'Naturally decay resistant, ideal for outdoor use'
            },
            walnut: {
                name: 'Walnut',
                fsp: 27,
                shrinkage: 'Low',
                characteristics: 'Premium hardwood, highly valued for fine furniture'
            },
            cherry: {
                name: 'Cherry',
                fsp: 28,
                shrinkage: 'Moderate',
                characteristics: 'Beautiful hardwood, popular for cabinetry and furniture'
            },
            birch: {
                name: 'Birch',
                fsp: 29,
                shrinkage: 'High',
                characteristics: 'Hard, strong wood, good for plywood and furniture'
            },
            ash: {
                name: 'Ash',
                fsp: 30,
                shrinkage: 'High',
                characteristics: 'Tough, elastic wood, excellent for tool handles'
            },
            poplar: {
                name: 'Poplar',
                fsp: 32,
                shrinkage: 'Moderate',
                characteristics: 'Soft hardwood, good for painted furniture and millwork'
            },
            mahogany: {
                name: 'Mahogany',
                fsp: 27,
                shrinkage: 'Low',
                characteristics: 'Stable, beautiful wood, prized for fine furniture'
            }
        };
        return speciesData[species] || speciesData.general;
    }
    
    getUseRecommendations(intendedUse) {
        const recommendations = {
            construction: {
                name: 'Construction Lumber',
                targetMC: '19% maximum (S-DRY), 15% maximum (KD-15)',
                considerations: 'Must meet building code requirements. Higher moisture content may cause shrinkage problems.'
            },
            furniture: {
                name: 'Furniture Making',
                targetMC: '6-8%',
                considerations: 'Low moisture content prevents movement and joint failure. Acclimate to shop conditions.'
            },
            flooring: {
                name: 'Flooring',
                targetMC: '6-9%',
                considerations: 'Must match equilibrium moisture content of installation environment.'
            },
            millwork: {
                name: 'Millwork',
                targetMC: '8-12%',
                considerations: 'Moderate moisture content for stability. Consider seasonal movement.'
            },
            outdoor: {
                name: 'Outdoor Use',
                targetMC: '12-15%',
                considerations: 'Higher moisture content acceptable. Focus on decay resistance and treatment.'
            },
            kiln: {
                name: 'Kiln Drying',
                targetMC: 'Variable by schedule',
                considerations: 'Follow species-specific kiln schedules. Monitor for drying defects.'
            }
        };
        return recommendations[intendedUse] || recommendations.construction;
    }
    
    assessMoistureLevel(moistureContent, species, intendedUse) {
        const speciesInfo = this.getSpeciesInfo(species);
        const useInfo = this.getUseRecommendations(intendedUse);
        
        // Extract target moisture content range
        let targetRange = useInfo.targetMC;
        let isOptimal = false;
        let assessment = '';
        let color = '#f44336';
        
        if (intendedUse === 'construction') {
            isOptimal = moistureContent <= 19;
            assessment = moistureContent <= 15 ? 'KD-15 Grade' : moistureContent <= 19 ? 'S-DRY Grade' : 'Too High for Construction';
            color = moistureContent <= 15 ? '#4caf50' : moistureContent <= 19 ? '#2196f3' : '#f44336';
        } else if (intendedUse === 'furniture') {
            isOptimal = moistureContent >= 6 && moistureContent <= 8;
            assessment = isOptimal ? 'Optimal for Furniture' : moistureContent < 6 ? 'Too Dry' : 'Too High';
            color = isOptimal ? '#4caf50' : '#ff9800';
        } else if (intendedUse === 'flooring') {
            isOptimal = moistureContent >= 6 && moistureContent <= 9;
            assessment = isOptimal ? 'Suitable for Flooring' : moistureContent < 6 ? 'Too Dry' : 'Too High';
            color = isOptimal ? '#4caf50' : '#ff9800';
        }
        
        return {
            level: assessment,
            description: useInfo.considerations,
            color: color,
            fiberSaturation: moistureContent > speciesInfo.fsp ? 'Above Fiber Saturation Point' : 'Below Fiber Saturation Point'
        };
    }
    
    showResults(moistureContent, details, species, thickness, intendedUse) {
        if (!this.resultSection || !this.resultsContent) return;
        
        const speciesInfo = this.getSpeciesInfo(species);
        const useInfo = this.getUseRecommendations(intendedUse);
        const assessment = this.assessMoistureLevel(moistureContent, species, intendedUse);
        
        this.resultsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Calculation Results</h4>
                    <p><strong>Moisture Content:</strong> ${moistureContent.toFixed(2)}%</p>
                    <p><strong>Wood Species:</strong> ${speciesInfo.name}</p>
                    <p><strong>Measurement Method:</strong> ${details.method}</p>
                    <p><strong>Intended Use:</strong> ${useInfo.name}</p>
                </div>
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Quality Assessment</h4>
                    <div style="padding: 10px; background: ${assessment.color}; border-radius: 5px; color: white;">
                        <strong>${assessment.level}</strong><br>
                        ${assessment.fiberSaturation}
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Species Information</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Fiber Saturation Point:</strong> ~${speciesInfo.fsp}%</p>
                    <p><strong>Shrinkage Characteristics:</strong> ${speciesInfo.shrinkage}</p>
                    <p><strong>Description:</strong> ${speciesInfo.characteristics}</p>
                </div>
            </div>
            
            ${details.method === 'Oven Dry Method' ? `
                <div style="margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Calculation Details</h4>
                    <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                        <p><strong>Green Weight:</strong> ${details.greenWeight} grams</p>
                        <p><strong>Oven Dry Weight:</strong> ${details.ovenWeight} grams</p>
                        <p><strong>Water Weight:</strong> ${details.waterWeight.toFixed(2)} grams</p>
                        <p><strong>Formula:</strong> MC = [(Green Weight - Oven Dry Weight) / Oven Dry Weight] × 100%</p>
                    </div>
                </div>
            ` : `
                <div style="margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Meter Reading Details</h4>
                    <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px;">
                        <p><strong>Raw Meter Reading:</strong> ${details.meterReading}%</p>
                        <p><strong>Species Correction Factor:</strong> ${details.correctionFactor}</p>
                        <p><strong>Corrected Moisture Content:</strong> ${moistureContent.toFixed(2)}%</p>
                    </div>
                </div>
            `}
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Recommendations for ${useInfo.name}</h4>
                <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; font-size: 14px;">
                    <p><strong>Target Moisture Content:</strong> ${useInfo.targetMC}</p>
                    <p><strong>Considerations:</strong> ${useInfo.considerations}</p>
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
        document.getElementById('cgreenweight').value = '1000';
        document.getElementById('covenweight').value = '750';
        document.getElementById('cmeterreading').value = '12';
        document.getElementById('cthickness').value = '25';
        document.getElementById('cspecies').value = 'general';
        document.getElementById('cuse').value = 'construction';
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
            { name: 'Wood Moisture Calculator', url: 'wood-moisture-calculator.html', keywords: ['wood', 'lumber', 'timber', 'moisture'] },
            { name: 'Moisture Content Calculator', url: 'moisture-content-calculator.html', keywords: ['moisture', 'content', 'wet', 'dry'] },
            { name: 'Kiln Drying Calculator', url: 'kiln-drying-calculator.html', keywords: ['kiln', 'drying', 'schedule'] },
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

// Initialize wood calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WoodCalculator();
});
