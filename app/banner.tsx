import { useEffect, useState, useRef } from 'react';
import { GoLinkExternal } from 'react-icons/go';
import 'react-responsive-modal/styles.css';
import Markdown from 'react-markdown';
import { Modal } from 'react-responsive-modal';
import FadeIn from './fade_in';
import $ from 'jquery';
import Bar from './bar';
import Donut from './donut';
import Counter from './counter';
import MiniMap from './mini_map';

const Banner = ({ title, description, link, funnel, tables, states, isMobile }) => {
  const [modalOpened, setModalOpened] = useState(false);
  const [inViewPort, setInViewPort] = useState(false);

  const colors = [
    '#090446', // Dark blue
    '#FFF200', // Yellow
  ];

  useEffect(() => {
    setTimeout(
      () => {
        $('.donut-label').fadeTo(2000, 1);
      },
      1000,
    );
  }, []);

  const handleOpenTable = (column) => {
    setModalOpened(column - 1);
  };

  const handleEnter = () => {
    setInViewPort(true);
  };

  const myRef1 = useRef(null);

  return (
    <div className="banner">
      <h1>{title}</h1>
      <div className="banner-content">
        <div className="left">
          <Markdown>{description}</Markdown>
          { !isMobile && (
            <div id="download-summary-container">
              <a id="download-summary" href={link} target="_blank" rel="noopener noreferrer" download>
                <div id="download-summary-text">Baixe o sumário executivo</div>
              </a>
            </div>
          )}
        </div>
        <div className="center">
          <div id="donut" className="donut-wrapper">
            <div id="donut-labels">
              <div className="donut-label" style={{ color: colors[1] }}>
                <span>{funnel[1].caption}</span>
                <b><Counter value={funnel[1].label} /></b>
              </div>
            </div>
          </div>
          <div id="bars">
            { funnel.map((dataPoint, index) => {
              const commonProps = {
                index: (index - 2),
                id: `data${index}`,
                label: dataPoint.label,
                convertLabelToCounter: true,
                suffix: <GoLinkExternal onClick={() => { handleOpenTable(index); }} />,
                caption: dataPoint.caption,
                value: dataPoint.value,
                minWidth: 80,
                maxWidth: 470,
                useGradient: true,
              };
              if (index > 1) {
                return (
                  <div key={index} id={`banner-bar-${index - 1}`}>
                    <Bar maxValue={parseInt(funnel[2].value, 10)} className="banner-small-bar" {...commonProps} />
                  </div>
                );
              }
            })}
          </div>
          <div id="mini-map-container" className="hide-on-mobile">
            <MiniMap states={states} />
          </div>
        </div>
        <div ref={myRef1} />
        <Modal open={Boolean(modalOpened)} onClose={() => { setModalOpened(null); }} className="model" center container={myRef1.current}>
          <h2 className="title">{ modalOpened ? tables.titles[modalOpened - 1] : null }</h2>
          <div className="description"><Markdown>{ modalOpened ? tables.descriptions[modalOpened - 1] : null }</Markdown></div>
          <table>
            <thead>
              <tr>
                {tables.columns.map((column, i) => (<td key={column} className={i === modalOpened ? 'selected' : ''}>{column}</td>))}
              </tr>
            </thead>
            <tbody>
            {tables.rows.map(row => (
              <tr key={row['Estado']}>
                {tables.columns.map((column, i) => {
                  let cellContent = row[column];
                  const cellContentRegexp = new RegExp(/^([^(]+)(\([^)]+\))$/);
                  if (cellContentRegexp.test(cellContent)) {
                    const cellContentMatches = cellContent.match(cellContentRegexp);
                    cellContent = (<span className="divided-cell"><span>{cellContentMatches[1]}</span> <span>{cellContentMatches[2]}</span></span>);
                  }
                  return (
                    <td key={column} className={i === modalOpened ? 'selected' : ''}>{cellContent}</td>
                  );
                })}
              </tr>
            ))}
            </tbody>
          </table>
        </Modal>
        { isMobile && (
          <div id="download-summary-container">
            <a id="download-summary" href={link} target="_blank" rel="noopener noreferrer" download>
              <div id="download-summary-text">Baixe o sumário executivo</div>
            </a>
          </div>
        )}
        {/* <div className="right"></div> */}
      </div>
    </div>
  );
};

export default Banner;
