import { useEffect } from 'react';
import $ from 'jquery';

export default function BigBar({ id, index, maxWidth, minWidth, maxValue, value, label, className }) {
  const width = ((value * maxWidth) / maxValue);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.setTimeout(
        () => {
          const $bar = $(`#${id}`);
          $bar.fadeIn(1000, () => {
            $bar.animate({ width: $bar.attr('data-width') }, 1000, 'swing', () => { $bar.next('span').fadeIn(1000); })
          });
        },
        1000 + (index * 3000),
      );
    }
  }, []);

  return (
    <div className={`bar big-bar ${className || ''}`}>
      <div id={id} className="bar-inner" style={{ width: minWidth }} data-width={width}></div>
      <span>{label}</span>
    </div>
  );
}
