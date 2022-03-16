const sock = io();
const color = sessionStorage.getItem('color');
const gameId = sessionStorage.getItem('gameId');
let player1Score = sessionStorage.getItem('player1Score');
let player2Score = sessionStorage.getItem('player2Score');


// DOM Elements
const allCells = document.querySelectorAll('.cell:not(.row-top)');
const topCells = document.querySelectorAll('.cell.row-top');
const statusSpan = document.getElementById('status');
const turnStatus = document.getElementById('current-player')
const overlay = document.getElementById("overlay");
const afterGame = document.querySelector('.after-game');
const btnRematch = document.getElementById("btnRematch");
const btnHome = document.getElementById("btnHome");
const afterGameText = document.querySelector(".after-text");
const goHome = document.querySelector('.home');
const rematch = document.querySelector('.rematch');
const btnAccept = document.getElementById("btnAccept");
const btnDecline = document.getElementById("btnDecline");

//setting the scoreboard
const yourScore = document.querySelector(".your-score");
const opponentScore = document.querySelector(".opponent-score");
if(color==='blue'){
    yourScore.innerText = player1Score;
    opponentScore.innerText = player2Score;
}
else{
    yourScore.innerText = player2Score;
    opponentScore.innerText = player1Score;
}

//timer function
let seconds = 0;
let minutes = 0;
const outputMinute = document.getElementById('minute');
const outputSecond = document.getElementById('second');

function startTimer(){
    timer = setInterval(begin, 1000);
};
function stopTimer(){
    clearInterval(timer)
};
function begin(){
    seconds++;
    if(seconds<=9){
        outputSecond.innerText = "0" + seconds;
    }
    if(seconds > 9){
        outputSecond.innerText = seconds;
    }
    if(seconds>59){
        minutes++;
        outputMinute.innerText = "0" + minutes;
        seconds = 0;
        outputSecond.innerText = "0" + seconds;
    }
    if (minutes > 9){
        outputMinute.innerText = minutes;
    }
}

// columns
const column0 = [allCells[35], allCells[28], allCells[21], allCells[14], allCells[7], allCells[0], topCells[0]];
const column1 = [allCells[36], allCells[29], allCells[22], allCells[15], allCells[8], allCells[1], topCells[1]];
const column2 = [allCells[37], allCells[30], allCells[23], allCells[16], allCells[9], allCells[2], topCells[2]];
const column3 = [allCells[38], allCells[31], allCells[24], allCells[17], allCells[10], allCells[3], topCells[3]];
const column4 = [allCells[39], allCells[32], allCells[25], allCells[18], allCells[11], allCells[4], topCells[4]];
const column5 = [allCells[40], allCells[33], allCells[26], allCells[19], allCells[12], allCells[5], topCells[5]];
const column6 = [allCells[41], allCells[34], allCells[27], allCells[20], allCells[13], allCells[6], topCells[6]];
const columns = [column0, column1, column2, column3, column4, column5, column6];


// rows
const topRow = [topCells[0], topCells[1], topCells[2], topCells[3], topCells[4], topCells[5], topCells[6]];
const row0 = [allCells[0], allCells[1], allCells[2], allCells[3], allCells[4], allCells[5], allCells[6]];
const row1 = [allCells[7], allCells[8], allCells[9], allCells[10], allCells[11], allCells[12], allCells[13]];
const row2 = [allCells[14], allCells[15], allCells[16], allCells[17], allCells[18], allCells[19], allCells[20]];
const row3 = [allCells[21], allCells[22], allCells[23], allCells[24], allCells[25], allCells[26], allCells[27]];
const row4 = [allCells[28], allCells[29], allCells[30], allCells[31], allCells[32], allCells[33], allCells[34]];
const row5 = [allCells[35], allCells[36], allCells[37], allCells[38], allCells[39], allCells[40], allCells[41]];
const rows = [row0, row1, row2, row3, row4, row5, topRow];

