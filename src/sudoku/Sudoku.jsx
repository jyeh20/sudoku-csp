import React, { useState, useEffect, useRef } from 'react'

import Visualizer from './Visualizer'

import { makeStyles, withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

import app from '../firebase'

export default function Sudoku() {
  const classes = useStyles()
  const db = app.firestore()

  // Refs
  const originalBoard = useRef([[0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]])
  const puzzle = useRef(originalBoard.current)
  const nodes = useRef([])
  const coordinates = useRef([-1,-1])

  // States
  const [loading, setLoading] = useState(false)
  const [miracleSolving, setMiracleSolving] = useState(false)
  const [solving, setSolving] = useState(false)
  const [numberMap, setNumberMap] = useState(null)
  const [speed, setSpeed] = useState(5)
  const [boardState, setBoardState] = useState(0)
  const [statesArray, setStatesArray] = useState([])
  let stateArray = []

  /**
   * Node class for holding values in our sudoku structure
   */
  class NumberTuple {
    constructor(row, col, value) {
      this.row = row
      this.col = col
      this.value = value
    }
  }

  /**
   * Initialize our display on the *first* render
   */
  useEffect(() => {
    getRandomNormalBoard()
    initializeDisplay()
  }, [puzzle])

  /**
   * Side effects after first render
   */
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
      puzzle.current = (adjustNode(row, col, value))
      sleep(speed)
      setBoardState(boardState + 1)
    }
  }, [coordinates, boardState, solving])


  // Get Boards

  const resetBoard = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        adjustNode(row, col, 0)
      }
    }
  }

  const getRandomNormalBoard = () => {
    resetBoard()
    const collectionRef = db.collection("regularBoards")
    collectionRef.get().then((querySnapshot) => {
      const maxIndex = querySnapshot.size
      const randomIndex = Math.floor(Math.random() * maxIndex)
      const boardRef = querySnapshot.docs[randomIndex].data().board
      let row = -1;
      for (let i = 0; i < boardRef.length; i++) {
        if (i % 9 === 0) {
          row++
        }
        let col = i - (row * 9)
        originalBoard.current[row][col] = parseInt(boardRef[i])
        puzzle.current = originalBoard.current
      }
      initializeDisplay()
    })
  }

  const getRandomMiracleBoard = () => {
    resetBoard()
    const collectionRef = db.collection("miracleBoards")
    collectionRef.get().then((querySnapshot) => {
      const maxIndex = querySnapshot.size
      const randomIndex = Math.floor(Math.random() * maxIndex)
      const boardRef = querySnapshot.docs[randomIndex].data().board
      let row = -1;
      for (let i = 0; i < boardRef.length; i++) {
        if (i % 9 === 0) {
          row++
        }
        let col = i - (row * 9)
        originalBoard.current[row][col] = parseInt(boardRef[i])
        puzzle.current = originalBoard.current
      }
      initializeDisplay()
    })
  }


  /**
   * Helper method to speed up/slow down the visualizer
   * @param {int} milliseconds
   */
  const sleep = (milliseconds) => {
    const date = Date.now()
    let currentDate = null
    do {
      currentDate = Date.now()
    } while (currentDate - date < milliseconds)
  }

  // Constraints
  // ===============================================================

  // When adding a value

  /**
   * Checks if adding a value to a row will violate any constraints
   * @param {int[][]} board
   * @param {int} row
   * @param {int} value
   * @returns true if constraint is not violated, false otherwise
   */
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

  /**
   * Checks if adding a value to a column will violate any constraints
   * @param {int[][]} board
   * @param {int} col
   * @param {int} value
   * @returns true if constraint is not violated, false otherwise
   */
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

  /**
   * Determines the 3x3 grid this row/col pair belongs to, then determines
   * if adding the given value will violate any constraints
   * @param {int[][]} board
   * @param {int} row
   * @param {int} col
   * @param {int} value
   * @returns true if constraint is not violated, false otherwise
   */
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

  /**
   * Helper method that calls all *regular* constraint methods
   * @param {int[][]} board
   * @param {int} row
   * @param {int} col
   * @param {int} value
   * @returns true if constraints are not violated, false otherwise
   */
  const checkConstraints = (board, row, col, value) => {
    const rc = rowConstraint(board, row, value)
    const cc = colConstraint(board, col, value)
    const bc = boxConstraint(board, row, col, value)
    // No errors
    if (rc && cc && bc) {
          return true
    }
    // At least one error
    return false
  }


  // Adding a value with Miracle Sudoku

  /**
   * Determines all "knights moves" away from the given row/col pair (an 'L' shape) and
   * determines if the given value is valid
   * @param {int[][]} board
   * @param {int} row
   * @param {int} col
   * @param {int} value
   * @returns true if the constraint is not violated, false otherwise
   */
  const knightsMoveConstraint = (board, row, col, value) => {
    let positions = [1, 2]
    for (let i = 0; i < 8; i++) {
      if (i === 4) {
        positions = [2,1]
      }
      if ((row + positions[0] < 0) || (col + positions[1] < 0)
          || (row + positions[0] > 8) || (col + positions[1]) > 8) {
        if (i % 2 === 0) {
          positions = [positions[0], (-1 * positions[1])]
        } else {
          positions = [(-1 * positions[0]), positions[1]]
        }
        continue
      }
      let position = board[row+positions[0]][col+positions[1]]
      if (position === 0) {
        if (i % 2 === 0) {
          positions = [positions[0], (-1 * positions[1])]
        } else {
          positions = [(-1 * positions[0]), positions[1]]
        }
        continue
      }
      if (position === value) {
        return false
      }
      if (i % 2 === 0) {
        positions = [positions[0], (-1 * positions[1])]
      } else {
        positions = [(-1 * positions[0]), positions[1]]
      }
    }
    return true
  }

  /**
   * Determines all "kings moves" away from the given row/col pair (1 box in any direction) and
   * determines if the given value is valid
   * @param {int[][]} board
   * @param {int} row
   * @param {int} col
   * @param {int} value
   * @returns true if the constraint is not violated, false otherwise
   */
  const kingsMoveConstraint = (board, row, col, value) => {
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if ((row + r) < 0 || (col + c) < 0
            || (row + r) > 8 || (col + c) > 8) {
          continue
        }
        let position = board[row+r][col+c]
        if (position === 0) {
          continue
        }
        if (position === value) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Helper method that calls all regualar *and* miracle constraint methods
   * @param {int[][]} board
   * @param {int} row
   * @param {int} col
   * @param {int} value
   * @returns true if constraints are not violated, false otherwise
   */
  const checkMiracleConstraints = (board, row, col, value) => {
    let cc = checkConstraints(board, row, col, value)
    let knights = knightsMoveConstraint(board, row, col, value)
    let kings = kingsMoveConstraint(board, row, col, value)

    if (cc && knights && kings) {
      return true
    }

    return false
  }

  /**
   * Finds the next empty spot given a valid sudoku board
   * @param {int[][]} board
   * @returns a row/col pair indicating the next empty spot in this sudoku puzzle
   *          or [-1, -1] if there are no empty spots
   */
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

  /**
   * Uses backtracking to attempt to find a solution to a given sudoku puzzle
   * using regular constraints
   */
  const getSolution = () => {
    setLoading(true)
    let coords = getNextEmptySpot(originalBoard.current)
    let row = coords[0]
    let col = coords[1]

    // Base Case, no empty spots so we return the completeted board
    if (row === -1) {
      setStatesArray(stateArray)
      setSolving(true)
      setLoading(false)
      return
    }

    // Try every value that fits constraints
    for (let value = 1; value <= 9; value++) {
      if (checkConstraints(originalBoard.current, row, col, value)) {
        originalBoard.current[row][col] = value
        stateArray[stateArray.length] = [row, col, value]
        getSolution()
      }
    }

    // Unsolvable
    if (getNextEmptySpot(originalBoard.current)[0] !== -1) {
      originalBoard.current[row][col] = 0
    }
    setLoading(false)
    return
  }

  /**
   * Uses backtracking to attempt to find a solution to a given sudoku puzzle
   * using miracle constraints
   */
  const getMiracleSolution = () => {
    setLoading(true)
    let coords = getNextEmptySpot(originalBoard.current)
    let row = coords[0]
    let col = coords[1]

    // Base Case, no empty spots so we return the completeted board
    if (row === -1) {
      setStatesArray(stateArray)
      setSolving(true)
      setLoading(false)
      return
    }

    // Try every value that fits constraints
    for (let value = 1; value <= 9; value++) {
      if (checkMiracleConstraints(originalBoard.current, row, col, value)) {
        originalBoard.current[row][col] = value
        stateArray[stateArray.length] = [row, col, value]
        getMiracleSolution()
      }
    }

    // Unsolvable
    if (getNextEmptySpot(originalBoard.current)[0] !== -1) {
      stateArray[stateArray.length] = [row, col, 0]
      originalBoard.current[row][col] = 0
    }
    setLoading(false)
    return
  }

  /**
   * Sets nodes ref to the contents of originalBoard, and updates the display of
   * the sudoku puzzle
   */
  const initializeDisplay = () => {
    let nums = []
    for (let row = 0; row < originalBoard.current.length; row++) {
      for (let col = 0; col < originalBoard.current[row].length; col++) {
        nums.push(new NumberTuple(row, col, puzzle.current[row][col]))
      }
    }

    nodes.current = nums
    displayNodes(nums)
  }

  /**
   * Sets numberMap to a map of Visualizer components to be displayed
   * @param {NumberTuple[]} nums
   */
  const displayNodes = (nums) => {
    const numMap = nums.map((num) =>
      <Visualizer solving={solving} miracle={miracleSolving} puzzle={puzzle.current}
      coords={coordinates.current} value={num.value} row={num.row} col={num.col} handleClick={handleManualUpdate}/>
    )

    setNumberMap(numMap)
  }

  /**
   * Given a row, column, and value, adjusts the display accordingly
   * @param {int} row
   * @param {int} col
   * @param {int} value
   * @returns the current state of the puzzle
   */
  const adjustNode = (row, col, value) => {
    const index = (row * 9) + col
    if (nodes.current[index] === undefined) {
      return
    }
    nodes.current[index].value = value
    originalBoard.current[row][col] = value
    puzzle.current=originalBoard.current
    displayNodes(nodes.current)
    return puzzle.current
  }

  // Event Handlers
  // ====================================================================

  /**
   * Updates a "box" in the puzzle when clicked on by a user and increments it by 1
   * @param {int} row
   * @param {int} col
   */
  const handleManualUpdate = (row, col) => {
    let val = originalBoard.current[row][col]
    if (val === 9) {
      val = 0
    } else {
      val++
    }
    coordinates.current = [row, col]
    originalBoard.current = adjustNode(row, col, val)
    puzzle.current = originalBoard
  }

  /**
   * Sets the puzzle state to solving, and solves a puzzle following regular constraints
   */
  const solve = () => {
    getSolution()
  }

  /**
   * Sets the puzzle state to solving, and solves a puzzle following miracle constraints
   */
  const miracleSolve = () => {
    setMiracleSolving(true)
    getMiracleSolution()
  }

  /**
   * Updates the speed state to a millisecond value inputted by a user
   * @param {event} e
   */
  const handleSpeedChange = (e) => {
    setSpeed(e.target.value)
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.middleDiv}>
        <Speed disabled={solving} variant="outlined" label="Visualizer Speed" onChange={handleSpeedChange} defaultValue={speed} type="number" />
        <div className={classes.box}>
          <>{numberMap}</>
        </div>
        <div className={classes.boardButtons}>
        <BoardButton disabled={solving || loading} onClick={resetBoard}>Reset Board</BoardButton>
        <BoardButton disabled={solving || loading} onClick={getRandomNormalBoard}>Preset Sudoku Puzzle</BoardButton>
        <BoardButton disabled={solving || loading} onClick={getRandomMiracleBoard}>Preset Miracle Puzzle</BoardButton>
      </div>
      </div>
      <div className={classes.solveButtons}>
        <SolveButton className={classes.solve} disabled={solving || loading} onClick={solve}>Solve</SolveButton>
        <SolveButton className={classes.miracleSolve} disabled={solving || loading} onClick={miracleSolve}>Miracle Solve</SolveButton>
      </div>

    </div>
  )
}


