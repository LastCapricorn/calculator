'use strict';

const buttons = document.querySelectorAll('button');
const output1 = document.querySelector('#curr-output');
const output2 = document.querySelector('#prev-output');

let [firstOperand, secondOperand, resumeOperand] = [[], [], []];
let [currentOperator, nextOperator, resumeOperator] = [null, null, null];
let [zeroFlag, periodFlag, resultFlag] = [true, false, false];

const funny = {
  zero : {
    'name': 'funny error no. 42',
    'message': "Nobody shares the pie with anybody, there's no pie at all!"
  },
  negative : {
    'name': 'funny error no. 6.48074069840786:',
    'message': "You must be a dentist if you try pulling bad roots!"
  },
  limit : {
    'name': 'funny error Ritchie Rich',
    'message': "You're counting money, right?"
  },
}

const calc = {
  '+' : (prev, curr) => prev + curr,
  '-' : (prev, curr) => prev - curr,
  '*' : (prev, curr) => prev * curr,
  '/' : (prev, curr) => prev / curr,
  '%' : (curr) => curr / 100,
  square : (base) => base ** 2,
  root : (radicand) => Math.sqrt(radicand),
}

function handleNumerals(operand) {
  if (!firstOperand.length) {
    if (operand === '0') return;
    if (operand === '.') {
      periodFlag = true;
      firstOperand.push('0', '.');
    } else {
      firstOperand.push(operand);
    }
    zeroFlag = false;
  } else if (firstOperand.length && !currentOperator) {
    if (resultFlag && operand === '.') {
      periodFlag = true;
      firstOperand = ['0', '.'];
      resultFlag = false;
      resumeOperator = null;
    } else if (resultFlag) {
      if (operand === '0') {
        firstOperand = [];
        periodFlag = true;
        zeroFlag = true;
        resumeOperator = null;
      } else {
        firstOperand = [operand];
        periodFlag = false;
        zeroFlag = false;
        resumeOperator = null;
      }
      resultFlag = false;
    } else {
      if (operand === '.') {
        if (periodFlag) return;
        periodFlag = true;
      }
      firstOperand.push(operand);
    }
  } else if (secondOperand.length) {
    if (periodFlag && operand === '.') return;
    if (operand === '.') {
      periodFlag = true;
    }
    secondOperand.push(operand);
  } else {
    resultFlag = false;
    if (operand === '0') {
      secondOperand.push(operand, '.');
      periodFlag = true;
    } else if (operand === '.') {
      periodFlag = true;
      secondOperand.push('0', operand);
    } else {
      secondOperand.push(operand);
    }
    zeroFlag = false;
  }
  resumeOperand = firstOperand;
}

function handlePercent() {
  let numSecond = calc['%'](Number(firstOperand.join('')));
  if (secondOperand.length && currentOperator === '+') {
    currentOperator = '*';
    resumeOperator = '*';
    secondOperand = (1 + numSecond).toString().split('');
    operate();
  } else if (secondOperand.length && currentOperator === '-') {
    currentOperator = '*';
    resumeOperator = '*';
    secondOperand = (1 - numSecond).toString().split('');
    operate();
  } else if (secondOperand.length) {
    secondOperand = calc['%'](numSecond).toString().split('');
    operate();
  } else {
    firstOperand = calc['%'](Number(firstOperand.join(''))).toString().split('');
  }
  resultFlag = true;
}

function squareAndRoot(opr) {
  let num;
  if (secondOperand.length) {
    operate();
  } else if (firstOperand.length && currentOperator) {
    currentOperator = null;
  }
  resultFlag = true;
  num = Number(firstOperand.join(''));
  try {
    if (num < 0 && opr === 'root') throw  funny.negative ;
    firstOperand = (calc[opr](num)).toString().split('');
    trimOperand();
    setDisplayOutput();
  } catch(err) {
    console.log(err.name);
    console.log(err.message);
  }
}

function operate() {
  if (currentOperator === '%') handlePercent();
  if (!firstOperand.length) return;
  if (!currentOperator) {
    if (!resumeOperator) return;
    currentOperator = resumeOperator
  }
  if (!secondOperand.length && resumeOperand) {
    secondOperand = resumeOperand;
    currentOperator = resumeOperator;
  } else {
    resumeOperand = secondOperand;
  }
  let numFirst = Number(firstOperand.join(''));
  let numSecond = Number(secondOperand.join(''));
  try {
    if (numSecond === 0 && currentOperator === '/') throw funny.zero;
    firstOperand = (calc[currentOperator](numFirst,numSecond)).toString().split('');
    secondOperand = [];
    currentOperator = nextOperator;
    nextOperator = null;
    resultFlag = true;
    trimOperand();
    setDisplayOutput();
  } catch(err) {
    console.log(err.name);
    console.log(err.message);
  }
}  