//player1(blue) always go first
let gameIsLive = true;
let blueIsNext = true;
let playerTurn = (color === 'blue' ? true : false);
turnStatus.innerText = (color ==='blue' ? 'Your turn' : 'Opponents turn');

//utility funcitons
const getClassListArray = (cell) => {
    const classList = cell.classList;
    //converts the classes into an array of elements
    return [...classList]
};
const getCellLocation = (cell) =>{
    const classList = getClassListArray(cell);
    const rowClass = classList.find(className => className.includes('row'));
    const colClass = classList.find(className => className.includes('col'));

    //actual value at index 4
    const rowNum = parseInt(rowClass[4], 10);
    const colNum = parseInt(colClass[4], 10);
    return [rowNum, colNum];
};
const getFirstOpenCellForColumn = (colIndex) => {
    const column = columns[colIndex];
    const columnNoTop = column.slice(0, 6);
    //from bottom, check whether it has blue or brown. If neigther, not available

    for (const cell of columnNoTop){
        const classList = getClassListArray(cell);
        //iterate until we find a cell that is available
        if (!classList.includes('blue') && !classList.includes('brown')){
            return cell;
        }
    }
    //otherwise every cell in column is full
    return null;
};
const clearColorFromTop = (colIndex) => {
    const topCell = topCells[colIndex];
    topCell.classList.remove('blue');
    topCell.classList.remove('brown')
}
const getCellColor = (cell) => {
    const classList = getClassListArray(cell);
    if (classList.includes('blue')) return 'blue';
    if (classList.includes('brown')) return 'brown';
    return null;
}
const checkWinningCells = (cells) => {
    if (cells.length < 4) return false;
    //otherwise win
    gameIsLive = false;
    stopTimer();
    for (const cell of cells){
        cell.classList.add("win");
    }
    if (blueIsNext){
        statusSpan.textContent = 'Blue has won'
    }
    else{
        statusSpan.textContent = 'Brown has won'
    }
    return true;
}
const checkGameStatus = (cell) => {
    const color = getCellColor(cell);
    if (!color) return;
    const [row, col] = getCellLocation(cell);


    //check horizontally right to left
    //5 6, 5 5, 5 4, 5 3
    let winningCells = [cell];
    let rowToCheck = row;
    let colToCheck = col - 1;
    while(colToCheck >= 0){
        const cellToCheck = rows[rowToCheck][colToCheck];
        if (getCellColor(cellToCheck) === color){
            winningCells.push(cellToCheck)
            colToCheck--;
        }
        else{
            break;
        }
    }
    //check horizontally left to right
    //5 3, 5 4, 5 5, 5 6
    rowToCheck = row;
    colToCheck = col + 1;
    while (colToCheck <= 6){
        const cellToCheck = rows[rowToCheck][colToCheck];
        if (getCellColor(cellToCheck) === color){
            winningCells.push(cellToCheck)
            colToCheck++;
        }
        else{
            break;
        }
    }
    let finishedGame = checkWinningCells(winningCells);
    if (finishedGame) return;

    //check vertically to bottom to top
    //5 0, 4 0, 3 0, 2 0, 1 0
    winningCells = [cell];
    rowToCheck = row - 1;
    colToCheck = col;
    while(rowToCheck >= 0){
        const cellToCheck = rows[rowToCheck][colToCheck];
        if (getCellColor(cellToCheck) === color){
            winningCells.push(cellToCheck)
            rowToCheck--;
        }
        else{
            break;
        }
    }
    //check vertically to top to bottoom
    //1 0, 2 0, 3 0, 4 0, 5 0
    rowToCheck = row + 1;
    colToCheck = col;
    while (rowToCheck <= 5){
        const cellToCheck = rows[rowToCheck][colToCheck];
        if (getCellColor(cellToCheck) === color){
            winningCells.push(cellToCheck)
            rowToCheck++;
        }
        else{
            break;
        }
    }

    finishedGame = checkWinningCells(winningCells);
    if (finishedGame) return;

    //check diagonal from bottom left to top right
    //5 3, 4 4, 3 5, 2 6
    winningCells = [cell];
    rowToCheck = row + 1;
    colToCheck = col - 1;
    while(colToCheck >= 0 && rowToCheck<=5){
        const cellToCheck = rows[rowToCheck][colToCheck];
        if (getCellColor(cellToCheck) === color){
            winningCells.push(cellToCheck)
            rowToCheck++;
            colToCheck--;
        }
        else{
            break;
        }
    }
    //check diagonal from top right to bottom left
    //0 6, 1 5, 2 4, 3 3
    rowToCheck = row -1;
    colToCheck = col + 1;
    while (colToCheck <= 6 && rowToCheck >= 0){
        const cellToCheck = rows[rowToCheck][colToCheck];
        if (getCellColor(cellToCheck) === color){
            winningCells.push(cellToCheck)
            rowToCheck--;
            colToCheck++;
        }
        else{
            break;
        }
    }
    finishedGame = checkWinningCells(winningCells);
    if (finishedGame) return;

    //check diagonal from bottom right to top left
    //5 6, 4 5, 3 4, 2 3
    winningCells = [cell];
    rowToCheck = row - 1;
    colToCheck = col - 1;
    while(colToCheck >= 0 && rowToCheck >= 0){
        const cellToCheck = rows[rowToCheck][colToCheck];
        if (getCellColor(cellToCheck) === color){
            winningCells.push(cellToCheck)
            rowToCheck--;
            colToCheck--;
        }
        else{
            break;
        }
    }
    //check diagonal from top left to bottom right
    //0 3, 1 4, 2 5, 3 6
    rowToCheck = row + 1;
    colToCheck = col + 1;
    while (colToCheck <= 6 && rowToCheck <= 5){
        const cellToCheck = rows[rowToCheck][colToCheck];
        if (getCellColor(cellToCheck) === color){
            winningCells.push(cellToCheck)
            rowToCheck++;
            colToCheck++;
        }
        else{
            break;
        }
    }
    finishedGame = checkWinningCells(winningCells);
    if (finishedGame) return;
    
    //check for a tie
    const rowsWithoutTop = rows.slice(0, 6);
    for (const row of rowsWithoutTop){
        for (const cell of row){
            const classList = getClassListArray(cell);
            if (!classList.includes('blue') && !classList.includes('brown')){
                return;
            }
        }
    }
    gameIsLive = false;
    statusSpan.textContent = "Game is a draw"
}
const afterGameOver = () =>{
    if (gameIsLive) return;
    afterGame.classList.add('active');
    overlay.classList.add('active');
}