const SolveButton = withStyles({
  root: {
    boxShadow: "none",
    textTransform: "none",
    margin: 'auto',
    width: '15vw',
    fontSize: 24,
    padding: "6px 25px",
    border: "1px solid",
    lineHeight: 1.5,
    borderRadius: 20,
    backgroundColor: '#80aeff',
    borderColor: '#80aeff',
    fontFamily: "Roboto",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: '#709eee',
      borderColor: '#709eee',
      boxShadow: "none",
    },
    "&:active": {
      boxShadow: "none",
      backgroundColor: '#80aeff',
      borderColor: '#80aeff',
    },
    "&:focus": {
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.5)",
    },
  },
})(Button)

const BoardButton = withStyles({
  root: {
    boxShadow: "none",
    textTransform: "none",
    margin: 'auto',
    marginBottom: '15px',
    width: '60%',
    fontSize: 24,
    padding: "6px 25px",
    border: "1px solid",
    lineHeight: 1.5,
    borderRadius: 20,
    backgroundColor: '#80aeff',
    borderColor: '#80aeff',
    fontFamily: "Roboto",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: '#709eee',
      borderColor: '#709eee',
      boxShadow: "none",
    },
    "&:active": {
      boxShadow: "none",
      backgroundColor: '#80aeff',
      borderColor: '#80aeff',
    },
    "&:focus": {
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.5)",
    },
  },
})(Button)

