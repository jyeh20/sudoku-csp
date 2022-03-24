import React from "react";

import "./Board.css";

import Square from "../Square/Square";

const Board = (props) => {
  const { board, backgroundColor } = props;

  return (
    <div className="Board" style={{ backgroundColor }}>
      <div className="Board-layout">
        {board.map((obj) => (
          <Square
            val={obj.val}
            row={obj.row}
            col={obj.col}
            key={`Square-${obj.row}${obj.col}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Board;
