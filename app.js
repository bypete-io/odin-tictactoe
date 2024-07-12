function Gameboard() {
    const rows = 3;
    const columns = 3;
    let board = [];

    const newBoard = () => {
        board = [];
        // Create board matrix 
        for (let i = 0; i < rows; i += 1) {
            board[i] = [];
            for (let j = 0; j < columns; j += 1) {
                board[i].push(Cell());
            }
        }
    }

    const getBoard = () => board;

    const placeToken = (row, column, player) => {
        if (board[row][column].getValue() !== 0) {
            return console.log('cell already taken');
        }

        board[row][column].addToken(player);
    }

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => {
            return row.map((cell) => {
                return cell.getValue();
            });
        });

        console.table(boardWithCellValues);
    };

    return { getBoard, placeToken, newBoard, printBoard }

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


function GameController(playerOneName = 'Player 1', playerTwoName = 'Player 2') {

    const board = Gameboard();
    board.newBoard();

    const players = [{
        name: playerOneName,
        token: 1,
    },
    {
        name: playerTwoName,
        token: 2,
    }]

    let activePlayer = players[0]; // player 1 goes first
    let activeGame = false;
    const resetBtn = document.querySelector('#reset');
    const settingsModal = document.querySelector('#settingsModal');
    const settingsBtn = document.querySelector('#settings');
    const submitSettings = document.querySelector('#submitSettings');

    const switchActivePlayer = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }

    const getActivePlayer = () => {
        return activePlayer;
    }

    const setActiveGame = (activeState = true) => {
        activeGame = activeState;
    }

    const getActiveGame = () => {
        return activeGame;
    }

    const getByName = (name) => {
        return document.querySelector(`input[name="${name}"`);
    }

    const updatePrompt = (message) => {
        const promptDiv = document.querySelector('.prompt');
        promptDiv.textContent = message;
    }

    const toggleSettingsModal = (state=true) => {
        settingsModal.classList.toggle('hidden', !state);
    }

    const updateSettings = (e) => {
        e.preventDefault();
        const helpPrompt = document.querySelector('#settingsHelp');
        let p1 = getByName('playerone').value;
        let p2 = getByName('playertwo').value;
        if (p1 === "" || p2 === "") {
            return helpPrompt.textContent = `ℹ️ Please add both names to begin`;
        }
        [players[0].name, players[1].name] = [p1, p2];
        toggleSettingsModal(false);

        sc.updateScreen();
        setActiveGame(true);
        updatePrompt(`Ready, ${getActivePlayer().name}?`);
    }

    const showResetButton = (state) => {
        resetBtn.classList.toggle('hidden', !state);
        resetBtn.disabled = !state;
    }

    const resetGame = () => {
        console.log('reset');
        board.newBoard();
        sc.updateScreen();
        switchActivePlayer();
        updatePrompt(`Ready, ${getActivePlayer().name}?`);
        setActiveGame(true);
        showResetButton(false);
    }

    const printNewTurn = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
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


            if (status[i][0] !== 0 && status[i].every((cell) => cell === status[i][0])) {
                return status[i][0]; // winner value
            }

            // check columns 
            let columnWin = true;
            for (let j = 1; j < size; j++) {
                if (status[j][i] !== status[0][i]) {
                    columnWin = false;
                    break;
                }
            }
            if (columnWin && status[0][i] !== 0) {
                return status[0][i];
            }
        }

        // check diagonal top left to bottom right
        let diagonalTLBR = true;
        for (let i = 1; i < size; i++) {
            if (status[i][i] !== status[0][0]) {
                diagonalTLBR = false;
                break;
            }
        }

        if (diagonalTLBR && status[0][0] !== 0) {
            return status[0][0];
        }

        let diagonalTRBL = true;
        for (let i = 1; i < size; i++) {
            if (status[i][size - i - 1] !== status[0][size - 1]) {
                diagonalTRBL = false;
                break;
            }
        }
        if (diagonalTRBL && status[0][size - 1] !== 0) {
            return status[0][size - 1];
        }
        // Potential draw

        const hasZero = status.flat().some((cell) => cell === 0);
        if (!hasZero) {
            return null; // No winner and no unused cells
        }

        // No win
        return 0; // No winner yet, but the game is still ongoing
    }



    const playTurn = (row, column) => {

        if (!getActiveGame()) {
            return;
        }

        board.placeToken(row, column, getActivePlayer().token);

        // Check for win
        const winState = checkWinner();

        if (winState === 0) {
            switchActivePlayer();
            updatePrompt(`${activePlayer.name}'s turn`);
        } else if (winState === null) {
            setActiveGame(false);
            showResetButton(true);
            updatePrompt(`Ugh, it's a draw!`);

        } else {
            setActiveGame(false);
            showResetButton(true);
            const winner = players.find((player) => player.token === winState)
            updatePrompt(`${winner.name} wins!`);
            
        }

    }
    // Listeners 
    resetBtn.addEventListener('click', resetGame);
    settingsBtn.addEventListener('click', () => toggleSettingsModal(true));
    settingsModal.addEventListener('click', function(event){
        const outside = !event.target.closest('.wrap');
        if (outside && getActiveGame()) {
            toggleSettingsModal(false)
        }
    
    });
    submitSettings.addEventListener('click', updateSettings);

    return { playTurn, getActivePlayer, getActiveGame, getBoard: board.getBoard, printNewTurn, updatePrompt, resetGame, toggleSettingsModal }
};

function ScreenControler() {
    const game = GameController();
    const boardDiv = document.querySelector('#board');

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

        const xSrc = './images/x.png';
        const oSrc = './images/o.png';


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
                if (label === 1) {
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
    game.toggleSettingsModal(true);
    

    return { updateScreen }
}

const sc = ScreenControler();