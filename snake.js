(function() {
  const rows = 10;
  const cols = 10;
  const tiles = {};

  let snake;
  let score;
  let topScore;
  let direction;
  let food;
  let moveInterval;
  let currentScoreEl;

  class Coordinate {
    constructor(row, col) {
      this.row = row;
      this.col = col;
    }
  }

  class Snake {
    constructor() {
      this.set = new Set();
      this.coords = [];
      this.head = null;
      this.hasFood = false;
    }
  
    addHead(coordinates) {
      this.coords.push(coordinates);
      this.head = coordinates;
      this.set.add(JSON.stringify(coordinates));
      tiles[coordinates.row][coordinates.col].classList.add('tile--snake');
    }
  
    removeTail() {
      const tail = this.coords.shift();
      this.set.delete(JSON.stringify(tail));
      tiles[tail.row][tail.col].classList.remove('tile--snake');
    }
  
    isOn(coordinates) {
      return this.set.has(JSON.stringify(coordinates));
    }
  }
  
  function drawBoard(rows, cols) {
    const board = document.getElementById('gameboard');
    
    for(let i = 0; i < rows; i++) {
      const row = document.createElement('div');
  
      row.className = `row row__${i}`;
      tiles[i] = {};
  
      for(let j = 0; j < cols; j++) {
        tiles[i][j] = document.createElement('div');
        tiles[i][j].className = `tile tile__${i},${j}`;
        row.appendChild(tiles[i][j]);
      }
  
      board.appendChild(row);
    }
  }
  
  function start() {
    snake = new Snake();
    score = 0;
    topScore = localStorage.getItem('topScore') || 0;
    direction = '';
    food = null;
    moveInterval = null;
    currentScoreEl = document.getElementsByClassName('current-score')[0];

    const coords = (function() {
      const getRandomNumberInBoundary = (limit) => Math.floor(Math.random() * limit);
      return new Coordinate(getRandomNumberInBoundary(rows), getRandomNumberInBoundary(cols));
    })();
  
    snake.addHead(coords);
    placeFood();

    const topScoreEl = document.getElementsByClassName('top-score')[0];
    topScoreEl.innerText = topScore;
  
    document.addEventListener('keydown', changeDirection);
  }
  
  function placeFood() {
    const emptyTiles = [];
  
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let coords = new Coordinate(i, j);
  
        if (!snake.isOn(coords)) {
          emptyTiles.push(coords);
        }
      }
    }
  
    const foodCoords = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
  
    food = foodCoords;
    tiles[food.row][food.col].classList.add('tile--food');
  }
  
  function changeDirection(event) {
    switch(event.keyCode) {
      case 37:
        newDirection = 'LEFT';
        break;
      case 38:
        newDirection = 'UP';
        break;
      case 39:
        newDirection = 'RIGHT';
        break;
      case 40:
        newDirection = 'DOWN';
        break;
      default:
        newDirection = '';
        break;
    }

    // don't let the snake reverse direction
    if (!newDirection ||
      direction === 'LEFT' && newDirection === 'RIGHT' ||
      direction === 'RIGHT' && newDirection === 'LEFT' ||
      direction === 'UP' && newDirection === 'DOWN' ||
      direction === 'DOWN' && newDirection === 'UP') {
      return false;
    }
  
    const prevDirection = direction;
    direction = newDirection;
  
    // check if this is the first movement of the snake
    if (prevDirection === '') {
      move();
    }
  }
  
  function move() {
    moveInterval = setInterval(function() {
      let nextCoords;
  
      switch (direction) {
        case 'LEFT':
          nextCoords = new Coordinate(snake.head.row, snake.head.col - 1);
          break;
        case 'UP':
          nextCoords = new Coordinate(snake.head.row - 1, snake.head.col);
          break;
        case 'RIGHT':
          nextCoords = new Coordinate(snake.head.row, snake.head.col + 1);
          break;
        case 'DOWN':
          nextCoords = new Coordinate(snake.head.row + 1, snake.head.col);
          break;
        default:
          break;
      }
  
      if (willCollide(nextCoords)) {
        endGame();
        return false;
      }
  
      if ((nextCoords.row === food.row) && (nextCoords.col === food.col)) {
        eatFood();
      }
  
      snake.addHead(nextCoords);
  
      // remove the tail if the snake doesn't have food
      // if it does have food, keep the tail so it can grow
      if (!snake.hasFood) {
        snake.removeTail();
      }
  
      snake.hasFood = false;
    }, 150);
  }
  
  function willCollide(nextCoords) {
    if (snake.isOn(nextCoords) ||
      nextCoords.row >= rows ||
      nextCoords.col >= cols ||
      nextCoords.row < 0 ||
      nextCoords.col < 0
    ) {
      return true;
    }
  
    return false;
  }
  
  function eatFood() {
    score += 100;
    currentScoreEl.innerText = score;
    tiles[food.row][food.col].classList.remove('tile--food');
    placeFood();
    snake.hasFood = true;
  }
  
  function endGame() {
    if (score > topScore) {
      localStorage.setItem('topScore', score);
    }
    clearInterval(moveInterval);
    alert('game over!');

    // restart game
    clearBoard();
    start();
  }

  function clearBoard() {
    tiles[food.row][food.col].classList.remove('tile--food');
    snake.coords.forEach(coord => {
      tiles[coord.row][coord.col].classList.remove('tile--snake');
    });
  }
  
  drawBoard(rows, cols);
  start();
})();
