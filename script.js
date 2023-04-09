'use strict';

(function caLCoolator() {

  const calc = {
    '+' : (prev, curr) => prev + curr,
    '-' : (prev, curr) => prev - curr,
    '*' : (prev, curr) => prev * curr,
    '/' : (prev, curr) => prev / curr,
    '%' : (curr) => curr / 100,
    square : (base) => base ** 2,
    root : (radicand) => Math.sqrt(radicand),
  };

  const funny = {
    zero : {
      name: 'funny error "no. 42":',
      message: "Nobody shares the pie with anybody, there's no pie at all!"
    },
    negative : {
      name: 'funny error "no. 6.48074069840786":',
      message: "You must be a dentist if you try pulling bad roots!"
    },
    richLimit : {
      name: 'funny error "Ritchie Rich":',
      message : "You're counting money, right?"
    },
    poorLimit : {
      name : 'funny error "Trading Places":',
      message : "Do you hear Randolph and Mortimer crying?"
    },
    improbabilityLimit : {
      name : 'funny error "ask Deep Thought":',
      message : "You seem to be looking for a question, not an answer."
    },
  };

  const buttons = document.querySelectorAll('button');
  const errorMessageAlignment = document.querySelector('#display');
  const output1 = document.querySelector('#curr-output');
  const output2 = document.querySelector('#prev-output');

  let [firstOperand, secondOperand, resumeOperand] = [[], [], []];
  let [currentOperator, nextOperator, resumeOperator] = [null, null, null];
  let [zeroFlag, periodFlag, resultFlag, errorFlag] = [true, false, false, false];

  function playAudio() {
    const audio = document.querySelector('audio');
    audio.currentTime = 0;
    audio.play();
  }

  function clearOperation() {
    [firstOperand, secondOperand, resumeOperand] = [[], [], []];
    [currentOperator, nextOperator, resumeOperator] = [null, null, null];
    [zeroFlag, periodFlag, resultFlag, errorFlag] = [true, false, false, false];
    [output1.textContent, output2.textContent] = ['0', ''];
    errorMessageAlignment.classList.remove('error');
    document.documentElement.style.setProperty('--digitsize1', '2.2rem');
    document.documentElement.style.setProperty('--digitsize2', '1.2rem');
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
    let pf;
    if (resultFlag && !currentOperator) {
      clearOperation();
    }  
    if (secondOperand.length) {
      if (secondOperand.length === 1) {
        zeroFlag = true;
      }  
      pf = secondOperand.pop();
      periodFlag = pf === '.' ? false : periodFlag;
    } else if (currentOperator) {
      [currentOperator, resumeOperator] = [null, null];
      [zeroFlag, resultFlag] = [true, false];
      periodFlag = firstOperand.indexOf('.') === -1 ? false : true;
    } else if (firstOperand.length) {
      if (firstOperand.length === 1) {
        zeroFlag = true;
      }  
      pf = firstOperand.pop();
      periodFlag = pf === '.' ? false : periodFlag;
    }  
  }  

  function displayError(err) {
    errorMessageAlignment.classList.add('error');
    document.documentElement.style.setProperty('--digitsize1', '1.0rem');
    document.documentElement.style.setProperty('--digitsize2', '1.0rem');
    output2.textContent = err.name;
    output1.textContent = err.message;
  }

  function trimOperand() {
    if (firstOperand.length > 16) {
      let size = 16;
      if (firstOperand[0] == '0' || firstOperand[0] ==  '-') size = 15;
      firstOperand = Number(firstOperand.join('')).toPrecision(size).split('');
    }  
  }

  function setFontSize(digitCount) {
    let size = 2.2;
    if (digitCount > 13) size = 1.9;
    if (digitCount > 15) size = 1.7;
    if (digitCount > 17) size = 1.5;
    if (digitCount > 19) size = 1.3;
    if (digitCount > 21) size = 1.2;
    document.documentElement.style.setProperty('--digitsize1', `${size}rem`);
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

  function checkLimit() {
    try {
      let num = Number(firstOperand.join(''));
      if (output1.textContent.includes('.') && output1.textContent.length > 23) throw funny.improbabilityLimit;
      if (Number.isInteger(num) && num > Number.MAX_SAFE_INTEGER) throw funny.richLimit;
      if (Number.isInteger(num) && num < Number.MIN_SAFE_INTEGER) throw funny.poorLimit;
    } catch(err) {
      errorFlag = true;
      displayError(err);
      currentOperator = null;
      resultFlag = true;
    }
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

  function handlePercent() {
    let numSecond = calc['%'](Number(secondOperand.join('')));
    if (secondOperand.length && (currentOperator === '*' || currentOperator === '/')) {
      secondOperand = numSecond.toString().split('');
    } else if (secondOperand.length) {
      if (currentOperator === '+') {
        secondOperand = (1 + numSecond).toString().split('');
      } else if (currentOperator === '-') {
        secondOperand = (1 - numSecond).toString().split('');
      }
      currentOperator = '*';
      resumeOperator = '*';
    } else {
      firstOperand = calc['%'](Number(firstOperand.join(''))).toString().split('');
    }
    operate();
    resultFlag = true;
    trimOperand();
  }

  function squareAndRoot(opr) {
    if (secondOperand.length) {
      operate();
    } else if (firstOperand.length && currentOperator) {
      currentOperator = null;
    }
    resultFlag = true;
    let num = Number(firstOperand.join(''));
    try {
      if (num < 0 && opr === 'root') throw  funny.negative ;
      firstOperand = (calc[opr](num)).toString().split('');
      trimOperand();
      setDisplayOutput();
    } catch(err) {
      errorFlag = true;
      displayError(err);
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
      errorFlag = true;
      displayError(err);
      currentOperator = null;
      resultFlag = true;
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
          [periodFlag, zeroFlag] = [true, true];
          resumeOperator = null;
        } else {
          firstOperand = [operand];
          [periodFlag, zeroFlag] = [false, false];
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
        secondOperand.push('0', operand);
        periodFlag = true;
      } else {
        secondOperand.push(operand);
      }
      zeroFlag = false;
    }
    resumeOperand = firstOperand;
  }

  function handleKeys(ev) {
    console.clear();
    const pressedKey = document.querySelector(`button[data-key=${ev.code || this.dataset.key}]`);
    if(ev.code === 'Digit5' && !ev.shiftKey) return;
    if(!pressedKey) return;
    playAudio();
    switch(pressedKey.value) {
      case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8':
      case '9': case '0': case '.':
        if (!errorFlag) {
          handleNumerals(pressedKey.value);
          checkLimit();
        }
        break;
      case '+': case '-': case '*': case '/':
        if (!errorFlag) handleBasicOperators(pressedKey.value);
        break;
      case 'root': case 'square':
        if (!errorFlag) squareAndRoot(pressedKey.value);
        break;
      case '%':
        if (!errorFlag) handlePercent();
        break;
      case 'Backslash':
        if (!errorFlag) toggleNegative();
        break;
      case 'Enter':
        if (!errorFlag) operate();
        break;
      case 'Delete':
        delInput();
        break;
      case 'Backspace':
        clearEntry();
        break;
      case 'Escape':
        clearOperation();
        break;
    }
    if (!errorFlag) setDisplayOutput();
    console.log('  firstOpd: ' + firstOperand);
    console.log(' secondOpd: ' + secondOperand);
    console.log(' resumeOpd: ' + resumeOperand);
    console.log('currentOpr: ' + currentOperator);
    console.log('   nextOpr: ' + nextOperator);
    console.log(' resumeOpr: ' + resumeOperator);
    console.log('  zeroFlag: ' + zeroFlag);
    console.log('periodFlag: ' + periodFlag);
    console.log('resultFlag: ' + resultFlag);
    console.log(' errorFlag: ' + errorFlag);
  }

  document.addEventListener('keydown', handleKeys);
  buttons.forEach( btn => btn.addEventListener('click', handleKeys));

})();
