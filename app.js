const GRID_SIZE = 200
const WIDTH = 10
const PREVIEW_WIDTH = 4

const L_TETROMINO = [
    [1, WIDTH + 1, WIDTH * 2 + 1, 2],
    [WIDTH, WIDTH + 1, WIDTH + 2, WIDTH * 2 + 2],
    [1, WIDTH + 1, WIDTH * 2 + 1, WIDTH * 2],
    [WIDTH, WIDTH * 2, WIDTH * 2 + 1, WIDTH * 2 + 2]
]

const Z_TETROMINO = [
    [0, WIDTH, WIDTH+1, WIDTH*2+1],
    [WIDTH + 1, WIDTH + 2, WIDTH * 2, WIDTH * 2 + 1],
    [0, WIDTH, WIDTH + 1, WIDTH * 2 + 1],
    [WIDTH + 1, WIDTH + 2, WIDTH * 2, WIDTH * 2 + 1]
]

const T_TETROMINO = [
    [1, WIDTH, WIDTH + 1, WIDTH + 2],
    [1, WIDTH + 1, WIDTH + 2, WIDTH * 2 + 1],
    [WIDTH, WIDTH + 1, WIDTH + 2, WIDTH * 2 + 1],
    [1, WIDTH, WIDTH + 1, WIDTH * 2 + 1]
]

const O_TETROMINO = [
    [0, 1, WIDTH, WIDTH + 1],
    [0, 1, WIDTH, WIDTH + 1],
    [0, 1, WIDTH, WIDTH + 1],
    [0, 1, WIDTH, WIDTH + 1]
]

const I_TETROMINO = [
    [1, WIDTH + 1, WIDTH * 2 + 1, WIDTH * 3 + 1],
    [WIDTH, WIDTH + 1, WIDTH + 2, WIDTH + 3],
    [1, WIDTH + 1, WIDTH * 2 + 1, WIDTH * 3 + 1],
    [WIDTH, WIDTH + 1, WIDTH + 2, WIDTH + 3]
]

const PREVIEW_TETROMINOS = [
    [1, PREVIEW_WIDTH + 1, PREVIEW_WIDTH * 2 + 1, 2],
    [0, PREVIEW_WIDTH, PREVIEW_WIDTH + 1, PREVIEW_WIDTH * 2 + 1],
    [1, PREVIEW_WIDTH, PREVIEW_WIDTH + 1, PREVIEW_WIDTH + 2],
    [0, 1, PREVIEW_WIDTH, PREVIEW_WIDTH + 1],
    [1, PREVIEW_WIDTH + 1, PREVIEW_WIDTH * 2 + 1, PREVIEW_WIDTH * 3 + 1],
]

const COLORS = [
    'red',
    'orange',
    'green',
    'blue',
    'orchid'
]

const L = 0
const Z = 1
const T = 2
const O = 3
const I = 4

const TETROMINOS = [L_TETROMINO, Z_TETROMINO, T_TETROMINO, O_TETROMINO, I_TETROMINO]
const STARTING_POSITION = 4
const STARTING_ROTATION = 0

document.addEventListener('DOMContentLoaded', () => {
    initialize()
})

document.addEventListener('keyup', control)

let grid
let currentPosition = STARTING_POSITION
let currentRotation = STARTING_ROTATION
let currentTetromino
let nextTetromino
let current 
let squares
let preview
let currentShape
let nextShape
let timerId
let score = 0
let scoreDisplay 

function initialize() {
    grid = document.querySelector('.grid')
    scoreDisplay = document.querySelector('#score')
    const startButton = document.querySelector('#start_button')

    squares = Array.from(document.querySelectorAll('.grid div'))
    preview = Array.from(document.querySelectorAll('.mini-grid div'))

    startButton.addEventListener('click', () => {
       if (timerId) {
           clearInterval(timerId)
           timerId = null
       } else {
           if (!currentTetromino) {
               selectNewTetromino()
           }
           timerId = setInterval(function () {
               gravity()
           }, 500)   
       }
    })
}

