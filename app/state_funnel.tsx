import React from 'react';
import Image from 'next/image';
import FadeIn from './fade_in';

export default function StateFunnel({ data }) {
  const [inViewPort, setInViewPort] = React.useState(false);

  const handleEnter = () => {
    setInViewPort(true);
  };

  return (
    <div id="state-funnel">
      <FadeIn onEnter={handleEnter}>
        <div className="description">
          O <b>funil de investimentos</b> ilustra bem as atuais prioridades político orçamentárias do estado.
        </div>
        <div id="state-funnel-content">
          <Image
            src="/state-funnel.svg"
            alt="Funil"
            height={250}
            width={250}
            priority
          />
          <div>
            {data.data.map((row) => (
              <div key={row.label}>
                <div>{row.label}</div>
                <div><b>{row.value}</b></div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
};