const goingHome = () =>{
    afterGame.classList.remove('active');
    rematch.classList.remove('active');
    goHome.classList.add('active');
    overlay.classList.add('active');
}
const rematchRequest = () =>{
    if (gameIsLive) return;
    afterGame.classList.remove('active');
    rematch.classList.add('active');
}
const clearAll = () =>{
    afterGame.classList.remove('active');
    rematch.classList.remove('active');
    goHome.classList.remove('active');
    overlay.classList.remove('active');
}
const scoreUpdate = () =>{
    if (!gameIsLive){
        if (statusSpan.textContent === "Game is a draw"){
            console.log('It is a draw. Both players get a point')
            player1Score++;
            player2Score++;
        }
        else if(blueIsNext){
            console.log("player2 who is brown gets 1 point")
            player2Score++;
        }
        else{
            console.log("player1 who is blue gets 1 point")
            player1Score++;
        }
    }
}

// Event Handlers
const handleCellMouseOver = (e) =>{
    //use row class and column class to extract the index
    //shows what the circle is when we hover over the cell
    if (!gameIsLive) return;
    const cell = e.target;
    const [row, col] = getCellLocation(cell);
    const topCell = topCells[col];
    topCell.classList.add(color);
};
const handleCellMouseOut = (e) =>{
    //if pointer is out of cell, the top cell disappears
    const cell = e.target;
    const [row, col] = getCellLocation(cell);
    clearColorFromTop(col);
}
const handCellClick = (e) => {
    if (!gameIsLive) return;
    const cell = e.target;
    const [row, col] = getCellLocation(cell);
    
    const openCell = getFirstOpenCellForColumn(col);
    if (!openCell) return;
    if (playerTurn){
        openCell.classList.add(color);
        checkGameStatus(openCell);
        blueIsNext = !blueIsNext;
        playerTurn = !playerTurn;
        turnStatus.innerText = 'Opponents turn';
        const cellCoordinate = getCellLocation(openCell);
        //[row, col]
        //color
        const payload = {
            'cell': cellCoordinate,
            'color': color,
            'blueIsNext': blueIsNext,
            'gameIsLive': gameIsLive
        }
        sock.emit('game-move', JSON.stringify(payload));
    }
    else{
        statusSpan.innerText = 'It is not your turn yet';
    }
    if(!gameIsLive){
        turnStatus.innerText = '';
        setTimeout(()=>{
            afterGameOver();
        }, 2000);
    }
}

