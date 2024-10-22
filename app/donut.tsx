import { useMemo } from 'react';
import * as d3 from 'd3';
import { animated, SpringValue, useSpring } from 'react-spring';

type DataItem = {
  value: number;
  color: string;
};

export default function Donut({ width, height, radius, data }) {
  // Sort by alphabetical to maximise consistency between dataset
  const sortedData = data.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const pie = useMemo(() => {
    const pieGenerator = d3
      .pie<any, DataItem>()
      .value((d) => d.value || 1)
      .sort(null); // Do not apply any sorting, respect the order of the provided dataset
    return pieGenerator(sortedData);
  }, [data]);

  const allPaths = pie.map((slice, i) => {
    return (
      <Slice
        key={i}
        radius={radius}
        slice={slice}
        color={slice.data.color}
      />
    );
  });

  return (
    <svg width={width} height={height} style={{ display: 'inline-block' }}>
      <g transform={`translate(${width / 2}, ${height / 2})`}>{allPaths}</g>
    </svg>
  );
};

type SliceProps = {
  color: string;
  radius: number;
  slice: d3.PieArcDatum<DataItem>;
};
const Slice = ({ slice, radius, color }: SliceProps) => {
  const arcPathGenerator = d3.arc();

  const springProps = useSpring({
    from: {
      pos: [0, 0],
    },
    to: {
      pos: [slice.startAngle, slice.endAngle] as [number, number],
    },
  });
  return (
    <animated.path
      d={springProps.pos.to((start, end) => {
        return arcPathGenerator({
          innerRadius: 24,
          outerRadius: radius,
          startAngle: start,
          endAngle: end,
        });
      })}
      fill={color}
    />
  );
};
