import * as React from 'react';
import { Tooltip } from 'react-tooltip';
import NumberToWords from './number_to_words';

export default function TabChart({ title, label, value, zero, selected, maxValue, originalValue }) {
  const [loaded, setLoaded] = React.useState(false);

  const id = `tab-chart-tooltip-${Math.floor(Math.random() * 1000000)}`;
  const maxWidth = 135;
  const width = ((maxWidth * value) / maxValue);

  if (value === '0.000' && originalValue > 0) {
    value = (originalValue * 1000).toFixed(3);
    title = title.replace('bilhões', 'milhões');
  }

  React.useEffect(() => {
    setTimeout(() => {
      if (!loaded) {
        setLoaded(true);
      }
    }, 1000);
  }, []);

  return (
    <>
      <div
        className="tab-chart"
        style={{ opacity: (selected ? 1.0 : 0.5 ) }}
        data-tooltip-id={id}
        data-tooltip-place="top"
        data-tooltip-position-strategy="fixed"
      >
        <h4>{label}</h4>
        <div className="tab-chart-bar" style={{ width: maxWidth, maxWidth }}>
          <div className={`tab-chart-bar-inner ${loaded ? 'loaded' : ''}`} style={{ width }}>
          </div>
        </div>
      </div>
      <Tooltip id={id} className="tooltip" opacity={1}>
        { value == 0 ? zero : <NumberToWords number={value} label={title} /> }
      </Tooltip>
    </>
  );
} 
