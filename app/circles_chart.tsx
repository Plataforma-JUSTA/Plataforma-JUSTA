import { useEffect, useRef } from 'react';
import $ from 'jquery';
import * as d3 from 'd3';
import { select } from 'd3-selection';

export default function CirclesChart({ values }) { // Values is a list of objects with numeric value and a label
  const svgRef = useRef(null);

  const drawCircle = (size, x, y, label) => {
    const svg = select(svgRef.current);
    const circle = svg.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', size)
      .attr('class', 'circle');
      /*
      .attr('stroke', color)
      .attr('stroke-opacity', '0.2')
      .attr('stroke-width', 10);
      */

    const startRadius = 1;
    const endRadius = size;
    const duration = 1000;

    // Animate the circle radius
    circle.transition()
      .duration(duration)
      .attrTween('r', (d, i, a) => {
        return d3.interpolateNumber(startRadius, endRadius);
      })
      .on('end', () => {
        $(label).fadeTo(1000, 1);
      });
  };

  useEffect(() => {
    const maxRadius = 48;
    const maxValue = Math.max(...values.slice().map(x => x.value));
    values.forEach((value, i) => {
      setTimeout(() => {
        const radius = Math.sqrt((value.value * maxRadius * maxRadius) / maxValue);
        drawCircle(Math.max(radius, 1), 70 * ((i * 2) + 1), maxRadius, `#label${i + 1}`);
      }, i * 1000);
    });
  }, []);

  return (
    <div id="big-circles">
      <svg ref={svgRef} width="420" height="100"></svg>
      <div className="labels">
        { values.map((object, i) => (
          <div key={i} id={`label${i + 1}`} className={`label ${i === 0 ? 'first' : ''} ${i === values.length ? 'last' : ''}`}><strong>R$ {object.value}</strong><small>{object.label}</small></div>
        ))}
      </div>
    </div>
  );
}
