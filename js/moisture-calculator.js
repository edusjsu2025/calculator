// Moisture Content Calculator JavaScript
class MoistureCalculator {
    constructor() {
        this.form = document.querySelector('form[name="calform"]');
        this.resultSection = document.getElementById('result-section');
        this.resultsContent = document.getElementById('results-content');
        
        this.initializeForm();
        this.initializeSearch();
    }
    
    initializeForm() {
        if (!this.form) return;

        // Check if already initialized to prevent duplicate listeners
        if (this.form.hasAttribute('data-calculator-initialized')) return;
        this.form.setAttribute('data-calculator-initialized', 'true');

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateMoistureContent();
        });

        // Clear button functionality
        const clearBtn = this.form.querySelector('input[type="button"]');
        if (clearBtn && !clearBtn.hasAttribute('data-listener-added')) {
            clearBtn.setAttribute('data-listener-added', 'true');
            clearBtn.addEventListener('click', () => {
                this.clearForm();
            });
        }

        // Real-time calculation on input change
        const inputs = this.form.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            if (!input.hasAttribute('data-listener-added')) {
                input.setAttribute('data-listener-added', 'true');
                input.addEventListener('input', () => {
                    this.calculateMoistureContent();
                });
            }
        });

        // Method change handler
        const methodRadios = this.form.querySelectorAll('input[name="cmethod"]');
        methodRadios.forEach(radio => {
            if (!radio.hasAttribute('data-listener-added')) {
                radio.setAttribute('data-listener-added', 'true');
                radio.addEventListener('change', () => {
                    this.calculateMoistureContent();
                });
            }
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
    
    calculateMoistureContent() {
        const wetWeight = parseFloat(document.getElementById('cwetweight').value) || 0;
        const dryWeight = parseFloat(document.getElementById('cdryweight').value) || 0;
        const method = document.querySelector('input[name="cmethod"]:checked').value;
        const material = document.getElementById('cmaterial').value;
        
        if (wetWeight <= 0 || dryWeight <= 0) {
            this.hideResults();
            return;
        }
        
        if (wetWeight < dryWeight) {
            this.showError('Wet weight cannot be less than dry weight');
            return;
        }
        
        const waterWeight = wetWeight - dryWeight;
        let moistureContent = 0;
        let formula = '';
        let explanation = '';
        
        if (method === 'wet') {
            moistureContent = (waterWeight / wetWeight) * 100;
            formula = 'MC = [(Wet Weight - Dry Weight) / Wet Weight] × 100%';
            explanation = 'Wet basis moisture content expresses water content as a percentage of the total wet weight.';
        } else {
            moistureContent = (waterWeight / dryWeight) * 100;
            formula = 'MC = [(Wet Weight - Dry Weight) / Dry Weight] × 100%';
            explanation = 'Dry basis moisture content expresses water content as a percentage of the dry weight.';
        }
        
        this.showResults({
            moistureContent,
            waterWeight,
            wetWeight,
            dryWeight,
            method,
            material,
            formula,
            explanation
        });
    }
    
    showResults(data) {
        if (!this.resultSection || !this.resultsContent) return;
        
        const materialInfo = this.getMaterialInfo(data.material);
        const qualityAssessment = this.assessMoistureLevel(data.moistureContent, data.material);
        
        this.resultsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Calculation Results</h4>
                    <p><strong>Moisture Content:</strong> ${data.moistureContent.toFixed(2)}%</p>
                    <p><strong>Water Weight:</strong> ${data.waterWeight.toFixed(2)} grams</p>
                    <p><strong>Method:</strong> ${data.method === 'wet' ? 'Wet Basis' : 'Dry Basis'}</p>
                    <p><strong>Material:</strong> ${materialInfo.name}</p>
                </div>
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Quality Assessment</h4>
                    <div style="padding: 10px; background: ${qualityAssessment.color}; border-radius: 5px; color: white;">
                        <strong>${qualityAssessment.level}</strong><br>
                        ${qualityAssessment.description}
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Formula Used</h4>
                <div style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-family: monospace;">
                    ${data.formula}
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 5px;">${data.explanation}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #003366;">Calculation Steps</h4>
                <ol style="font-size: 14px; line-height: 1.6;">
                    <li>Water Weight = Wet Weight - Dry Weight = ${data.wetWeight} - ${data.dryWeight} = ${data.waterWeight.toFixed(2)} grams</li>
                    <li>Moisture Content = ${data.method === 'wet' ? 
                        `(${data.waterWeight.toFixed(2)} / ${data.wetWeight}) × 100% = ${data.moistureContent.toFixed(2)}%` :
                        `(${data.waterWeight.toFixed(2)} / ${data.dryWeight}) × 100% = ${data.moistureContent.toFixed(2)}%`
                    }</li>
                </ol>
            </div>
            
            ${materialInfo.guidelines ? `
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #003366;">Material Guidelines</h4>
                    <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; font-size: 14px;">
                        ${materialInfo.guidelines}
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
    
    getMaterialInfo(material) {
        const materials = {
            general: {
                name: 'General Material',
                guidelines: null
            },
            wood: {
                name: 'Wood',
                guidelines: 'For construction lumber: 6-12% is ideal for indoor use. Above 20% may lead to decay and insect problems. Kiln-dried lumber typically has 6-12% moisture content.'
            },
            grain: {
                name: 'Grain',
                guidelines: 'Safe storage moisture levels: Wheat 13-14%, Corn 14-15%, Rice 13-14%, Soybeans 11-13%. Higher levels may cause spoilage and mold growth.'
            },
            soil: {
                name: 'Soil',
                guidelines: 'Optimal soil moisture varies by soil type and crop. Sandy soils: 10-20%, Clay soils: 20-40%, Loam soils: 15-30%. Field capacity is typically 20-35%.'
            },
            concrete: {
                name: 'Concrete',
                guidelines: 'Fresh concrete: 15-20% moisture. For flooring installations, concrete should be below 4-5% moisture content. High moisture can cause adhesive failures.'
            },
            paper: {
                name: 'Paper',
                guidelines: 'Standard paper: 4-6% moisture content. Newsprint: 7-9%. Higher moisture can cause dimensional changes and print quality issues.'
            },
            textile: {
                name: 'Textile',
                guidelines: 'Cotton: 7-8.5%, Wool: 13-18%, Synthetic fibers: 0.5-4%. Proper moisture content affects comfort, processing, and dimensional stability.'
            }
        };
        
        return materials[material] || materials.general;
    }
    
    assessMoistureLevel(moistureContent, material) {
        // Define moisture level thresholds for different materials
        const thresholds = {
            wood: { low: 12, high: 20 },
            grain: { low: 14, high: 18 },
            soil: { low: 15, high: 35 },
            concrete: { low: 4, high: 8 },
            paper: { low: 6, high: 10 },
            textile: { low: 8, high: 15 },
            general: { low: 10, high: 25 }
        };
        
        const threshold = thresholds[material] || thresholds.general;
        
        if (moistureContent < threshold.low) {
            return {
                level: 'Low Moisture',
                description: 'Below optimal range - may be too dry',
                color: '#ff9800'
            };
        } else if (moistureContent > threshold.high) {
            return {
                level: 'High Moisture',
                description: 'Above optimal range - may cause problems',
                color: '#f44336'
            };
        } else {
            return {
                level: 'Optimal Range',
                description: 'Within acceptable moisture content range',
                color: '#4caf50'
            };
        }
    }
    
    clearForm() {
        document.getElementById('cwetweight').value = '100';
        document.getElementById('cdryweight').value = '85';
        document.getElementById('cmaterial').value = 'general';
        document.querySelector('input[name="cmethod"][value="wet"]').checked = true;
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
            { name: 'Moisture Content Calculator', url: 'moisture-content-calculator.html', keywords: ['moisture', 'content', 'wet', 'dry'] },
            { name: 'Dry Basis Calculator', url: 'dry-basis-calculator.html', keywords: ['dry', 'basis', 'moisture'] },
            { name: 'Wet Basis Calculator', url: 'wet-basis-calculator.html', keywords: ['wet', 'basis', 'moisture'] },
            { name: 'Equilibrium Moisture Calculator', url: 'equilibrium-moisture-calculator.html', keywords: ['equilibrium', 'emc', 'moisture'] },
            { name: 'Wood Moisture Calculator', url: 'wood-moisture-calculator.html', keywords: ['wood', 'lumber', 'timber'] },
            { name: 'Grain Moisture Calculator', url: 'grain-moisture-calculator.html', keywords: ['grain', 'wheat', 'corn', 'rice'] },
            { name: 'Soil Moisture Calculator', url: 'soil-moisture-calculator.html', keywords: ['soil', 'earth', 'ground'] }
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

// Initialize moisture calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.moistureCalculator = new MoistureCalculator();
});