//event listeners for game
const payload = {
    'gameId': gameId,
    'color': color
}

//for some reason, the main receives the game-start broadcast twice
//find out why
sock.emit('game-start', JSON.stringify(payload));

let received = false;
sock.on('game-start', ()=>{
    if(!received){
        startTimer();
        received = true;
    }
})

sock.on('game-move', payload =>{
    const response = JSON.parse(payload);
    if (color !== response.color){
        const row = rows[response.cell[0]];
        const cell = row[response.cell[1]];
        cell.classList.add(response.color);
        blueIsNext = response.blueIsNext;
        gameIsLive = response.gameIsLive;
        if (!gameIsLive){
            stopTimer();
            checkGameStatus(cell);
            turnStatus.innerText = '';
            if (blueIsNext){
                statusSpan.textContent = 'Brown has won'
            }
            else{
                statusSpan.textContent = 'Blue has won'
            }
            setTimeout(()=>{
                afterGameOver();
            }, 2000);
        }
        else{
            playerTurn = !playerTurn;
            turnStatus.innerText = 'Your turn';
            statusSpan.innerText = '';
        }
    }
    scoreUpdate();
});
sock.on('rematch-request', payload =>{
    const response = JSON.parse(payload);
    if (color !== response.color){
        rematchRequest();
    }
    else{
        afterGameText.innerText = 'Standby';
    }
})
sock.on('rematch-accept', () =>{
    afterGameText.innerText = 'Rematch accepted';
    sessionStorage.setItem('player1Score', player1Score);
    sessionStorage.setItem('player2Score', player2Score);
    setTimeout(()=>{
        clearAll();
        window.location.href = "/play"
    }, 2000);
})

sock.on('rematch-decline', () =>{
    setTimeout(()=>{
        window.location.href = "/"
    }, 2000);
})
sock.on('disconnect', (reason) =>{
    if(reason !== "io server disconnect" && reason !== "io client disconnect"){
        goingHome();
        stopTimer();
        setTimeout(()=>{
            window.location.href = "/"
        }, 2000);
    }
})

sock.on('leaving', ()=>{
        goingHome();
        stopTimer();
        setTimeout(()=>{
            window.location.href = "/"
        }, 2000);
})

btnRematch.addEventListener('click', ()=>{
    sock.emit('rematch-request', JSON.stringify(payload));
});
btnHome.addEventListener('click', ()=>{
    sock.emit('leaving', gameId);
    window.location.href = "/";
})
btnAccept.addEventListener('click', ()=>{
    sock.emit('rematch-accept', gameId);
});
btnDecline.addEventListener('click', ()=>{
    sock.emit('rematch-decline', gameId);
});

for (const row of rows){
    for (const cell of row){
        cell.addEventListener('mouseover', handleCellMouseOver)
        cell.addEventListener('mouseout', handleCellMouseOut)
        cell.addEventListener('click', handCellClick)
    }
};