import { useMemo } from 'react';
import * as d3 from 'd3';
import { BarItem } from './bar_item';

const BAR_PADDING = 0.5;

type BarplotProps = {
  width: number;
  height: number;
  data: { name: string; value: number }[];
  margin: { top: number; right: number; bottom: number; left: number; };
  zoom: number;
};

export const Barplot = ({ width, height, data, dataPoint, disableSpring, margin, zoom }: BarplotProps) => {

  if (!margin) {
    margin = { top: 16, right: 0, bottom: 0, left: 16 };
  }

  // bounds = area inside the graph axis = calculated by substracting the margins
  const boundsWidth = width - margin.right - margin.left - 50;
  const boundsHeight = height - margin.top - margin.bottom;

  // Y axis is for groups since the barplot is horizontal
  const groups = data.slice().filter(x => x.value !== null && !/Despesas Compartilhadas/.test(x.name) ).sort((a, b) => b.value - a.value).map((d) => d.name);
  const shared = data.find(x => /Despesas Compartilhadas/.test(x.name));
  if (shared) {
    groups.push(shared.name);
  }

  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(groups)
      .range([0, boundsHeight])
      .padding(BAR_PADDING);
  }, [data, height, groups]);

  // X axis
  const max = d3.max(data.map((d) => d.value));
  const xScale = d3.scaleLinear().domain([0, max]).range([0, boundsWidth]);

  // Build the shapes
  const allShapes = data.map((d) => {
    return (
      <BarItem
        key={d.name}
        name={d.name}
        value={d.value}
        tooltip={d.tooltip}
        label={dataPoint}
        barHeight={10}
        barWidth={xScale(d.value)}
        x={xScale(0)}
        y={yScale(d.name)}
        disableSpring={disableSpring}
        zoom={zoom}
      />
    );
  });

  return (
    <div>
      <svg width={width * 2} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[margin.left, margin.top].join(",")})`}
        >
          {allShapes}
        </g>
      </svg>
    </div>
  );
};
