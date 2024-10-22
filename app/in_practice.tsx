import React from 'react';
import CountUp from 'react-countup';
import FadeIn from './fade_in';

export default function InPractive({ title, noTitle, data }) {
  const [inViewPort, setInViewPort] = React.useState(false);

  const handleEnter = () => {
    setInViewPort(true);
  };

  let defaultTitle = 'Na prática, no Brasil...';
  if (noTitle) {
    defaultTitle = null;
  }

  return (
    <FadeIn onEnter={handleEnter}>
      <div id="in-practice">
        <h2>{title || defaultTitle}</h2>
        <div>
        { data.map((box, i) => (
          <div className="in-practice-box-container" id={`in-practice-box-container-${i + 1}`} key={i}>
            <h4 className="in-practice-title">{box.title}</h4>
            <div className="in-practice-box" id={`in-practice-box-${i + 1}`}>
              <small>{box.prefix || '‎ '}</small>
              <strong>{ inViewPort ? <CountUp separator="." prefix="R$ " end={parseInt(box.amount.replace(/[^0-9]+/g, ''), 10)} delay={1} duration={5} /> : 0 }</strong>
              <small>{box.suffix || '‎ '}</small>
              <span className="in-practice-text">{box.text}</span>
            </div>
          </div>
        ))}
        </div>
      </div>
    </FadeIn>
  );
};