const Speed = withStyles({
  root: {
    width: '120px',
    height: '48px',
    margin: 'auto',
    gridColumnStart: 1,
    gridColumnEnd: 2,
    fontFamily: "Roboto",
    "& label.Mui-focused": {
      color: '#80aeff',
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: '#80aeff',
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: '#000000',
      },
      "&:hover fieldset": {
        borderColor: '#80aeff',
      },
      "&.Mui-focused fieldset": {
        borderColor: '#80aeff',
        border: "3px solid",
      },
    },
  },
})(TextField)

const useStyles = makeStyles(() => ({
  wrapper: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    background: '#EEEEEE',
    flexDirection: 'column',
  },

  middleDiv: {
    margin: 'auto',
    height: '450px',
    width: '100vw',
    display: 'grid',
    gridTemplateColumns: '33vw 33vw 33vw'
  },

  box: {
    margin: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    gridColumnStart: 2,
    gridColumnEnd: 3,
    background: '#EEEEEE',
    width: '450px',
    height: '450px',
    display: 'flex',
    flexWrap: 'wrap'
  },

  solveButtons: {
    display: 'grid',
    marginBottom: '4%',
    gridTemplateColumns: 'auto auto',
    width: '50%',
    margin: 'auto',
  },

  solve: {
    gridColumnStart: 1,
    gridColumnEnd: 2,
  },

  miracleSolve: {
    gridColumnStart: 2,
    gridColumnEnd: 3
  },

  boardButtons: {
    display: 'grid',
    margin: 'auto',
    width: '80%',
    gridTemplateRows: 'auto auto auto auto',
    gridColumnStart: 3,
    girdColumnEnd: 4,
  },
}))