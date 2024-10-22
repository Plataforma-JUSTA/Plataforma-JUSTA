import React, { useRef, useEffect, useState } from 'react';

const RectangleWithText = ({ text }) => {
  const textRef = useRef(null);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    // Get the width of the text element
    if (textRef.current) {
      const width = textRef.current.getBBox().width;
      setTextWidth(width);
    }
  }, [text]);

  return (
    <g className="rectangle-with-text">
      <rect x={0} y={0} width={10 + textWidth + 10} height="30" rx={0.5} ry={0.5} />
      <text ref={textRef} x="10" y="15" alignmentBaseline="central">{text}</text>
    </g>
  );
};

export default RectangleWithText;
