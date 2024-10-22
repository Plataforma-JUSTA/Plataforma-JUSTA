import React, { useRef, useState } from 'react';
import { BarplotDatasetTransition } from './barplot_dataset_transition';

export default function StatesChart({ data, dataPoints, dataPointsExplanations, zoom }) {
  return (
    <section id="states-chart">
      <BarplotDatasetTransition width={450} data={data} dataPoints={dataPoints} dataPointsExplanations={dataPointsExplanations} zoom={zoom} visible />
    </section>
  );
};
