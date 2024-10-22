import React from 'react';
import Brazil from '@react-map/brazil';
import 'react-toastify/dist/ReactToastify.css';
import { HiCursorClick } from 'react-icons/hi';
import * as d3 from 'd3';
import $ from 'jquery';
import Pulse from './pulse';
import StateBox from './state_box';
import { isEmpty } from './helpers';

export default function Map({ id, data, boxData, clickText, zoom }) {
  const [currentState, setCurrentState] = React.useState(null);

  const statesWithData = data.states.filter(state => state['Dados fornecidos?'] === 'Sim').map(state => state['Estado']);
  const statesWithoutData = data.states.filter(state => (!isEmpty(state['Dados fornecidos?']) && state['Dados fornecidos?'] !== 'Sim'));
  const highlights = data.states.filter(state => !!state['Destaque']);

  const getCenter = (stateName) => {
    const pathSelector = `[id='${stateName}']`;

    // Get the bounding box of the SVG element
    const svg = d3.select(`#${id} svg`);
    const bboxSvg = svg.node().getBBox();

    // Get the bounding box of the path element
    const path = d3.select(`#${id} svg ${pathSelector}`);
    const bboxPath = path.node().getBBox();

    // Set positions
    let x = (bboxPath.x - bboxSvg.x + (bboxPath.width / 2));
    let y = (bboxPath.y - bboxSvg.y + (bboxPath.height / 2));

    // Special adjustments for some states
    if (stateName === 'Piauí') {
      x += 10;
      y += 10;
    }
    if (stateName === 'Santa Catarina') {
      x += 5;
      y -= 5;
    }
    if (stateName === 'Espírito Santo') {
      x += 5;
    }
    if (stateName === 'Rio de Janeiro') {
      x += 5;
      y += 5;
    }

    const isFirefox = (typeof InstallTrigger !== 'undefined');
    let scale = 1;
    if (isFirefox && zoom < 100) {
      scale = zoom / 100;
    }

    return { x: (x / scale), y: (y / scale) };
  };

  const handleUnselect = () => {
    if (currentState) {
      setCurrentState(null);
    }
  };

  const handleSelect = (state) => {
    let wait = 0;
    if (currentState) {
      wait = 500;
    }
    if (statesWithData.includes(state) && state !== currentState) {
      setCurrentState(null);
      setTimeout(() => { setCurrentState(state); }, wait);
    }
  };

  React.useEffect(() => {
    // Add classes to states
    $(`#${id}`).find('svg').attr('viewBox', '0 0 1200 800');
    $(`#${id}`).find('path').addClass('state');
    statesWithData.forEach((state) => {
      $(`#${id}`).find(`[id='${state}']`).addClass('state-with-data');
    });
    statesWithoutData.forEach((state) => {
      const stateName = state['Estado'];
      const path = $(`#${id}`).find(`[id='${stateName}']`);
      path.addClass('state-without-data');
    });

    // Set positions for each highlight
    highlights.forEach((highlight) => {
      const stateName = highlight['Estado'];
      const { x, y } = getCenter(stateName);
      $(`#${id}`).find(`[id='pulse-${stateName}']`).css({ display: 'block', left: `${x}px`, top: `${y}px` });
    });

    // Set positions for each state that didn't provide data
    statesWithoutData.forEach((state) => {
      const stateName = state['Estado'];
      const { x, y } = getCenter(stateName);
      $(`#${id}`).find(`[id='pulse-${stateName}']`).css({ display: 'block', left: `${x}px`, top: `${y}px` });
    });
  }, []);

  return (
    <div id={id} className="map-container" onClick={handleUnselect}>
      <Brazil size={1200} mapColor="#3A366B" strokeColor="#090048" strokeWidth={1.5} hoverColor="#3A366B" onSelect={handleSelect} />
      <div className="map-layer">
        {highlights.map(highlight => (
          <Pulse className="highlight-pulse" id={`pulse-${highlight['Estado']}`} key={`pulse-${highlight['Estado']}`} title={highlight['Destaque']} onClick={() => { handleSelect(highlight['Estado']); }} />
        ))}
        {statesWithoutData.map(state => (
          <Pulse className="no-data-pulse" id={`pulse-${state['Estado']}`} key={`pulse-${state['Estado']}`} title={`**${state['Estado']}**: ${state['Dados fornecidos?']}`} />
        ))}
      </div>
      <StateBox state={currentState} allData={data} data={currentState && boxData[currentState]} show={Boolean(currentState)} key={currentState} onClose={handleUnselect} zoom={zoom} />
      <div className="map-help">{clickText} <div><HiCursorClick /></div></div>
    </div>
  );
}
