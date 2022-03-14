/*----- constants -----*/
const suits = ['s', 'h', 'c', 'd'];
const values = ['A', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K']


/*----- app's state (variables) -----*/
let deck, pile, draw, stacks, aces, winner, clickedCard, firstStackId, cardArr;



/*----- cached element references -----*/
const boardEls = {
    pile: document.getElementById('pile'),
    draw: document.getElementById('draw'),
    ace1: document.getElementById('ace1'),
    ace2: document.getElementById('ace2'),
    ace3: document.getElementById('ace3'),
    ace4: document.getElementById('ace4'),
    stack1: document.getElementById('stack1'),
    stack2: document.getElementById('stack2'),
    stack3: document.getElementById('stack3'),
    stack4: document.getElementById('stack4'),
    stack5: document.getElementById('stack5'),
    stack6: document.getElementById('stack6'),
    stack7: document.getElementById('stack7')
}




/*----- event listeners -----*/
// document.querySelector('#resetButton').addEventListener('click', init);
// document.querySelector('#pile').addEventListener('click', drawCard);
document.querySelector('#gameBoard').addEventListener('click', handleClick);


/*----- functions -----*/
init();

function init() {
    reset();
    deck = [];
    pile = [];
    draw = [];
    cardArr = [];
    stacks = [[], [], [], [], [], [], []]
    stacksFaceUp = [1, 1, 1, 1, 1, 1, 1]
    aces = [[], [], [], []]
    winner = null;
    clickedCard = null;
    // make deck
    makeDeck();

    // shuffle deck
    shuffleDeck();

    // create card elements


    // deal cards to game board
    dealCards();
    render();
}

function render() {

      clearAllDivs();
    // for each card on each pile, render them with the card back showing
    // if it's the last card in the pile, render it with it's face up
    stacks.forEach((stack, sIdx) => {
        stack.forEach((card, cIdx) => {
            let cardEl = document.createElement('div');
            cardEl.className = `card back ${card.suit}${card.value}`
            let faceUp = stacksFaceUp[sIdx];
            while (faceUp > 0) {
                if (cIdx === stack.length - faceUp) {
                    cardEl.className = cardEl.className.replace(' back', '');
                }
                faceUp--;
            }
            cardEl.style = `position: absolute; left: -7px; top: ${-7 + (cIdx * 10)}px;`
            boardEls[`stack${sIdx + 1}`].appendChild(cardEl);
        })
    })

    // render all cards in the 'pile' face down
    renderPile();

    // render all cards in the 'draw' face up
    renderDraw();
    renderAces();
}


function renderPile() {
    pile.forEach((card, cIdx) => {
        let cardEl = document.createElement('div');
        cardEl.className = `card back ${card.suit}${card.value}`
        cardEl.style = `position: absolute; left: -7px; top: ${-7 + (cIdx * -.5)}px;`
        boardEls.pile.appendChild(cardEl);
    });

}

function renderDraw() {
    draw.forEach((card, cIdx) => {
        let cardEl = document.createElement('div');
        cardEl.className = `card ${card.suit}${card.value}`
        cardEl.style = `position: absolute; left: -7px; top: ${-7 + (cIdx * -.5)}px;`
        boardEls.draw.appendChild(cardEl);
    });
}

function renderAces() {
    aces.forEach((stack, sIdx) => {
        stack.forEach((card, cIdx) => {
            let cardEl = document.createElement('div');
            cardEl.className = `card ${card.suit}${card.value}`
            cardEl.style = `position: absolute; left: -7px; top: ${-7 + (cIdx * -.5)}px;`
            boardEls[`ace${sIdx + 1}`].appendChild(cardEl);
        });
    });

}


function makeDeck() {
    suits.forEach(suit => {
        values.forEach(value => {
            let card = { value: value, suit: suit };
            deck.push(card);
        });
    });
}


function shuffleDeck() {
    deck = deck.sort(() => Math.random() - .5);
}


function dealCards() {
      stacks.forEach((stack, idx) => {
        for (let i = 0; i < idx + 1; i++)
            stack.unshift(deck.shift());
      });

     deck.forEach(card => {
        pile.push(card);
    });
}


function drawCard() {
    if (!clickedCard) {
        if (pile.length > 0) {
            draw.push(pile.pop());
            render();
        } else {
            while (draw.length > 0) {
                pile.push(draw.pop())
            }
            render();
       }
    }
}

function clearAllDivs() {
    for (let boardEl in boardEls) {
        while (boardEls[boardEl].firstChild) {
            boardEls[boardEl].removeChild(boardEls[boardEl].firstChild);
        }
    }

}

function handleClick(evt) {
    let clickDest = getClickDestination(evt.target);

    if (clickDest.includes('stack')) {
        handleStackClick(evt.target);
    } else if (clickDest.includes('ace')) {
        handleAceClick(evt.target);
    } else if (clickDest === 'draw') {
        handleDrawClick(evt.target);
    } else if (clickDest === 'pile') {
        drawCard();
    } else if (clickDest === 'resetButton') {
        init();
    }
 }

function isFaceUpCard(element) {
    return (element.className.includes('card') && !(element.className.includes('back')) && !(element.className.includes('outline')))
}

function isAcePile(element) {
    if (!(element.firstChild)) {
        return element.id.includes('ace');
    } else {
        return element.parentNode.id.includes('ace');
    }
}

function getClickDestination(element) {
    if (element.id) {
        return element.id;
    }
    else {
        return element.parentNode.id;
    }
}



function handleStackClick(element) {

    let stackId = getClickDestination(element).replace('stack', '') - 1;
    let topCard = stacks[stackId][stacks[stackId].length - 1];
    let stackPos;
     // select card to move
    if (!clickedCard && isFaceUpCard(element)) {
        firstStackId = stackId;
        element.className += ' highlight';
        stackPos = getPositionInStack(element.parentNode.children);
        clickedCard = stacks[stackId][stackPos];
        let cardsToPush = stackPos - stacks[stackId].length;
        while (cardsToPush < 0) {
            cardArr.push(stacks[stackId].pop());
            stacksFaceUp[stackId]--;
            cardsToPush++;
    }
    // flip over unflipped card in stack
    } else if (!clickedCard && element === element.parentNode.lastChild) {
                stacksFaceUp[stackId]++;
        render();

     // move card to stack destination
    } else if (clickedCard && isFaceUpCard(element)) {
        // allow clicks on first clicked card
        if (stackId === firstStackId) {
            while (cardArr.length > 0) {
                stacks[stackId].push(cardArr.pop());
                stacksFaceUp[stackId]++
     }
            clickedCard = null;
            render();
            // check if play is legal
        } else if (isPlayLegal(clickedCard, topCard)) {
            while (cardArr.length > 0) {
                stacks[stackId].push(cardArr.pop());
                stacksFaceUp[stackId]++;
      }
            clickedCard = null;
            render();
      }
        // move card to empty stack destination
    } else if (clickedCard && isEmptyStack(element) && getCardValue(clickedCard) === 13) {

        stacks[stackId].push(clickedCard);
        clickedCard = null;
        stacksFaceUp[stackId]++;
        render();

       // card destination can be itself
    }
}

function handleAceClick(element) {
    let aceId = getClickDestination(element).replace('ace', '') - 1;
    let topCard = aces[aceId][aces[aceId].length - 1];
    if (!clickedCard && isFaceUpCard(element)) {
        firstStackId = aceId;
        element.className += ' highlight';
        stackPos = getPositionInStack(element.parentNode.children);
        clickedCard = aces[aceId][stackPos];
        let cardsToPush = stackPos - aces[aceId].length;
        while (cardsToPush < 0) {
            cardArr.push(aces[aceId].pop());
            cardsToPush++;
        }
    } else if (clickedCard) {
        if (!topCard) {
            if (getCardValue(clickedCard) === 1) {
                while (cardArr.length > 0) {
                    aces[aceId].push(cardArr.pop());
                }
                clickedCard = null;
                render();
            }
        } else {
            if (getCardValue(clickedCard) === getCardValue(topCard) + 1 && clickedCard.suit === topCard.suit) {
                while (cardArr.length > 0) {
                    aces[aceId].push(cardArr.pop());
                }
                clickedCard = null;
                render();
            }
        }
    }
}

function handleDrawClick(element) {
    let topCard = draw[draw.length - 1];
    let topCardEl = boardEls.draw.lastChild;
    // console.log(getClickDestination(element));
    // console.log(topCardEl)
    // console.log(topCard)
    if (!clickedCard && !isEmptyStack(element)) {
        topCardEl.className += ' highlight';
        clickedCard = topCard;
        let cardsToPush = -1;
        while (cardsToPush < 0) {
            cardArr.push(draw.pop());
            cardsToPush++;
        }
    } else if (getClickDestination(element) === 'draw') {
        while (cardArr.length > 0) {
            draw.push(cardArr.pop());
        }
        clickedCard = null;
        render();
    }
}


function isEmptyStack(element) {
    return !!element.id;
}

function isPlayLegal(card1, card2) {

    let card1Color = getCardColor(card1);
    let card1Value = getCardValue(card1);
    let card2Color = getCardColor(card2);
    let card2Value = getCardValue(card2);

    if (card1Color === card2Color) {
        return false;
    } else if (card2Value - card1Value === 1) {
        return true;
    } else return false;
}

function getCardColor(cardObj) {
    if (cardObj.suit === 'h' || cardObj.suit === 'd') {
        return 'red'
    } else return 'black';
}

function getCardValue(cardObj) {
    switch (cardObj.value) {
        case 'A': return 1;
            break;
        case '02': return 2;
            break;
        case '03': return 3;
            break;
        case '04': return 4;
            break;
        case '05': return 5;
            break;
        case '06': return 6;
            break;
        case '07': return 7;
            break;
        case '08': return 8;
            break;
        case '09': return 9;
            break;
        case '10': return 10;
            break;
        case 'J': return 11;
            break;
        case 'Q': return 12;
            break;
        case 'K': return 13;
            break;
        default: console.log('getCardValue is broken')
    }
}

    function getPositionInStack(HTMLCollection) {
        for (let i = 0; i < HTMLCollection.length; i++) {
            if (HTMLCollection[i].className.includes('highlight')) {
                return i;
            }
        }
    }