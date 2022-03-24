import React from "react";

import "./Square.css";

const Square = (props) => {
  const { val, row, col } = props;
  return (
    <div
      className="Square"
      style={{
        border: "1px solid black",
        gridColumnStart: col,
        gridRowStart: row,
      }}
    >
      {val}
    </div>
  );
};

export default Square;