function handleBasicOperators(opr) {
  if (!currentOperator || !secondOperand.length) {
    currentOperator = opr;
    resultFlag = false;
  } else if (!nextOperator) {
    nextOperator = opr;
    operate();
  }  
  periodFlag = false;
  resumeOperator = currentOperator;
}

function toggleNegative() {
  if(secondOperand.length) {
    secondOperand[0] === '-' ? secondOperand.shift() : secondOperand.unshift('-');
  } else if (firstOperand.length) {
    firstOperand[0] === '-' ? firstOperand.shift() : firstOperand.unshift('-');
  }
  trimOperand();
  setDisplayOutput();
}

function clearOperation() {
  [firstOperand, secondOperand, resumeOperand] = [[], [], []];
  [currentOperator, nextOperator, resumeOperator] = [null, null, null];
  [zeroFlag, periodFlag, resultFlag] = [true, false, false];
}  

function clearEntry() {
  if (secondOperand.length) {
    secondOperand = [];
    [zeroFlag, periodFlag] = [true, false];
  }  
  if (currentOperator) return;
  clearOperation();
}  

function delInput() {
  if (resultFlag && !currentOperator) {
    clearOperation();
  }  
  if (secondOperand.length) {
    if (secondOperand.length === 1) {
      zeroFlag = true;
    }  
    let pf = secondOperand.pop();
    periodFlag = pf === '.' ? false : periodFlag;
  } else if (currentOperator) {
    [currentOperator, resumeOperator] = [null, null]
    periodFlag = firstOperand.indexOf('.') === -1 ? false : true;
    zeroFlag = true;
    resultFlag = false;
  } else if (firstOperand.length) {
    if (firstOperand.length === 1) {
      zeroFlag = true;
    }  
    let pf = firstOperand.pop();
    periodFlag = pf === '.' ? false : periodFlag;
  }  
}  

function trimOperand() {
  if (firstOperand.length > 19) {
    let size = 19;
    if (firstOperand[0] == '0' || firstOperand[0] ==  '-') size = 18;
    firstOperand = Number(firstOperand.join('')).toFixed(size).split('');
  }  
}

function setFontSize(digitCount) {
  if (digitCount <= 13) document.documentElement.style.setProperty('--digitsize', '2.2rem');
  if (digitCount > 13) document.documentElement.style.setProperty('--digitsize', '1.9rem');
  if (digitCount > 15) document.documentElement.style.setProperty('--digitsize', '1.7rem');
  if (digitCount > 17) document.documentElement.style.setProperty('--digitsize', '1.5rem');
  if (digitCount >= 20) document.documentElement.style.setProperty('--digitsize', '1.3rem');
}

function setDisplayOutput() {
  if (!currentOperator) {
    setFontSize(firstOperand.length);
    output2.textContent = '';
    output1.textContent = firstOperand.join('') || '0';
  } else {
    setFontSize(secondOperand.length);
    output2.textContent = `${firstOperand.join('')} ${currentOperator}`;
    output1.textContent =  secondOperand.join('') || '0';
  }
}

function handleKeys(ev) {
  const pressedKey = document.querySelector(`button[data-key=${ev.code || this.dataset.key}]`);
  if(ev.code === 'Digit5' && !ev.shiftKey) return;
  if(!pressedKey) return;
  switch(pressedKey.value) {
    case '1': case '2': case '3': case '4':
    case '5': case '6': case '7': case '8':
    case '9': case '0': case '.':
      try {
        if (output1.textContent.length > 17 && pressedKey.value !== '.') throw funny.limit;
        handleNumerals(pressedKey.value);
      } catch(err) {
        console.log(err.name);
        console.log(err.message);
      }
      break;
    case '+': case '-': case '*': case '/':
      handleBasicOperators(pressedKey.value);
      break;
    case '%':
      handlePercent();
      break;
    case 'Enter':
      operate();
      break;
    case 'Backspace':
      clearEntry();
      break;
    case 'Delete':
      delInput();
      break;
    case 'Escape':
      clearOperation();
      break;
    case 'Backslash':
      toggleNegative();
      break;
    case 'root': case 'square':
      squareAndRoot(pressedKey.value);
      break;
    }
    setDisplayOutput();
  console.clear();
  console.log('firstOpd: ' + firstOperand.join(''));
  console.log('secondOpd: ' + secondOperand.join(''));
  console.log('replaceOpd: ' + resumeOperand.join(''));
  console.log('currOpr: ' + currentOperator);
  console.log('nextOpr: ' + nextOperator);
  console.log('replaceOpr: ' + resumeOperator);
  console.log('zeroFlag: ' + zeroFlag);
  console.log('periodFlag: ' + periodFlag)
  console.log('resultFlag: ' + resultFlag)
}

document.addEventListener('keydown', handleKeys);
buttons.forEach( btn => btn.addEventListener('click', handleKeys));
