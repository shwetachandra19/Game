const cells = document.querySelectorAll('.cell');
const resetBtn = document.getElementById('resetBtn');
const turnIndicator = document.getElementById('turnIndicator');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');
const clearScoreBtn = document.getElementById('clearScore');
const playWithBotCheckbox = document.getElementById('playWithBot');
const darkToggle = document.getElementById('darkModeToggle');
const difficultySelect = document.getElementById('difficulty');

// Sounds
const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');

let currentPlayer = 'X';
let gameActive = true;
let playWithBot = false;

const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

let scoreX = localStorage.getItem('scoreX') ? parseInt(localStorage.getItem('scoreX')) : 0;
let scoreO = localStorage.getItem('scoreO') ? parseInt(localStorage.getItem('scoreO')) : 0;

scoreXElement.textContent = scoreX;
scoreOElement.textContent = scoreO;
turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;

playWithBotCheckbox.addEventListener('change', () => {
  playWithBot = playWithBotCheckbox.checked;
});

darkToggle?.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkToggle.checked);
});

function checkWinner() {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (
      cells[a].textContent &&
      cells[a].textContent === cells[b].textContent &&
      cells[b].textContent === cells[c].textContent
    ) {
      gameActive = false;

      cells[a].classList.add('winning-cell');
      cells[b].classList.add('winning-cell');
      cells[c].classList.add('winning-cell');

      winSound.play();
      turnIndicator.textContent = `Player ${cells[a].textContent} Wins!`;

      if (cells[a].textContent === 'X') {
        scoreX++;
        localStorage.setItem('scoreX', scoreX);
        scoreXElement.textContent = scoreX;
      } else {
        scoreO++;
        localStorage.setItem('scoreO', scoreO);
        scoreOElement.textContent = scoreO;
      }
      return;
    }
  }

  const allFilled = [...cells].every(cell => cell.textContent !== '');
  if (allFilled && gameActive) {
    gameActive = false;
    turnIndicator.textContent = `It's a draw!`;
  }
}

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    if (!gameActive || cell.textContent !== '') return;

    clickSound.play();
    cell.textContent = currentPlayer;
    cell.classList.add('played');
    checkWinner();

    if (gameActive) {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;

      if (playWithBot && currentPlayer === 'O') {
        setTimeout(botMove, 400);
      }
    }
  });
});

resetBtn.addEventListener('click', () => {
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('played', 'winning-cell');
  });

  currentPlayer = 'X';
  gameActive = true;
  turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
});

clearScoreBtn.addEventListener('click', () => {
  scoreX = 0;
  scoreO = 0;
  localStorage.setItem('scoreX', 0);
  localStorage.setItem('scoreO', 0);
  scoreXElement.textContent = '0';
  scoreOElement.textContent = '0';
});

// =============================
// Bot Logic with Difficulty
// =============================

function botMove() {
  const difficulty = difficultySelect.value;

  if (difficulty === 'easy') {
    playRandomBot();
  } else if (difficulty === 'medium') {
    Math.random() < 0.5 ? playRandomBot() : playSmartBot();
  } else {
    playSmartBot(); // hard
  }
}

function playRandomBot() {
  const emptyCells = [...cells].filter(cell => cell.textContent === '');
  if (emptyCells.length === 0 || !gameActive) return;

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const chosenCell = emptyCells[randomIndex];

  chosenCell.textContent = 'O';
  chosenCell.classList.add('played');
  clickSound.play();

  checkWinner();

  if (gameActive) {
    currentPlayer = 'X';
    turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
  }
}

function playSmartBot() {
  let bestScore = -Infinity;
  let move;

  cells.forEach((cell, index) => {
    if (cell.textContent === '') {
      cell.textContent = 'O';
      let score = minimax(cells, 0, false);
      cell.textContent = '';

      if (score > bestScore) {
        bestScore = score;
        move = index;
      }
    }
  });

  if (move !== undefined && gameActive) {
    cells[move].textContent = 'O';
    cells[move].classList.add('played');
    clickSound.play();
    checkWinner();

    if (gameActive) {
      currentPlayer = 'X';
      turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
    }
  }
}

function minimax(board, depth, isMaximizing) {
  const winner = getWinner(board);
  if (winner !== null) {
    if (winner === 'O') return 10 - depth;
    else if (winner === 'X') return depth - 10;
    else return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    board.forEach((cell) => {
      if (cell.textContent === '') {
        cell.textContent = 'O';
        let score = minimax(board, depth + 1, false);
        cell.textContent = '';
        bestScore = Math.max(score, bestScore);
      }
    });
    return bestScore;
  } else {
    let bestScore = Infinity;
    board.forEach((cell) => {
      if (cell.textContent === '') {
        cell.textContent = 'X';
        let score = minimax(board, depth + 1, true);
        cell.textContent = '';
        bestScore = Math.min(score, bestScore);
      }
    });
    return bestScore;
  }
}

function getWinner(board) {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (
      board[a].textContent &&
      board[a].textContent === board[b].textContent &&
      board[b].textContent === board[c].textContent
    ) {
      return board[a].textContent;
    }
  }

  const allFilled = [...board].every(cell => cell.textContent !== '');
  if (allFilled) return 'draw';

  return null;
}
