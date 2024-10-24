import { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { Modal } from 'react-responsive-modal';
import { GoLinkExternal } from 'react-icons/go';
import Markdown from 'react-markdown';
import $ from 'jquery';
import Counter from './counter';

const splitData = (data) => {
  const parts = data.split('=');
  return {
    main: parts[0],
    other: parts[1].split('+'),
  };
};

const SubBars = ({ labels, captions, values, maxValue, showPercentages, useGradient }) => {
  const orderedValues = values.slice().sort((a, b) => (a - b));
  const id = Math.floor(Math.random() * 1000000);
  const [modalContent, setModalContent] = useState(null);
  const myRef = useRef(null);

  return (
    <div className="sub-bars">
      {values.map((value, index) => {
        const percentage = `${(value * 100 / maxValue).toFixed(1)}%`;
        const opacity = (useGradient ? Math.max((value / orderedValues.slice(-1)).toFixed(2), 0.2) : 1.0);
        let caption = captions[index];
        let modal = null;
        if (/ \[([^\]]+)\]$/.test(caption)) {
          modal = caption.match(/( \[([^\]]+)\])$/);
          caption = caption.replace(modal[1], '');
          modal = modal[2];
        }

        return (
           <div
             key={index}
             className={`sub-bar ${modal ? 'with-link' : 'without-link'}`}
             style={{ width: percentage, order: orderedValues.length - orderedValues.indexOf(value), background: `color-mix(in srgb, currentColor ${parseInt(opacity * 100, 10)}%, #EEE)` }}
             data-tooltip-id={`tooltip-${id}`}
             data-tooltip-place="top"
             data-tooltip-position-strategy="fixed"
             data-tooltip-content={`${labels[index]}: ${caption} (${percentage})`}
           >
             { showPercentages && <span className="sub-bar-percentage">{percentage}</span> }
             { Boolean(modal) && <GoLinkExternal onClick={() => { setModalContent(modal); }} /> }
           </div>
         );
      })}

      <Tooltip id={`tooltip-${id}`} className="tooltip" opacity={1} />

      <div ref={myRef} />
      <Modal open={Boolean(modalContent)} onClose={() => { setModalContent(null); }} className="model" center container={myRef.current}>
        <div className="description">
          <Markdown>{modalContent}</Markdown>
        </div>
      </Modal>
    </div>
  );
};

export default function Bar({ id, index, maxWidth, minWidth, maxValue, value, label, caption, className, showPercentages, suffix, useGradient, convertLabelToCounter }) {
  let mainLabel = label;
  let mainCaption = caption;
  let mainValue = parseInt(value, 10);
  
  const [loaded, setLoaded] = useState(false);

  // Contains sub-data
  const regexp = /.*=.*\+.*/;
  let labels = [];
  let captions = [];
  let values = [];
  let subBars = null;
  if (regexp.test(label) && regexp.test(value) && regexp.test(caption)) {
    ({ main: mainLabel, other: labels } = splitData(label));
    ({ main: mainCaption, other: captions } = splitData(caption));
    ({ main: mainValue, other: values } = splitData(value));
    mainValue = parseInt(mainValue.toString(), 10);
    values = values.map(value => parseInt(value.toString(), 10));
    subBars = (<SubBars labels={labels} captions={captions} values={values} maxValue={mainValue} showPercentages={showPercentages} useGradient={useGradient} />);
  }

  if (!maxValue) {
    maxValue = mainValue;
  }
  const width = Math.max(((mainValue * maxWidth) / maxValue), 1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.setTimeout(
        () => {
          const $bar = $(`#${id}`);
          $bar.fadeIn(1000, () => {
            $bar.animate({ width: $bar.attr('data-width') }, 1000, 'swing', () => { $bar.next('span').fadeIn(1000, () => { setLoaded(true); }); })
          });
        },
        1000 + (index * 3000),
      );
    }
  }, []);

  return (
    <div className={`bar ${className || ''}`} key={mainCaption}>
      <div id={id} className="bar-inner" style={{ width: minWidth }} data-width={width}>
        {subBars}
      </div>
      <span className="bar-label"><div className="bar-label-caption">{mainCaption} {suffix}</div> <b>{convertLabelToCounter ? (loaded && <Counter value={mainLabel} />) : mainLabel}</b></span>
    </div>
  );
}
