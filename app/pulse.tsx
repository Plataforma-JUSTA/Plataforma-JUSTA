import React from 'react';
import Markdown from 'react-markdown';
import { Tooltip } from 'react-tooltip';
import './pulse.css';

export default function Pulse({ id, style, className, title, onClick }) {
  const defaultOnClick = () => {};

  return (
    <>
      <div
        className={`pulsating-circle ${className}`}
        id={id}
        style={style}
        onClick={onClick || defaultOnClick}
        data-tooltip-id={`tooltip-pulse-${id}`}
        data-tooltip-place="bottom"
        data-tooltip-position-strategy="fixed"
      />
      <Tooltip id={`tooltip-pulse-${id}`} className={`tooltip tooltip-pulse tooltip-pulse-${className}`} opacity={1}>
        <Markdown>{title}</Markdown>
      </Tooltip>
    </>
  );
}
