import { useState } from 'react';
import { Waypoint } from 'react-waypoint';
import { useSpring, animated } from 'react-spring';

const FadeIn = ({ children, onEnter }) => {
  const [inView, setInView] = useState(false);

  const handleEnter = () => {
    setInView(true);
    onEnter();
  };

  const transition = useSpring({
    delay: 500,
    to: {
      y: !inView ? 24 : 0,
      opacity: !inView ? 0 : 1,
    },
  });
  return (
    <Waypoint onEnter={handleEnter}>
      <animated.div style={transition}>
        {children}
      </animated.div>
    </Waypoint>
  );
};

export default FadeIn;
