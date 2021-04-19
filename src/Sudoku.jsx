import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'

export default function Sudoku() {
  const [puzzle, setPuzzle] = useState([[0, 1, 6, 3, 0, 8, 4, 2, 0],
                                        [8, 4, 0, 0, 0, 7, 3, 0, 0],
                                        [3, 0, 0, 0, 0, 0, 0, 0, 0],
                                        [0, 6, 0, 9, 4, 0, 8, 0, 2],
                                        [0, 8, 1, 0, 3, 0, 7, 9, 0],
                                        [9, 0, 3, 0, 7, 6, 0, 4, 0],
                                        [0, 0, 0, 0, 0, 0, 0, 0, 3],
                                        [0, 0, 5, 7, 0, 0, 0, 6, 8],
                                        [0, 7, 8, 1, 0, 3, 2, 5, 0]])
  const update = useForceUpdate()
  const classes = useStyles()
  const [coordinates, setCoordinates] = useState([-1,-1])
  const [sudoku, setSudoku] = useState(null)
  const [rowError, setRowError] = useState(false)
  const [colError, setColError] = useState(false)
  const [boxError, setBoxError] = useState(false)
  const [solving, setSolving] = useState(false)
  const [numberMap, setNumberMap] = useState(null)
  const [puzzleStates, setPuzzleStates] = useState([])
  const [stepState, setStepState] = useState(null)

  class NumberTuple {
    constructor(row, col, value) {
      this.row = row
      this.col = col
      this.value = value
    }
  }

  function sleep(milliseconds) {
    const date = Date.now()
    let currentDate = null
    do {
      currentDate = Date.now()
    } while (currentDate - date < milliseconds)
  }

  const rowConstraint = (board, row, value) => {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        continue
      }
      if (board[row][col] === value) {
        setRowError(true)
        return false
      }
    }
    setRowError(false)
    return true
  }

  const colConstraint = (board, col, value) => {
    for (let row = 0; row < board.length; row++) {
      if (board[row][col] === 0) {
        continue
      }
      if (board[row][col] === value) {
        setColError(true)
        return false
      }
    }
    setColError(false)
    return true
  }

  const boxConstraint = (board, row, col, value) => {
    let posRow = 0
    let posCol = 0
    if (row <= 2) {
      posRow = 1
    } else if (row >= 6) {
      posRow = 7
    } else {
      posRow = 4
    }

    if (col <= 2) {
      posCol = 1
    } else if (col >= 6) {
      posCol = 7
    } else {
      posCol = 4
    }

    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (board[posRow + r][posCol + c] === 0) {
          continue
        }
        if (board[posRow + r][posCol + c] === value) {
          setBoxError(true)
          return false
        }
      }
    }
    setBoxError(false)
    return true
  }

  function checkConstraints (board, row, col, value) {
    setCoordinates([row, col])
    const rc = rowConstraint(board, row, value)
    const cc = colConstraint(board, col, value)
    const bc = boxConstraint(board, row, col, value)
    update()
    // No errors
    if (rc && cc && bc) {
          return true
    }
    // At least one error
    return false
  }

  function getNextEmptySpot (board) {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === 0) {
          setCoordinates([row, col])
          update()
          return [row, col]
        }
      }
    }
    return [-1, -1]
  }

  useEffect(() => {
    let puzzleBoard = puzzle
    let coords = [-1, -1]

    const handleClick = (row, col) => {
      let newPuzzle = puzzle
      let val = newPuzzle[row][col]
      if (val === 9) {
        newPuzzle[row][col] = 0
      } else {
        newPuzzle[row][col]++
      }
      setPuzzle(newPuzzle)
      setCoordinates([row, col])
      console.log(puzzle)
      update()
    }

    function solve(board) {
      coords = getNextEmptySpot(board)
      let row = coords[0]
      let col = coords[1]

      if (row === -1) {
        setSolving(false)
        return
      }

      console.log(board)
      sleep(5)

      for (let value = 1; value <= 9; value++) {
        if (checkConstraints(board, row, col, value)) {
          board[row][col] = value
          setPuzzle(board)
          let copy = puzzleStates
          copy.push(board)
          setPuzzleStates(copy)
          setStepState(puzzleStates.length)
          solve(puzzle)
        }
      }
      if (getNextEmptySpot(board)[0] !== -1) {
        board[row][col] = 0
      }
      return
    }

    const solveLoop = () => {
      solve(puzzle)
      update()
    }

    const getNumbers = () => {
      let nums = []
      for (let row = 0; row < puzzle.length; row++) {
        for (let col = 0; col < puzzle[row].length; col++) {
          nums.push(new NumberTuple(row, col, puzzle[row][col]))
        }
      }

      const numMap = nums.map((num) =>
        <SmallBox puzzle={puzzleBoard} coords={coords} value={num.value} row={num.row} col={num.col} handleClick={handleClick} />
      )

      setNumberMap(numMap)
    }

    getNumbers()

    setSudoku({
      getNumbers,
      handleClick,
      solveLoop,
    })
  }, [coordinates, setCoordinates])

  const solv = () => sudoku.solveLoop()
  const getNums = () => sudoku.getNumbers()

  const updatePuzzle = (num) => {
    const val = stepState + num
    if (val > puzzleStates.length) {
      return
    }
    if (val < 0) {
      return
    }
    setStepState(val)
    setPuzzle(puzzleStates[stepState])
    getNums()
    update()
    console.log("PUZZLE", puzzleStates)
    console.log(num)
    console.log(stepState)
    console.log(puzzle)
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.box}>
        <>{numberMap}</>
      </div>
      <button disabled={solving} onClick={solv}>solve</button>
      <button onClick={() => updatePuzzle(-10)}>-10</button>
      <button onClick={() => updatePuzzle(-1)}>-1</button>
      <button onClick={() => updatePuzzle(+1)}>+1</button>
      <button onClick={() => updatePuzzle(+10)}>+10</button>
    </div>
  )
}

const SmallBox = (props) => {
  const classes = useStyles()
  return(
    <div className={classes.smallBox} onClick={() => {props.handleClick(props.row, props.col)}}>
      {props.puzzle[props.row][props.col]}
    </div>
  )
}

const useStyles = makeStyles(() => ({
  wrapper: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    background: '#EEEEEE',
    flexDirection: 'column',
  },

  box: {
    margin: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    background: '#EEEEEE',
    width: '576px',
    height: '576px',
    display: 'flex',
    flexWrap: 'wrap'
  },

  smallBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '62px',
    height: '62px',
    background: '#FFFFFF',
    border: '1px solid black',
    '&:hover': {
      background: '#00DDFF'
    }
  }
}))

function useForceUpdate() {
  // eslint-disable-next-line
  const [value, setValue] = useState(0) // integer state
  return () => setValue(value => value + 1) // update the state to force render
}