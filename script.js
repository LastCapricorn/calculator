'use strict';

(function caLCoolator() {

  const buttons = document.querySelectorAll('button');
  const alignErrorMsg = document.querySelector('#display');
  const prevOut = document.querySelector('#prev-output');
  const currOut = document.querySelector('#curr-output');

  let [firstOperand, secondOperand, resumeOperand] = ['', '', ''];
  let [currentOperator, nextOperator, resumeOperator] = ['', '', ''];
  let [periodFlag, resultFlag, errorFlag] = [false, false, false];

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
    andEverything : {
      name : 'funny error "Planet Earth":',
      message : "Is infinity infinite if you can reach it? Are there multiple infinities?"
    },  
  };  

  const calc = {
    '+' : (summand1, summand2) => summand1 + summand2,
    '-' : (minuend, subtrahend) => minuend - subtrahend,
    '*' : (factor1, factor2) => factor1 * factor2,
    '/' : (dividend, divisor) => dividend / divisor,
    '%' : (parts) => parts / 100,
    square : (base) => base ** 2,
    root : (radicand) => Math.sqrt(radicand),
  };  

  const handle = {

    operate : function() {
      if (!errorFlag) {
        if (!currentOperator) {
          if (!resumeOperator) return;
          currentOperator = resumeOperator
        }    
        if (!secondOperand && resumeOperand) {
          secondOperand = resumeOperand;
          currentOperator = resumeOperator;
        } else {
          resumeOperand = secondOperand;
        }
        try {
          if (Number(secondOperand) === 0 && currentOperator === '/') throw funny.zero;
          firstOperand = '' + calc[currentOperator](Number(firstOperand), Number(secondOperand));
          secondOperand = '';
          currentOperator = nextOperator;
          nextOperator = '';
          resultFlag = true;
          trimOperand();
        } catch(err) {
          errorFlag = true;
          displayError(err);
          currentOperator = '';
          resultFlag = true;
        }
      }
    },

    percent : function() {
      if (!errorFlag) {
        if (!firstOperand || (parseFloat(firstOperand) === 0)) return;
        if (secondOperand) {
          if (currentOperator === '*' || currentOperator === '/') {
            secondOperand = '' + calc['%'](Number(secondOperand));
          } else {
            secondOperand = currentOperator === '+' ? '' + (1 + calc['%'](Number(secondOperand))) : '' + (1 - calc['%'](Number(secondOperand)));
            [currentOperator, resumeOperator] = ['*', '*'];
          }
          this.operate();
        } else {
          firstOperand = '' + calc['%'](Number(firstOperand));
          resultFlag = true;
          trimOperand();
        }
      }
    },

    squareAndRoot : function(opr) {
      if (!errorFlag) {
        if (!firstOperand || (parseFloat(firstOperand) === 0)) return;
        if (secondOperand) {
          this.operate();
        } else if (firstOperand && currentOperator) {
          currentOperator = '';
        }
        resultFlag = true;
        try {
          if (Number(firstOperand) < 0 && opr === 'root') throw  funny.negative ;
          firstOperand = '' + calc[opr](Number(firstOperand));
          trimOperand();
        } catch(err) {
          errorFlag = true;
          displayError(err);
        }
      }
    },

    basicOperators : function(opr) {
      if(!errorFlag) {
        [resultFlag, periodFlag] = [false, false];
        if (!firstOperand) firstOperand = '0';
        if (!currentOperator || !secondOperand) {
          currentOperator = opr;
        } else if (!nextOperator) {
          nextOperator = opr;
          this.operate();
        }      
        resumeOperator = currentOperator;
      }
    },
  
    numerals : function(opd) {
      if (!errorFlag) {
        if (periodFlag && opd === '.' && !resultFlag) return;
        if (!currentOperator) {
          if (!firstOperand || resultFlag) {
            firstOperand = (opd === '0' || opd === '.') ? '0.' : opd;
            resumeOperator = '';
          } else {
            firstOperand += opd;
          }
          periodFlag = firstOperand.indexOf('.') > -1;
        } else {
          if (!secondOperand || resultFlag) {
            secondOperand = (opd === '0' || opd === '.') ? '0.' : opd;
          } else {
            secondOperand += opd;
          }
          periodFlag = secondOperand.indexOf('.') > -1;
        }
        resultFlag = false;
        resumeOperand = firstOperand;
        checkLimit();
      }
    },

    toggleMinus : function() {
      if (!errorFlag) {
        if(secondOperand && Number(secondOperand) !== 0) {
          secondOperand = '' + (Number(secondOperand) * -1);
        } else if (firstOperand && Number(firstOperand) !== 0) {
          firstOperand = '' + (Number(firstOperand) * -1);
        }
      }
    },
  
    delInput : function() {
      if (resultFlag) this.clearOperation();
      if (secondOperand) {
        secondOperand = secondOperand.slice(0,secondOperand.length-1);
        if (Number(secondOperand) === 0) secondOperand = '';
        periodFlag = secondOperand.indexOf('.') > -1;
        resumeOperand = '';
      } else if (currentOperator) {
        [currentOperator, resumeOperator] = ['', ''];
        resultFlag = false;
        periodFlag = firstOperand.indexOf('.') > -1;
      } else if (firstOperand) {
        firstOperand = firstOperand.slice(0,firstOperand.length-1);
        if (Number(firstOperand) === 0) firstOperand = '';
        periodFlag = firstOperand.indexOf('.') > -1;
      }
    },
    
    clearEntry : function() {
      if (secondOperand) {
        secondOperand = '';
        periodFlag = false;
        resumeOperand = '';
      }    
      if (currentOperator) return;
      this.clearOperation();
    },
  
    clearOperation : function() {
      [firstOperand, secondOperand, resumeOperand] = ['', '', ''];
      [currentOperator, nextOperator, resumeOperator] = ['', '', ''];
      [periodFlag, resultFlag, errorFlag] = [false, false, false];
      [currOut.textContent, prevOut.textContent] = ['', ''];
      alignErrorMsg.classList.remove('error');
      setFontSize();
    },
  
  };  

  function trimOperand() {
    if (firstOperand === 'Infinity' || firstOperand === '-Infinity') throw funny.andEverything;
    let size = Math.min(16, 24 - firstOperand.indexOf('.') + 1);
    firstOperand = '' + parseFloat(Number(firstOperand).toFixed(size));
    periodFlag = firstOperand.indexOf('.') > -1;
  }

  function checkLimit() {
    try {
      let num = Number(firstOperand);
      let max = num < 0 ? 24 : 23
      if (firstOperand.length > max) throw funny.improbabilityLimit;
      if (Number.isInteger(num) && num > Number.MAX_SAFE_INTEGER) throw funny.richLimit;
      if (Number.isInteger(num) && num < Number.MIN_SAFE_INTEGER) throw funny.poorLimit;
    } catch(err) {
      errorFlag = true;
      displayError(err);
      currentOperator = '';
      resultFlag = true;
    }
  }

  function displayError(err) {
    alignErrorMsg.classList.add('error');
    document.documentElement.style.setProperty('--currout', '1.0rem');
    document.documentElement.style.setProperty('--prevout', '1.0rem');
    prevOut.textContent = err.name;
    currOut.textContent = err.message;
  }

  function setFontSize(digitCount = 13) {
    let size = 2.2;
    if (digitCount > 13) size = 1.9;
    if (digitCount > 15) size = 1.7;
    if (digitCount > 17) size = 1.5;
    if (digitCount > 19) size = 1.3;
    if (digitCount > 21) size = 1.2;
    document.documentElement.style.setProperty('--currout', `${size}rem`);
    document.documentElement.style.setProperty('--prevout', '1.2rem');
  }

  function setDisplayOutput() {
    if (!currentOperator) {
      setFontSize(firstOperand.length);
      prevOut.textContent = '';
      currOut.textContent = firstOperand || '0';
    } else {
      setFontSize(secondOperand.length);
      prevOut.textContent = `${firstOperand} ${currentOperator}`;
      currOut.textContent =  secondOperand || '0';
    }
  }

  function playAudio() {
    const audio = document.querySelector('audio');
    audio.currentTime = 0;
    audio.play();
  }

  function keyInput(ev) {
    const pressedKey = document.querySelector(`button[data-key=${ev.code || this.dataset.key}]`);
    if(ev.code === 'Digit5' && !ev.shiftKey) return;
    if(!pressedKey) return;
    playAudio();
    handle[pressedKey.dataset.fnc](pressedKey.value);
    if (!errorFlag) setDisplayOutput();
  }
  
  document.addEventListener('keydown', keyInput);
  buttons.forEach( btn => btn.addEventListener('click', keyInput));

})();
