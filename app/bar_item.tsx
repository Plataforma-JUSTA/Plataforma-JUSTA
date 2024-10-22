import { createRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Tooltip } from 'react-svg-tooltip';
import NumberToWords from './number_to_words';
import RectangleWithText from './rectangle_with_text';

type BarItemProps = {
  name: string;
  value: number;
  barHeight: number;
  barWidth: number;
  disableSpring: boolean;
  x: number;
  y: number;
  tooltip: string;
  zoom: number;
};

type AnimatedProps = {
  barWidth: number;
  value: number;
  valueOpacity: number;
  opacity: number,
  y: number;
};

export const BarItem = (props: BarItemProps) => {
  const { name, value, barHeight, barWidth, x, y, label, disableSpring, tooltip, zoom } = props;

  const minWidth = 5;

  const springProps = useSpring<AnimatedProps>({
    // the 'from' properties will be used only to animate the initialization of the component
    // if you put nothing it will be initialized with the first prop that is provided
    from: {
      value: 0,
      barWidth: 0,
      textPosition: 0,
      valueOpacity: 0,
      opacity: 0,
    },
    to: {
      value: value || 0,
      barWidth: barWidth > minWidth ? barWidth : minWidth,
      valueOpacity: (value > 0 ? 1 : 0),
      opacity: (value ? 1 : 0),
      textPosition: Math.max(barWidth, minWidth),
      y,
    },
    config: {
      friction: 50,
    },
  });

  const ref = createRef<SVGGElement>();

  let scale = label.match(/(%)/);
  scale = scale ? ` ${scale[0]}` : '';

  if (value === null) {
    return null;
  }

  const isFirefox = (typeof InstallTrigger !== 'undefined');
  let f = 1; // Factor
  if (isFirefox) {
    f = (zoom / 100);
  }

  return (
    <>
      <g ref={ref}>
        <animated.rect
          x={x}
          y={springProps.y}
          width={disableSpring ? (barWidth > minWidth ? barWidth : minWidth) : springProps.barWidth}
          height={barHeight}
          className="states-chart-horizontal-bar"
          rx={4}
        />
        <animated.text
          x={x * f}
          y={springProps.y?.to((y) => ((y - 12) * f))}
          textAnchor="start"
          dominantBaseline="central"
          className="states-chart-label"
        >
          {name}
        </animated.text>
        <animated.text
          x={springProps.textPosition.to((pos) => ((pos + 8) * f))}
          y={springProps.y?.to((y) => ((y + barHeight / 2) * f))}
          textAnchor="start"
          dominantBaseline="central"
          opacity={springProps.valueOpacity}
          className="states-chart-label"
        >
          {springProps.value?.to((value) => `${scale !== ' %' ? 'R$ ' : ''}${parseFloat(value.toFixed(3))}${scale}`)}
        </animated.text>
      </g>
      { value && scale !== ' %' &&
        <Tooltip triggerRef={ref}>
          <RectangleWithText text={tooltip || <NumberToWords number={value.toFixed(3)} label={label} />} />
        </Tooltip>
      }
    </>
  );
};
