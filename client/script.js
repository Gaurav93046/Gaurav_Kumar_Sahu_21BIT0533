const websocket = new WebSocket('ws://localhost:6789');
const boardElement = document.getElementById('board');
const currentPlayerElement = document.getElementById('current-player');
const selectedPieceElement = document.getElementById('selected-piece');
const moveHistoryElement = document.getElementById('move-history');
let selectedPiece = null;
let selectedMove = null;
let currentlySelectedButton = null;
let currentlySelectedCell = null;

console.log("WebSocket connection initiated");

loadSampleBoard();

function loadSampleBoard() {
    console.log("Loading sample board");
    const initialBoard = [
        ['A-P1', 'A-H1', 'A-H2', 'A-H3', 'A-P2'],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['B-P1', 'B-H1', 'B-H2', 'B-H3', 'B-P2']
    ];
    updateBoard(initialBoard);
}

function updateBoard(board) {
    console.log("Updating board on client-side", board);
    boardElement.innerHTML = '';
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div');
            cellElement.textContent = cell || '';
            cellElement.classList.add('cell');
            cellElement.onclick = () => selectPiece(rowIndex, colIndex, cell, cellElement);
            boardElement.appendChild(cellElement);
        });
    });
}

function selectPiece(row, col, piece, cellElement) {
    console.log("Piece selected", piece, "at position", row, col);
    if (currentPlayerElement.textContent === 'A' && piece.startsWith('A-') ||
        currentPlayerElement.textContent === 'B' && piece.startsWith('B-')) {
        selectedPiece = { row, col, piece };
        selectedPieceElement.textContent = piece;

        if (currentlySelectedCell) {
            currentlySelectedCell.style.backgroundColor = '#444';
        }
        cellElement.style.backgroundColor = 'green';
        currentlySelectedCell = cellElement;
    }
}

function selectMove(move, buttonElement) {
    console.log("Move selected", move);
    selectedMove = move;

    if (currentlySelectedButton) {
        currentlySelectedButton.style.backgroundColor = '#555';
    }
    buttonElement.style.backgroundColor = 'green';
    currentlySelectedButton = buttonElement;
}

function submitMove() {
    console.log("Submitting move", selectedPiece, selectedMove);
    if (selectedPiece && selectedMove) {
        const data = {
            player: currentPlayerElement.textContent,
            piece: selectedPiece,
            move: selectedMove
        };
        console.log("Sending move to server", data);
        websocket.send(JSON.stringify(data));

        // Reset selection
        selectedPiece = null;
        selectedMove = null;
        selectedPieceElement.textContent = 'None';
        if (currentlySelectedButton) {
            currentlySelectedButton.style.backgroundColor = '#555';
            currentlySelectedButton = null;
        }
        if (currentlySelectedCell) {
            currentlySelectedCell.style.backgroundColor = '#444';
            currentlySelectedCell = null;
        }
    }
}

function addMoveToHistory(move) {
    const moveText = `${move.player}: ${move.piece.piece} -> ${move.move}`;
    const moveElement = document.createElement('li');
    moveElement.textContent = moveText;
    moveHistoryElement.appendChild(moveElement);
}

function checkForWinner() {
    const board = Array.from(boardElement.children).map(cell => cell.textContent);

    const playerAPieces = board.filter(piece => piece.startsWith('A-'));
    const playerBPieces = board.filter(piece => piece.startsWith('B-'));

    const playerAHasReachedEnd = board.slice(20).some(piece => piece.startsWith('A-'));
    const playerBHasReachedEnd = board.slice(0, 5).some(piece => piece.startsWith('B-'));

    if (playerBPieces.length === 0 || playerAHasReachedEnd) {
        announceWinner('Player A');
    } else if (playerAPieces.length === 0 || playerBHasReachedEnd) {
        announceWinner('Player B');
    }
}

function announceWinner(winner) {
    const winnerMessageElement = document.getElementById('winner-message');
    const winnerAnnouncementElement = document.getElementById('winner-announcement');
    
    winnerMessageElement.textContent = `${winner} wins!`;
    winnerAnnouncementElement.style.display = 'block';
}

websocket.onmessage = function (event) {
    console.log("Message received from server", event.data);
    const data = JSON.parse(event.data);

    if (data.invalid_move) {
        alert(data.message);
    } else {
        updateBoard(data.board);
        currentPlayerElement.textContent = data.turn;

        // Update move history with the last move
        const lastMove = data.lastMove;
        console.log("Last move received", lastMove);

        if (lastMove && lastMove.piece.piece) {
            addMoveToHistory(lastMove);
        }

        // Check for a winner after every move
        checkForWinner();
    }
};

websocket.onopen = function() {
    console.log("WebSocket connection opened");
};

websocket.onerror = function(error) {
    console.error("WebSocket error", error);
};

websocket.onclose = function() {
    console.log("WebSocket connection closed");
};
