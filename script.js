'use strict';

const buttons = document.querySelectorAll('button');
const output1 = document.querySelector('#curr-output');
const output2 = document.querySelector('#prev-output');

const calc = {
  '+' : (prev, curr) => prev + curr,
  '-' : (prev, curr) => prev - curr,
  '*' : (prev, curr) => prev * curr,
  '/' : (prev, curr) => prev / curr,
  '%' : (curr) => curr / 100,
  square : (base) => base ** 2,
  root : (radicand) => Math.sqrt(radicand),
}

let [firstOperand, secondOperand, replacementOperand] = [[], [], []];
let [currentOperator, nextOperator, replacementOperator] = [null, null, null];
let [zeroFlag, periodFlag, resultFlag] = [true, false, false];

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
      replacementOperator = null;
    } else if (resultFlag) {
      if (operand === '0') {
        firstOperand = [];
        periodFlag = true;
        zeroFlag = true;
        replacementOperator = null;
      } else {
        firstOperand = [operand];
        periodFlag = false;
        zeroFlag = false;
        replacementOperator = null;
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
  replacementOperand = firstOperand;
}

function operate() {
  if (!firstOperand.length) return;
  if (!currentOperator) {
    if (!replacementOperator) return;
    currentOperator = replacementOperator
  }
  if (!secondOperand.length && replacementOperand) {
    secondOperand = replacementOperand;
    currentOperator = replacementOperator;
  } else {
    replacementOperand = secondOperand;
  }
  let numFirst = Number(firstOperand.join(''));
  let numSecond = Number(secondOperand.join(''));
  firstOperand = (calc[currentOperator](numFirst,numSecond)).toString().split('');
  secondOperand = [];
  currentOperator = nextOperator;
  nextOperator = null;
  resultFlag = true;
  trimOperand();
  setDisplayOutput();
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
  replacementOperator = currentOperator;
}

function clearOperation() {
  [firstOperand, secondOperand, replacementOperand] = [[], [], []];
  [currentOperator, nextOperator, replacementOperator] = [null, null, null];
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
    [currentOperator, replacementOperator] = [null, null]
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

function toggleNegative() {
  if(secondOperand.length) {
    secondOperand[0] === '-' ? secondOperand.shift() : secondOperand.unshift('-');
  } else if (firstOperand.length) {
    firstOperand[0] === '-' ? firstOperand.shift() : firstOperand.unshift('-');
  }
  trimOperand();
}

function setFontSize(digitCount) {
  if (digitCount <= 12) document.documentElement.style.setProperty('--digitsize', '2.2rem');
  if (digitCount > 12) document.documentElement.style.setProperty('--digitsize', '2.0rem');
  if (digitCount > 14) document.documentElement.style.setProperty('--digitsize', '1.8rem');
  if (digitCount > 16) document.documentElement.style.setProperty('--digitsize', '1.6rem');
  if (digitCount >= 18) document.documentElement.style.setProperty('--digitsize', '1.4rem');
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
      handleNumerals(pressedKey.value);
      break;
    case '+': case '-': case '*': case '/':
      handleBasicOperators(pressedKey.value);
      break;
    case '%':
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
    case 'BracketLeft':
      break;
    case 'BracketRight':
      break;
  }
  setDisplayOutput();

  console.clear();
  console.log('firstOpd: ' + firstOperand.join(''));
  console.log('currOpr: ' + currentOperator);
  console.log('secondOpd: ' + secondOperand.join(''));
  console.log('nextOpr: ' + nextOperator);
  console.log('replaceOpd: ' + replacementOperand.join(''));
  console.log('replaceOpr: ' + replacementOperator);
  console.log('resultFlag: ' + resultFlag)
  console.log('periodFlag: ' + periodFlag)
  console.log('zeroFlag: ' + zeroFlag);
}

document.addEventListener('keydown', handleKeys);
buttons.forEach( btn => btn.addEventListener('click', handleKeys));
