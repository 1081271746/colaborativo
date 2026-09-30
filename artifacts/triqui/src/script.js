const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const scoreStorageKey = 'triqui-marcador-v1';
const emptyScores = { x: 0, o: 0, draws: 0 };

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameOver = false;
let scores = loadScores();

const cells = Array.from(document.querySelectorAll('[data-cell]'));
const statusMessage = document.querySelector('#status-message');
const turnDot = document.querySelector('#turn-dot');
const roundLabel = document.querySelector('#round-label');
const resetButton = document.querySelector('#reset-game');
const scoreX = document.querySelector('#score-x');
const scoreO = document.querySelector('#score-o');
const scoreDraws = document.querySelector('#score-draws');

function loadScores() {
  try {
    const savedScores = JSON.parse(localStorage.getItem(scoreStorageKey));
    if (!savedScores || typeof savedScores !== 'object') return { ...emptyScores };
    return {
      x: Number.isInteger(savedScores.x) && savedScores.x >= 0 ? savedScores.x : 0,
      o: Number.isInteger(savedScores.o) && savedScores.o >= 0 ? savedScores.o : 0,
      draws: Number.isInteger(savedScores.draws) && savedScores.draws >= 0 ? savedScores.draws : 0,
    };
  } catch {
    return { ...emptyScores };
  }
}

function saveScores() {
  localStorage.setItem(scoreStorageKey, JSON.stringify(scores));
}

function renderScores() {
  scoreX.textContent = scores.x;
  scoreO.textContent = scores.o;
  scoreDraws.textContent = scores.draws;
  roundLabel.textContent = `Ronda ${scores.x + scores.o + scores.draws + 1}`;
}

function setStatus(message, player = currentPlayer) {
  statusMessage.textContent = message;
  turnDot.dataset.player = player;
}

function renderBoard() {
  cells.forEach((cell, index) => {
    const value = board[index];
    cell.textContent = value;
    cell.dataset.value = value;
    cell.classList.remove('is-winning');
    cell.setAttribute(
      'aria-label',
      value ? `Casilla ${index + 1}, ocupada por ${value}` : `Casilla ${index + 1}, vacía`,
    );
    cell.disabled = Boolean(value) || gameOver;
  });
}

function getWinningLine(player) {
  return winningLines.find((line) => line.every((index) => board[index] === player)) || null;
}

function finishRound(winner, winningLine = null) {
  gameOver = true;
  cells.forEach((cell) => {
    cell.disabled = true;
  });

  if (winner) {
    scores[winner.toLowerCase()] += 1;
    saveScores();
    setStatus(`¡Gana el jugador ${winner}!`, winner);
    winningLine.forEach((index) => cells[index].classList.add('is-winning'));
  } else {
    scores.draws += 1;
    saveScores();
    setStatus('Empate: el tablero está completo.', currentPlayer);
  }

  renderScores();
}

function playTurn(event) {
  const cell = event.currentTarget;
  const index = Number(cell.dataset.cell);

  if (gameOver || board[index]) return;

  board[index] = currentPlayer;
  cell.classList.remove('is-new');
  void cell.offsetWidth;
  cell.classList.add('is-new');
  renderBoard();

  const winningLine = getWinningLine(currentPlayer);
  if (winningLine) {
    finishRound(currentPlayer, winningLine);
    return;
  }

  if (board.every(Boolean)) {
    finishRound(null);
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  setStatus(`Turno del jugador ${currentPlayer}`, currentPlayer);
  renderBoard();
}

function resetGame() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;
  setStatus('Turno del jugador X', 'X');
  renderBoard();
}

cells.forEach((cell) => cell.addEventListener('click', playTurn));
resetButton.addEventListener('click', resetGame);

renderScores();
resetGame();