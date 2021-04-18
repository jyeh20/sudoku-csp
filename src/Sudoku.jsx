import React, { useState, useEffect } from 'react'

import { makeStyles } from '@material-ui/core/styles'

export default function Sudoku() {
  const update = useForceUpdate()
  const classes = useStyles()
  const [puzzle, setPuzzle] = useState([[0, 1, 6, 3, 0, 8, 4, 2, 0],
                                        [8, 4, 0, 0, 0, 7, 3, 0, 0],
                                        [3, 0, 0, 0, 0, 0, 0, 0, 0],
                                        [0, 6, 0, 9, 4, 0, 8, 0, 2],
                                        [0, 8, 1, 0, 3, 0, 7, 9, 0],
                                        [9, 0, 3, 0, 7, 6, 0, 4, 0],
                                        [0, 0, 0, 0, 0, 0, 0, 0, 3],
                                        [0, 0, 5, 7, 0, 0, 0, 6, 8],
                                        [0, 7, 8, 1, 0, 3, 2, 5, 0]])
  const [coordinates, setCoordinates] = useState([-1,-1])
  const [sudoku, setSudoku] = useState(null)
  const [rowError, setRowError] = useState(false)
  const [colError, setColError] = useState(false)
  const [boxError, setBoxError] = useState(false)
  const [solving, setSolving] = useState(false)

  function sleep(milliseconds) {
    const date = Date.now()
    let currentDate = null
    do {
      currentDate = Date.now()
    } while (currentDate - date < milliseconds)
  }

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
    update()
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
    function getNumbers(row, col) {
      let list = []
      for (let r = -1; r < 2; r++) {
        for (let c = -1; c < 2; c++) {
          list.push(puzzle[row+r][col+c])
        }
      }
      return list
    }

    function solve(board) {
      const r = getNextEmptySpot(board)
      let row = r[0]
      let col = r[1]

      if (row === -1) {
        setSolving(false)
        return
      }

      for (let value = 1; value <= 9; value++) {
        if (checkConstraints(board, row, col, value)) {
          board[row][col] = value
          setPuzzle(board)
          update()
          sleep(5)
          solve(puzzle)
        }
      }

      if (getNextEmptySpot(board)[0] !== -1) {
        board[row][col] = 0
      }
      return
    }

    function solveLoop() {
      solve(puzzle)
      update()
    }

    setSudoku({
      solveLoop,
      getNumbers
    })
  }, [setPuzzle])

  const solv = () => sudoku.solveLoop()
  // const getElements = (row, col) => sudoku.getNumbers(row, col)

  function getElements(row, col) {
    let list = []
    for (let r = -1; r < 2; r++) {
      for (let c = -1; c < 2; c++) {
        list.push(puzzle[row+r][col+c])
      }
    }
    return list
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.box}>
        <BigBox elements={getElements(1, 1)} row={1} col={1} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
        <BigBox elements={getElements(1, 4)} row={1} col={4} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
        <BigBox elements={getElements(1, 7)} row={1} col={7} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
        <BigBox elements={getElements(4, 1)} row={4} col={1} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
        <BigBox elements={getElements(4, 4)} row={4} col={4} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
        <BigBox elements={getElements(4, 7)} row={4} col={7} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
        <BigBox elements={getElements(7, 1)} row={7} col={1} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
        <BigBox elements={getElements(7, 4)} row={7} col={4} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
        <BigBox elements={getElements(7, 7)} row={7} col={7} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
      </div>
      <button disabled={solving} onClick={solv}>solve</button>
    </div>
  )
}

function BigBox({elements, row, col, handleClick, solving, coordinates, sleep, rowError, setRowError, colError, setColError, boxError, setBoxError}) {
  const classes = useStyles()
  return (
    <div className={classes.bigBox}>
      <SmallBox element={elements[0]} row={row-1} col={col-1} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
      <SmallBox element={elements[1]} row={row-1} col={col} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
      <SmallBox element={elements[2]} row={row-1} col={col+1} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
      <SmallBox element={elements[3]} row={row} col={col-1} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
      <SmallBox element={elements[4]} row={row} col={col} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
      <SmallBox element={elements[5]} row={row} col={col+1} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
      <SmallBox element={elements[6]} row={row+1} col={col-1} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
      <SmallBox element={elements[7]} row={row+1} col={col} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
      <SmallBox element={elements[8]} row={row+1} col={col+1} handleClick={handleClick} solving={solving} coordinates={coordinates}
                sleep={sleep} rowError={rowError} setRowError={setRowError} colError={colError} setColError={setColError}
                boxError={boxError} setBoxError={setBoxError}/>
    </div>
  )
}

function SmallBox({element, row, col, handleClick, solving, coordinates, sleep, rowError, setRowError, colError, setColError, boxError, setBoxError}) {
  const classes = useStyles()

  const inBox = (r, c, coords) => {
    let trow = coords[0]
    let tcol = coords[1]
    let tPosRow = 0
    let tPosCol = 0
    let posRow = 0
    let posCol = 0
    if (r <= 2) {
      posRow = 1
    } else if (r >= 6) {
      posRow = 7
    } else {
      posRow = 4
    }

    if (trow <= 2) {
      tPosRow = 1
    } else if (trow >= 6) {
      tPosRow = 7
    } else {
      tPosRow = 4
    }

    if (c <= 2) {
      posCol = 1
    } else if (c >= 6) {
      posCol = 7
    } else {
      posCol = 4
    }

    if (tcol <= 2) {
      tPosCol = 1
    } else if (tcol >= 6) {
      tPosCol = 7
    } else {
      tPosCol = 4
    }

    if (posRow === tPosRow && posCol === tPosCol) {
      return true
    }
    return false
  }

  const bgColor = () => {
    if (row === coordinates[0] && col === coordinates[1]) {
      return '#00FFDD'
    }
    if ((rowError && coordinates[0] === row) ||
        (colError && coordinates[1] === col) ||
        (boxError && inBox(row, col, coordinates))) {
      return '#FFBBBB'
    }
    else {
      return '#FFFFFF'
    }
  }
  return (
    <div id={"box"} className={classes.smallBox} style={{background:`${bgColor()}`}} onClick={() => {if(!solving) {handleClick(row, col)}}}>
      {element}
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

  bigBox: {
    background: '#FFFFFF',
    width: '32%',
    border: '3px solid black',
    display: 'flex',
    flexWrap: 'wrap'
  },

  smallBox: {
    fontSize: '1.5vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '32.25%',
    border: '1px solid black'
  }
}))

function useForceUpdate() {
  // eslint-disable-next-line
  const [value, setValue] = useState(0) // integer state
  return () => setValue(value => value + 1) // update the state to force render
}