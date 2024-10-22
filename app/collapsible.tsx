import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'react-markdown';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

const Collapsible = ({ title, description, expanded, expand }) => {
  const ref = React.useRef();

  const [height, setHeight] = React.useState();

  const handleToggle = e => {
    e.preventDefault();
    expand(!expanded);
    setHeight(ref.current.clientHeight);
  };

  const classes = `list-group-item ${
    expanded ? 'is-expanded' : null
  }`;
  
  const currentHeight = expanded ? height : 0;

  return (
    <div
      className={classes}
      onClick={handleToggle}
    >
      <div className="card-title">
        <h4><div className="card-icon">{expanded ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}</div> <div><Markdown>{title}</Markdown></div></h4>
      </div>
      <div
        className="card-collapse"
        style={{ height: currentHeight + 'px' }}
      >
        <div className="card-body" ref={ref}>
          <div className="description"><Markdown>{description}</Markdown></div>
        </div>
      </div>
    </div>
  );
};

export default Collapsible;
