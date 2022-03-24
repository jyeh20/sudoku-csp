import React, { useState } from "react";

import "./Button.css";

const Button = (props) => {
  const { children, handler } = props;
  const [down, setDown] = useState(false);

  return (
    <div
      className="Button"
      style={{
        transitionDuration: down ? "none" : "",
        filter: down ? "drop-shadow(5px 5px 3px #333333)" : "",
        backgroundColor: down ? "#6da6d9" : "",
      }}
      onMouseDown={() => {
        setDown(true);
      }}
      onMouseUp={() => {
        setDown(false);
      }}
      onMouseLeave={() => {
        setDown(false);
      }}
      onClick={handler}
    >
      {children}
    </div>
  );
};

export default Button;
