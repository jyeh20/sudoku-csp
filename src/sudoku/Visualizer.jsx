import React from 'react'

import { makeStyles } from '@material-ui/core/styles'

const Visualizer = ({solving, miracle, puzzle, coords, value, row, col, handleClick}) => {
  const classes = useStyles()
  const red = '#FFAAAA'
  const white = '#FFFFFF'
  const blue = '#AADDFF'
  const green = '#BBFFCC'
  let val = value
  if (val === 0) {
    val = ""
  }

    // Constraints for the visualizer
    const rowVisualizerConstraint = () => {
      let visited = new Set()
      for (let colToCheck = 0; colToCheck < puzzle[row].length; colToCheck++) {
        let valueToCheck = puzzle[row][colToCheck]
        if (valueToCheck === 0) {
          continue
        }
        if (visited.has(valueToCheck)) {
          return false
        }
        visited.add(valueToCheck)
      }
      return true
    }

    const colVisualizerConstraint = () => {
      let visited = new Set()
      for (let rowToCheck = 0; rowToCheck < puzzle.length; rowToCheck++) {
        let valueToCheck = puzzle[rowToCheck][col]
        if (valueToCheck === 0) {
          continue
        }
        if (visited.has(valueToCheck)) {
          return false
        }
        visited.add(valueToCheck)
      }
      return true
    }

    const boxVisualizerConstraint = () => {
      let visited = new Set()
      let rowToCheck = 0
      let colToCheck = 0
      if (row <= 2) {
        rowToCheck = 1
      } else if (row >= 6) {
        rowToCheck = 7
      } else {
        rowToCheck = 4
      }

      if (col <= 2) {
        colToCheck = 1
      } else if (col >= 6) {
        colToCheck = 7
      } else {
        colToCheck = 4
      }

      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          let valueToCheck = puzzle[rowToCheck + r][colToCheck + c]
          if (valueToCheck === 0) {
            continue
          }
          if (visited.has(valueToCheck)) {
            return false
          }
          visited.add(valueToCheck)
        }
      }
      return true
    }

    const checkVisualizerConstraints = () => {
      const rc = rowVisualizerConstraint()
      const cc = colVisualizerConstraint()
      const bc = boxVisualizerConstraint()
      // No errors
      if (rc && cc && bc) {
            return true
      }
      // At least one error
      return false
    }

    // Miracle constraints for visualizer
    const knightsMoveVisualizerConstraint = () => {
      let positions = [1, 2] // positions array for checking

      for (let i = 0; i < 8; i++) {
        if (i === 4) { // swap rows/cols at 4th iteration
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
        let positionValue = puzzle[row+positions[0]][col+positions[1]]
        if (positionValue === 0) {
          if (i % 2 === 0) {
            positions = [positions[0], (-1 * positions[1])]
          } else {
            positions = [(-1 * positions[0]), positions[1]]
          }
          continue
        }
        if (positionValue === value) {
          // error
          return false
        }
        if (i % 2 === 0) {
          positions[1] *= -1
        } else {
          positions[0] *= -1
        }
      }

      // no errors
      return true
    }

    const kingsMoveVisualizerConstraint = () => {
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          if ((row + r) < 0 || (col + c) < 0
              || (row + r) > 8 || (col + c) > 8) {
            continue
          }
          if (r === 0 && c === 0) {
            continue
          }
          let position = puzzle[row+r][col+c]
          if (position === 0) {
            continue
          }
          if (position === value) {
            // error
            return false
          }
        }
      }

      // no errors
      return true
    }

    const checkMiracleVisualizerConstraints = () => {
      let cc = checkVisualizerConstraints()
      let knights = knightsMoveVisualizerConstraint()
      let kings = kingsMoveVisualizerConstraint()

      if (cc && knights && kings) {
        return true
      }

      return false
    }

  function getColor() {
    if (row === coords[0] && col === coords[1]) {
      return blue
    }
    if (coords[0] !== -1) {
      if (miracle) {
        if (!checkMiracleVisualizerConstraints()) {
          return red
        }
      } else {
        if (!checkVisualizerConstraints()) {
          return red
        }
      }
    }
    if (coords[0] !== -1 && solving) {
      if (miracle) {
        if (!checkMiracleVisualizerConstraints()) {
          return red
        }
      } else {
        if (!checkVisualizerConstraints()) {
          return red
        }
      }
    }
    if (value === 0) {
      return green
    }
    return white
  }
  return(
    <div className={classes.smallBox} style={{background: `${getColor()}`}} onClick={() => {handleClick(row, col)}}>
      {val}
    </div>
  )
}

const useStyles = makeStyles(() => ({
  smallBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '48px',
    height: '48px',
    border: '1px solid black',
    '&:hover': {
      background: '#00DDFF'
    }
  }
}))

export default Visualizer