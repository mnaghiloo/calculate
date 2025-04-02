document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const calculator = document.querySelector('.calculator');
    const themeSwitch = document.getElementById('theme-switch');
    const historyDisplay = document.getElementById('history');
    const currentInput = document.getElementById('current-input');
    const buttons = document.querySelectorAll('.btn');
    
    // Calculator State
    const state = {
        currentValue: '0',
        previousValue: null,
        operator: null,
        waitingForOperand: false,
        history: [],
        memory: 0,
        advancedMode: false
    };
    
    // Initialize calculator
    init();
    
    function init() {
        // Add event listeners
        buttons.forEach(button => {
            button.addEventListener('click', () => handleButtonClick(button));
            button.addEventListener('mousedown', () => button.classList.add('btn-animation'));
            button.addEventListener('animationend', () => button.classList.remove('btn-animation'));
        });
        
        // Theme toggle functionality
        themeSwitch.addEventListener('change', toggleTheme);
        
        // Keyboard support
        document.addEventListener('keydown', handleKeyboardInput);
        
        // Load saved theme preference
        loadThemePreference();
    }
    
    // Theme toggle
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        // Save preference
        localStorage.setItem('calculatorTheme', themeSwitch.checked ? 'dark' : 'light');
    }
    
    // Load theme preference from localStorage
    function loadThemePreference() {
        const savedTheme = localStorage.getItem('calculatorTheme');
        if (savedTheme === 'dark') {
            themeSwitch.checked = true;
            document.body.classList.add('dark-theme');
        }
    }
    
    // Handle button clicks
    function handleButtonClick(button) {
        const action = button.dataset.action;
        const value = button.dataset.value;
        
        if (value) {
            inputDigit(value);
        } else if (action) {
            switch (action) {
                case 'add':
                case 'subtract':
                case 'multiply':
                case 'divide':
                    handleOperator(action);
                    break;
                case 'clear':
                    clearAll();
                    break;
                case 'delete':
                    deleteLastDigit();
                    break;
                case 'calculate':
                    calculate();
                    break;
                case 'decimal':
                    inputDecimal();
                    break;
                case 'percent':
                    percent();
                    break;
                case 'toggle-advanced':
                    toggleAdvancedMode();
                    break;
                case 'sin':
                case 'cos':
                case 'tan':
                case 'log':
                case 'ln':
                case 'sqrt':
                    handleAdvancedOperation(action);
                    break;
                case 'pow':
                    handleOperator('pow');
                    break;
            }
        }
        
        updateDisplay();
    }
    
    // Handle keyboard input
    function handleKeyboardInput(e) {
        if (e.key >= '0' && e.key <= '9') {
            inputDigit(e.key);
        } else if (e.key === '.') {
            inputDecimal();
        } else if (e.key === '+') {
            handleOperator('add');
        } else if (e.key === '-') {
            handleOperator('subtract');
        } else if (e.key === '*') {
            handleOperator('multiply');
        } else if (e.key === '/') {
            e.preventDefault();
            handleOperator('divide');
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            calculate();
        } else if (e.key === 'Escape') {
            clearAll();
        } else if (e.key === 'Backspace') {
            deleteLastDigit();
        } else if (e.key === '%') {
            percent();
        }
        
        updateDisplay();
    }
    
    // Input digit
    function inputDigit(digit) {
        if (state.waitingForOperand) {
            state.currentValue = digit;
            state.waitingForOperand = false;
        } else {
            state.currentValue = state.currentValue === '0' ? digit : state.currentValue + digit;
        }
    }
    
    // Input decimal
    function inputDecimal() {
        if (state.waitingForOperand) {
            state.currentValue = '0.';
            state.waitingForOperand = false;
        } else if (state.currentValue.indexOf('.') === -1) {
            state.currentValue += '.';
        }
    }
    
    // Handle operators
    function handleOperator(operator) {
        const inputValue = parseFloat(state.currentValue);
        
        if (state.previousValue === null) {
            state.previousValue = inputValue;
        } else if (state.operator && !state.waitingForOperand) {
            const result = performCalculation();
            state.currentValue = String(result);
            state.previousValue = result;
            addToHistory();
        }
        
        state.waitingForOperand = true;
        state.operator = operator;
    }
    
    // Perform calculation
    function performCalculation() {
        const prevValue = state.previousValue;
        const currentValue = parseFloat(state.currentValue);
        let result;
        
        switch (state.operator) {
            case 'add':
                result = prevValue + currentValue;
                break;
            case 'subtract':
                result = prevValue - currentValue;
                break;
            case 'multiply':
                result = prevValue * currentValue;
                break;
            case 'divide':
                result = prevValue / currentValue;
                break;
            case 'pow':
                result = Math.pow(prevValue, currentValue);
                break;
            default:
                return currentValue;
        }
        
        return parseFloat(result.toFixed(8));
    }
    
    // Calculate result
    function calculate() {
        if (!state.operator || state.waitingForOperand) {
            return;
        }
        
        const result = performCalculation();
        const operation = getOperationSymbol(state.operator);
        
        // Add to history
        state.history.push(`${state.previousValue} ${operation} ${state.currentValue} = ${result}`);
        
        state.currentValue = String(result);
        state.previousValue = null;
        state.operator = null;
        state.waitingForOperand = true;
        
        updateHistoryDisplay();
    }
    
    // Add current operation to history
    function addToHistory() {
        const operation = getOperationSymbol(state.operator);
        state.history.push(`${state.previousValue} ${operation} ${state.currentValue} = ${state.previousValue}`);
        updateHistoryDisplay();
    }
    
    // Get operation symbol for display
    function getOperationSymbol(operator) {
        switch (operator) {
            case 'add': return '+';
            case 'subtract': return '-';
            case 'multiply': return '×';
            case 'divide': return '÷';
            case 'pow': return '^';
            default: return '';
        }
    }
    
    // Update history display
    function updateHistoryDisplay() {
        if (state.history.length > 0) {
            historyDisplay.textContent = state.history[state.history.length - 1];
        } else {
            historyDisplay.textContent = '';
        }
    }
    
    // Clear all
    function clearAll() {
        state.currentValue = '0';
        state.previousValue = null;
        state.operator = null;
        state.waitingForOperand = false;
    }
    
    // Delete last digit
    function deleteLastDigit() {
        if (state.waitingForOperand) return;
        
        state.currentValue = state.currentValue.length === 1 ? '0' : state.currentValue.slice(0, -1);
    }
    
    // Percent function
    function percent() {
        const value = parseFloat(state.currentValue);
        state.currentValue = String(value / 100);
    }
    
    // Handle advanced operations
    function handleAdvancedOperation(operation) {
        const value = parseFloat(state.currentValue);
        let result;
        
        switch (operation) {
            case 'sin':
                result = Math.sin(value * (Math.PI / 180)); // Convert degrees to radians
                break;
            case 'cos':
                result = Math.cos(value * (Math.PI / 180));
                break;
            case 'tan':
                result = Math.tan(value * (Math.PI / 180));
                break;
            case 'log':
                result = Math.log10(value);
                break;
            case 'ln':
                result = Math.log(value);
                break;
            case 'sqrt':
                result = Math.sqrt(value);
                break;
        }
        
        if (result !== undefined) {
            state.currentValue = String(parseFloat(result.toFixed(8)));
            state.waitingForOperand = true;
            
            // Add to history
            state.history.push(`${operation}(${value}) = ${state.currentValue}`);
            updateHistoryDisplay();
        }
    }
    
    // Toggle advanced mode
    function toggleAdvancedMode() {
        state.advancedMode = !state.advancedMode;
        calculator.classList.toggle('advanced-mode');
    }
    
    // Update display
    function updateDisplay() {
        currentInput.textContent = state.currentValue;
    }
}); 