
function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    // Create board matrix 
    for (let i = 0; i < rows; i += 1) {
        board[i] = [];
        for (let j = 0; j < columns; j += 1) {
            board[i].push(Cell());
        }
    }
    const getBoard = () => board;

    const pickCell = (row, column, player) => {
        if (board[row][column].getValue() !== 0) {
           return console.log('cell already taken');
        }
        return board[row][column].addToken(player);
    }

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => {
            return row.map((cell) => {
                return cell.getValue();
            });
        });
        
        console.table(boardWithCellValues);
      };

    return { getBoard, pickCell, printBoard }

}

// Values
// 0: no token is in the square,
// 1: Player 1's token,
// 2: Player 2's token

function Cell() {
    let value = 0;
    const addToken = (player) => {
        value = player;
    };
    const getValue = () => value;

    return { addToken, getValue }
}


function GameController(playerOneName = 'p1', playerTwoName = 'p2') {

    const board = Gameboard();

    const players = [ {
        name: playerOneName,
        token: 1,
    },
    {
        name: playerTwoName,
        token: 2,
    }]
    
    let activePlayer = players[0]; // player 1 goes first

    const switchActivePlayer = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }

    const getActivePlayer = () => {
        return activePlayer;
    }

    const checkWinner = () => {
        const status = board.getBoard().map((row) => {
            return row.map((cell) => {
                return cell.getValue();
            });
        });

        const size = status.length;

        // Check rows 
        for (let i = 0; i < size; i++) {
            

            if (status[i][0] !== 0 && status[i].every((cell) => cell === status[i][0])){
                return status[i][0]; // winner value
            }

            // check columns 
            let columnWin = true;
            for (let j = 1; j < size; j++) {
                if (status[j][i] !== status[0][i]){
                    columnWin = false; 
                    break;
                }
            }
            if (columnWin && status[0][i] !== 0 ){
                return status[0][i];
            }
        }

        // check diagonal top left to bottom right
        let diagonalTLBR = true;
        for(let i = 1; i < size; i++){
            if( status[i][i] !== status[0][0]){
                diagonalTLBR = false;
                break;
            }
            if(diagonalTLBR && status[0][0] !== 0) {
                return status[0][0];
            }
        }
        let diagonalBLTR = true;
        for(let i = 1; i < size; i++){
            if(status[i][size - i -1] !== status[0][size - 1]){
                diagonalBLTR = false;
                break;
            }
        }
        if (diagonalBLTR && status[0][size - 1]!==0){
            return status[0][size -1];
        }
        // Potential draw

        const hasZero = status.flat().some((cell) => cell === 0);
        if (!hasZero) {
            return null; // No winner and no unused cells
        }

    // No win
        return 0; // No winner yet, but the game is still ongoing
    }

    const printNewTurn = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    }

    const playTurn = (row,column) => {

        board.pickCell(row, column, getActivePlayer().token);

        // Check for win

        const winState = checkWinner();

        if (winState === 0) {
            switchActivePlayer();
        } else if (winState === null) {
            console.log(`no winner`);
        } else {
            const winner = players.find((player) => player.token === winState )
            console.log(`winner = ${winner.name}`);
        }

    }

    // Set initial board:

    return {playTurn, getActivePlayer, getBoard: board.getBoard, printNewTurn}
};

function ScreenControler() {
    const game = GameController();
    const boardDiv = document.querySelector('#board');
    const promptDiv = document.querySelector('.prompt');

    function clickHandleBoard(e) {
        const row = e.target.dataset.row;
        const column = e.target.dataset.column;

        if (!row || !column) {
            return;
        }

        game.playTurn(row, column);
        updateScreen();

    }

    const updateScreen = () => {
        boardDiv.textContent = ""; // clear the board
        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        const xSrc = './images/x.png';
        const oSrc = './images/o.png';

        promptDiv.textContent = `${activePlayer.name}'s turn`
        // rows 
        for (let i = 0; i < board.length; i++) {
            // columns
            for (let j = 0; j < board.length; j++) {
                const cellButton = document.createElement('button');
                const img = document.createElement('img');
                img.width = 48;
                img.height = 48;
                cellButton.classList.add('cell');
                cellButton.dataset.row = i;
                cellButton.dataset.column = j;

                const label = board[i][j].getValue();
                if (label === 1){
                    img.src = xSrc;
                    img.alt = 'x';
                    cellButton.appendChild(img);
                } else if (label === 2) {
                    img.src = oSrc;
                    img.alt = 'o';
                    cellButton.appendChild(img);

                }

                boardDiv.appendChild(cellButton);
            }
        }

    }

    boardDiv.addEventListener('click', clickHandleBoard)

    // Initial render 
    updateScreen();
}

ScreenControler()

// win
// game.playTurn(0,0);
// game.playTurn(0,1);
// game.playTurn(1,0);
// game.playTurn(1,1);
// game.playTurn(2,0);

// draw
// game.playTurn(0,0);
// game.playTurn(0,1);
// game.playTurn(0,2);
// game.playTurn(1,1);
// game.playTurn(1,0);
// game.playTurn(1,2);
// game.playTurn(2,1);
// game.playTurn(2,0);
// game.playTurn(2,2);