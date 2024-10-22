import React from 'react';
import $ from 'jquery';
import FadeIn from './fade_in';

const dot = '•︎';

const generateDots = (numberOfDots) => {
  return [...Array(numberOfDots)].map(() => dot);
};

export default function DottedChart({ title, max, selected }) {
  const [inViewPort, setInViewPort] = React.useState(false);
  const [dots, setDots] = React.useState({ filled: 0, unfilled: max });

  const id = `dots-${Math.floor(Math.random() * 1000000)}`;

  React.useEffect(() => {
    if (inViewPort && dots.filled < selected) {
      setTimeout(() => {
        setDots({ filled: (dots.filled + 1), unfilled: (dots.unfilled - 1) });
      }, 250);
    }
  });

  const handleEnter = () => {
    setInViewPort(true);
  };

  return (
    <div className="dots-chart">
      <FadeIn onEnter={handleEnter}>
        <h4>{title}</h4>
        <div id={id} className="dots">
          <span className="filled-dots">
            {generateDots(dots.filled)}
          </span>
          <span className="unfilled-dots">
            {generateDots(dots.unfilled)}
          </span>
        </div>
      </FadeIn>
    </div>
  );
};
