import React from 'react';
import FadeIn from './fade_in';
import Collapsible from './collapsible';

export default function Actions({ titles, descriptions }) {
  const [inViewPort, setInViewPort] = React.useState(false);
  const [expanded, setExpanded] = React.useState(null);

  const handleEnter = () => {
    setInViewPort(true);
  };

  const actions = [...titles].map((title, i) => ({ title, description: (descriptions[i] || '(sem descrição)') }));

  return (
    <div className="actions">
      <FadeIn onEnter={handleEnter}>
        { actions.map((action, i) => (
          <div className="action" key={i}>
            <Collapsible
              title={action.title}
              description={action.description}
              expanded={expanded === (i + 1)}
              expand={(shouldExpand) => {
                if (shouldExpand) {
                  setExpanded(i + 1);
                } else {
                  setExpanded(null);
                }
              }}
            />
          </div>
        ))}
      </FadeIn>
    </div>
  );
};
