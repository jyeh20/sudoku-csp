import React, { useState, useEffect, useRef } from 'react'

import { makeStyles } from '@material-ui/core/styles'

export default function Sudoku() {
  const originalBoard = [[0, 1, 6, 3, 0, 8, 4, 2, 0],
                          [8, 4, 0, 0, 0, 7, 3, 0, 0],
                          [3, 0, 0, 0, 0, 0, 0, 0, 0],
                          [0, 6, 0, 9, 4, 0, 8, 0, 2],
                          [0, 8, 1, 0, 3, 0, 7, 9, 0],
                          [9, 0, 3, 0, 7, 6, 0, 4, 0],
                          [0, 0, 0, 0, 0, 0, 0, 0, 3],
                          [0, 0, 5, 7, 0, 0, 0, 6, 8],
                          [0, 7, 8, 1, 0, 3, 2, 5, 0]]
  const [puzzle, setPuzzle] = useState(originalBoard)

  const classes = useStyles()
  const coordinates = useRef([-1,-1])
  const [solving, setSolving] = useState(false)
  const [numberMap, setNumberMap] = useState(null)
  const [boardState, setBoardState] = useState(0)
  const [statesArray, setStatesArray] = useState([])
  const [nodesList, setNodesList] = useState([])

  class NumberTuple {
    constructor(row, col, value) {
      this.row = row
      this.col = col
      this.value = value
    }
  }

  const sleep = (milliseconds) => {
    const date = Date.now()
    let currentDate = null
    do {
      currentDate = Date.now()
    } while (currentDate - date < milliseconds)
  }

  // Constraints when adding a value
  const rowConstraint = (board, row, value) => {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        continue
      }
      if (board[row][col] === value) {
        return false
      }
    }
    return true
  }

  const colConstraint = (board, col, value) => {
    for (let row = 0; row < board.length; row++) {
      if (board[row][col] === 0) {
        continue
      }
      if (board[row][col] === value) {
        return false
      }
    }
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
          return false
        }
      }
    }
    return true
  }

  const checkConstraints = (board, row, col, value) => {
    const rc = rowConstraint(board, row, value)
    const cc = colConstraint(board, col, value)
    const bc = boxConstraint(board, row, col, value)
    console.log(row, col, rc, cc, bc)
    // No errors
    if (rc && cc && bc) {
          return true
    }
    // At least one error
    return false
  }

  // Constraints for the visualizer
  const rowVisualizerConstraint = (board, row) => {
    let visited = new Set()
    for (let col = 0; col < board[row].length; col++) {
      let value = board[row][col]
      if (value === 0) {
        continue
      }
      if (visited.has(value)) {
        return false
      }
      visited.add(value)
    }
    return true
  }

  const colVisualizerConstraint = (board, col) => {
    let visited = new Set()
    for (let row = 0; row < board.length; row++) {
      let value = board[row][col]
      if (value === 0) {
        continue
      }
      if (visited.has(value)) {
        return false
      }
      visited.add(value)
    }
    return true
  }

  const boxVisualizerConstraint = (board, row, col) => {
    let visited = new Set()
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
        let value = board[posRow + r][posCol + c]
        if (value === 0) {
          continue
        }
        if (visited.has(value)) {
          return false
        }
        visited.add(value)
      }
    }
    return true
  }

  const checkVisualizerConstraints = (board, row, col) => {
    const rc = rowVisualizerConstraint(board, row)
    const cc = colVisualizerConstraint(board, col)
    const bc = boxVisualizerConstraint(board, row, col)
    console.log(row, col, rc, cc, bc)
    // No errors
    if (rc && cc && bc) {
          return true
    }
    // At least one error
    return false
  }

  const getNextEmptySpot = (board) => {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === 0) {
          coordinates.current = [row, col]
          return [row, col]
        }
      }
    }
    return [-1, -1]
  }

  const handleClick = (row, col) => {
    let val = puzzle[row][col]
    if (val === 9) {
      puzzle[row][col] = 0
    } else {
      puzzle[row][col]++
    }
    coordinates.current = [row, col]
  }

  let stateArray = []
  function getSolution (board) {
    let coords = getNextEmptySpot(board)
    let row = coords[0]
    let col = coords[1]

    // Base Case, no empty spots so we return the completeted board
    if (row === -1) {
      setStatesArray(stateArray)
      setSolving(true)
      return
    }

    // Try every value that fits constraints
    for (let value = 1; value <= 9; value++) {
      if (checkConstraints(board, row, col, value)) {
        board[row][col] = value
        stateArray[stateArray.length] = [row, col, value]
        getSolution(board)
      }
    }

    // Unsolvable
    if (getNextEmptySpot(board)[0] !== -1) {
      board[row][col] = 0
    }
    return
  }

  function solve () {
    getSolution(originalBoard)
  }

  const initializeDisplay = () => {
    let nums = []
    for (let row = 0; row < puzzle.length; row++) {
      for (let col = 0; col < puzzle[row].length; col++) {
        nums.push(new NumberTuple(row, col, puzzle[row][col]))
      }
    }

    setNodesList(nums)
    displayNodes(nums)
  }

  const displayNodes = (nums) => {
    const numMap = nums.map((num) =>
      <SmallBox constraints={checkVisualizerConstraints} puzzle={puzzle}
      coords={coordinates.current} value={num.value} row={num.row} col={num.col} handleClick={handleClick}/>
    )

    setNumberMap(numMap)
  }

  const adjustNode = (row, col, value) => {
    const index = (row * 9) + col
    let nodes = nodesList
    nodes[index].value = value
    puzzle[row][col] = value
    setNodesList(nodes)
    displayNodes(nodes)
    return puzzle
  }

  useEffect(() => {
    // populate boxes
    initializeDisplay()
  }, [])

  useEffect(() => {
    if (solving) {
      if (boardState === statesArray.length) {
        setSolving(!solving)
        return
      }
      let row = statesArray[boardState][0]
      let col = statesArray[boardState][1]
      let value = statesArray[boardState][2]
      coordinates.current = [row, col]
      setPuzzle(adjustNode(row, col, value))
      sleep(60)
      setBoardState(boardState + 1)
    }
  }, [coordinates, boardState, solving])

  return (
    <div className={classes.wrapper}>
      <div className={classes.box}>
        <>{numberMap}</>
      </div>
      <button disabled={solving} onClick={solve}>solve</button>
    </div>
  )
}

const SmallBox = ({constraints, puzzle, coords, value, row, col, handleClick}) => {
  const classes = useStyles()
  const red = '#FFAAAA'
  const white = '#FFFFFF'
  const blue = '#AADDFF'
  const green = '#BBFFCC'
  function getColor() {
    if (coords[0] !== -1) {
      if (!constraints(puzzle, row, col, value)) {
        return red
      }
    }
    if (value === 0) {
      return green
    }
    if (row === coords[0] && col === coords[1]) {
      return blue
    } else {
      return white
    }
  }
  return(
    <div className={classes.smallBox} style={{background: `${getColor()}`}} onClick={() => {handleClick(row, col)}}>
      {value}
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
    border: '1px solid black',
    '&:hover': {
      background: '#00DDFF'
    }
  }
}))