function control(event) {
    const code = event.keycode ? event.keycode : event.which
    if (code === 37) {
        moveLeft()
    }
    else if (code === 39) {
        moveRight()
    }
    else if (code === 38) {
        rotate()
    }
    else if (code === 40) {
        gravity()
    }
}

function draw() {
    currentTetromino[currentRotation].forEach(index => {
        squares[currentPosition + index].classList.add('tetromino')
        squares[currentPosition + index].style.backgroundColor = COLORS[currentShape]
    });
}

function erase() {
    currentTetromino[currentRotation].forEach(index=> {
        squares[currentPosition + index].classList.remove('tetromino')
        squares[currentPosition + index].style.backgroundColor = ''
    })
}

function drawMiniGrid() {
    preview.forEach(square => {
        square.classList.remove('tetromino')
        square.style.backgroundColor = ''
    })
    PREVIEW_TETROMINOS[nextShape].forEach(index => {
        preview[index].classList.add('tetromino')
        preview[index].style.backgroundColor = COLORS[nextShape]
    })
}

function getRandomTetrominoIndex() {
    return Math.floor(Math.random() * TETROMINOS.length)
}

function gravity() {
    erase()

    currentPosition += WIDTH

    draw()
    freeze()
}

function rotate() {
    erase()

    currentRotation = (currentRotation + 1) % 4
    current = currentTetromino[currentRotation]

    draw()
}


function selectCurrentTetromino() {
    if (!nextTetromino) {
        selectNextTetromino()
    }
    currentTetromino = nextTetromino
    currentShape = nextShape
    current = currentTetromino[STARTING_ROTATION]
    selectNextTetromino()
}

function selectNextTetromino() {
    nextShape = getRandomTetrominoIndex()
    nextTetromino = TETROMINOS[nextShape]
}

function selectNewTetromino() {
    currentPosition = STARTING_POSITION
    currentRotation = STARTING_ROTATION
    selectCurrentTetromino()
    selectNextTetromino()

    drawMiniGrid()
    draw()
}

function tetrominoAtBottom() {
    return current.some(index => squares[currentPosition + index + WIDTH].classList.contains('taken'))
}

function freeze() {
    if (tetrominoAtBottom()) {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'))
        selectNewTetromino()
        addScore()
        gameOver()
    }
}

function addScore() {
    for (i = 0; i < GRID_SIZE; i+= WIDTH) {
        const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9] 

        if (row.every(index => squares[index].classList.contains('tetromino'))) {
            score += 10
            scoreDisplay.innerHTML = score

            row.forEach(index => {
                squares[index].classList.remove('taken')
                squares[index].classList.remove('tetromino')
                squares[index].style.backgroundColor = ''
            })

            const squaresRemoved = squares.splice(i, WIDTH)
            squares = squaresRemoved.concat(squares)
            squares.forEach(cell => grid.appendChild(cell))
        }
    }
}

function atLeftEdge() {
    return current.some(index => ((currentPosition + index) % WIDTH) === 0) 
}

function touchingTetrominoLeftSide() {
    return current.some(index => squares[currentPosition + index - 1].classList.contains('taken'))
}

function atRightEdge() {
    return current.some(index => ((currentPosition + index) % WIDTH) === (WIDTH -1))
}

function touchingTetrominoRightSide() {
    return current.some(index => squares[currentPosition + index + 1].classList.contains('taken'))
}

function moveLeft() {
    if (atLeftEdge() || touchingTetrominoLeftSide()) {
        return
    }
    erase()

    currentPosition -= 1

    draw()
}

function moveRight() {
    if (atRightEdge() || touchingTetrominoRightSide()) {
        return
    }

    erase()

    currentPosition += 1

    draw()
}

function gameOver() {
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        scoreDisplay.innerHTML = 'GAME OVER'
        clearInterval(timerId)
    }
}