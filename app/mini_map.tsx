import React from 'react';
import Brazil from '@react-map/brazil';
import $ from 'jquery';

export default function MiniMap({ states }) {
  const fillColor = '#090446'; // --justaDarkBlue
  const borderColor = '#2E2A62'; // --justaMediumBlue

  const statesWithData = states.filter(state => state['Dados fornecidos?'] === 'Sim').map(state => state['Estado']);

  const handleClick = () => {
    $([document.documentElement, document.body]).animate({
      scrollTop: $('#first-section').offset().top
    }, 2000);
  };

  React.useEffect(() => {
    // Add classes to states
    $('#mini-map').find('path').addClass('state');
    statesWithData.forEach((state) => {
      $('#mini-map').find(`[id='${state}']`).addClass('state-with-data');
    });
  }, []);

  return (
    <div id="mini-map" onClick={handleClick}>
      <h3>UFs analisadas</h3>
      <Brazil size={350} mapColor={fillColor} strokeColor={borderColor} strokeWidth={1.5} hoverColor={fillColor} onSelect={() => {}} />
    </div>
  );
};
