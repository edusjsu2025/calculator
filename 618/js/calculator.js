// Main Calculator JavaScript for Dry Calculator
class DryCalculator {
    constructor() {
        this.display = document.getElementById('sciOutPut');
        this.input = document.getElementById('sciInPut');
        this.history = document.getElementById('scihistory');
        this.currentInput = '';
        this.result = 0;
        this.operator = '';
        this.previousInput = '';
        this.memory = 0;
        
        this.initializeButtons();
        this.initializeSearch();
    }
    
    initializeButtons() {
        // Number buttons
        const numberButtons = document.querySelectorAll('.scinm');
        numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.textContent === '.') {
                    this.addDecimal();
                } else {
                    this.addNumber(button.textContent);
                }
            });
        });
        
        // Function buttons
        const functionButtons = document.querySelectorAll('.scifunc');
        functionButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleFunction(button.textContent);
            });
        });
        
        // Operator buttons
        const operatorButtons = document.querySelectorAll('.sciop');
        operatorButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleOperator(button.textContent);
            });
        });
        
        // Equals buttons
        const equalsButtons = document.querySelectorAll('.scieq');
        equalsButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.textContent === '=') {
                    this.calculate();
                } else if (button.textContent === 'AC') {
                    this.clear();
                }
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
    
    addNumber(num) {
        if (this.currentInput === '0' && num !== '.') {
            this.currentInput = num;
        } else {
            this.currentInput += num;
        }
        this.updateDisplay();
    }
    
    addDecimal() {
        if (this.currentInput.indexOf('.') === -1) {
            if (this.currentInput === '') {
                this.currentInput = '0.';
            } else {
                this.currentInput += '.';
            }
            this.updateDisplay();
        }
    }
    
    handleFunction(func) {
        const num = parseFloat(this.currentInput) || 0;
        let result = 0;
        
        switch(func) {
            case 'MC%':
                // Moisture Content calculation placeholder
                this.showMoistureContentDialog();
                return;
            case 'RH%':
                // Relative Humidity calculation placeholder
                this.showRelativeHumidityDialog();
                return;
            case 'EMC':
                // Equilibrium Moisture Content calculation placeholder
                this.showEMCDialog();
                return;
            case 'sin':
                result = Math.sin(this.toRadians(num));
                break;
            case 'cos':
                result = Math.cos(this.toRadians(num));
                break;
            case 'tan':
                result = Math.tan(this.toRadians(num));
                break;
            case 'ln':
                result = Math.log(num);
                break;
            case 'log':
                result = Math.log10(num);
                break;
            case '√x':
                result = Math.sqrt(num);
                break;
            case 'x²':
                result = num * num;
                break;
            case 'x³':
                result = num * num * num;
                break;
            case '1/x':
                result = 1 / num;
                break;
            case 'n!':
                result = this.factorial(num);
                break;
            case 'π':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;
            default:
                return;
        }
        
        this.currentInput = result.toString();
        this.updateDisplay();
    }
    
    handleOperator(op) {
        switch(op) {
            case '+':
            case '−':
            case '×':
            case '/':
                this.setOperator(op);
                break;
            case 'Back':
                this.backspace();
                break;
            case 'Ans':
                this.currentInput = this.result.toString();
                this.updateDisplay();
                break;
            case 'M+':
                this.memory += parseFloat(this.currentInput) || 0;
                break;
            case 'M-':
                this.memory -= parseFloat(this.currentInput) || 0;
                break;
            case 'MR':
                this.currentInput = this.memory.toString();
                this.updateDisplay();
                break;
            case '±':
                this.currentInput = (-(parseFloat(this.currentInput) || 0)).toString();
                this.updateDisplay();
                break;
            case 'RND':
                this.currentInput = Math.random().toString();
                this.updateDisplay();
                break;
            case 'EXP':
                this.currentInput += 'e';
                this.updateDisplay();
                break;
        }
    }
    
    setOperator(op) {
        if (this.operator && this.previousInput) {
            this.calculate();
        }
        this.operator = op;
        this.previousInput = this.currentInput;
        this.currentInput = '';
    }
    
    calculate() {
        if (!this.operator || !this.previousInput) return;
        
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput) || 0;
        let result = 0;
        
        switch(this.operator) {
            case '+':
                result = prev + current;
                break;
            case '−':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '/':
                result = prev / current;
                break;
        }
        
        this.result = result;
        this.currentInput = result.toString();
        this.operator = '';
        this.previousInput = '';
        this.updateDisplay();
        this.addToHistory(`${prev} ${this.operator} ${current} = ${result}`);
    }
    
    clear() {
        this.currentInput = '';
        this.result = 0;
        this.operator = '';
        this.previousInput = '';
        this.updateDisplay();
    }
    
    backspace() {
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateDisplay();
    }
    
    updateDisplay() {
        if (this.display) {
            this.display.textContent = this.currentInput || '0';
        }
        if (this.input) {
            this.input.innerHTML = this.operator ? `${this.previousInput} ${this.operator}` : '&nbsp;';
        }
    }
    
    addToHistory(calculation) {
        if (this.history) {
            const historyItem = document.createElement('div');
            historyItem.textContent = calculation;
            historyItem.style.fontSize = '12px';
            historyItem.style.color = '#666';
            historyItem.style.padding = '2px 5px';
            this.history.appendChild(historyItem);
            
            // Keep only last 5 calculations
            while (this.history.children.length > 5) {
                this.history.removeChild(this.history.firstChild);
            }
        }
    }
    
    toRadians(degrees) {
        const radSetting = document.querySelector('input[name="scirdsetting"]:checked');
        if (radSetting && radSetting.value === 'rad') {
            return degrees;
        }
        return degrees * Math.PI / 180;
    }
    
    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    showMoistureContentDialog() {
        alert('Moisture Content Calculator\nRedirecting to specialized calculator...');
        window.location.href = 'moisture-content-calculator.html';
    }
    
    showRelativeHumidityDialog() {
        alert('Relative Humidity Calculator\nRedirecting to specialized calculator...');
        window.location.href = 'relative-humidity-calculator.html';
    }
    
    showEMCDialog() {
        alert('Equilibrium Moisture Content Calculator\nRedirecting to specialized calculator...');
        window.location.href = 'equilibrium-moisture-calculator.html';
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
            { name: 'Relative Humidity Calculator', url: 'relative-humidity-calculator.html', keywords: ['humidity', 'relative', 'rh', 'air'] },
            { name: 'Dew Point Calculator', url: 'dew-point-calculator.html', keywords: ['dew', 'point', 'temperature'] },
            { name: 'Drying Time Calculator', url: 'drying-time-calculator.html', keywords: ['drying', 'time', 'evaporation'] },
            { name: 'Wood Moisture Calculator', url: 'wood-moisture-calculator.html', keywords: ['wood', 'lumber', 'timber'] }
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

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DryCalculator();
});
