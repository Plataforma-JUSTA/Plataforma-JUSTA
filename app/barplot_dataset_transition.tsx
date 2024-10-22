import { useState, useEffect } from 'react';
import { HiCursorClick } from 'react-icons/hi';
import { Barplot } from './bar_plot';

const BUTTONS_HEIGHT = 50;

const getBackgroundImageFromDatapoint = (dataPoint) => {
  let backgroundImage = null;
  if (/Orçamento/.test(dataPoint)) {
    backgroundImage = 'money';
  }
  else if (/Polícias/.test(dataPoint)) {
    backgroundImage = 'police';
  }
  else if (/Penitenciário/.test(dataPoint)) {
    backgroundImage = 'jail';
  }
  else if (/Egressos/.test(dataPoint)) {
    backgroundImage = 'handcuff';
  }
  else {
    return 'none';
  }
  return `url('/${backgroundImage}.svg')`;
};

export const BarplotDatasetTransition = ({
  width,
  data,
  dataPoints,
  dataPointsExplanations,
  zoom,
  visible,
}) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState(dataPoints[0]);
  const backgroundImage = getBackgroundImageFromDatapoint(selectedDataPoint);

  const selectedData = [];
  const sortedData = data.slice();
  sortedData.sort((a, b) => {
    const keyA = parseFloat(a[selectedDataPoint]);
    const keyB = parseFloat(b[selectedDataPoint]);
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
  sortedData.forEach((row) => {
    const value = row[selectedDataPoint] ? parseFloat(row[selectedDataPoint].replace(',', '.')) : null;
    selectedData.push({ name: row['Estado'], value });
  });

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        if (selectedDataPoint === dataPoints[0]) {
          setSelectedDataPoint(dataPoints[1]);
        } else {
          setSelectedDataPoint(dataPoints[0]);
        }
      }, 1500)
    }
  }, [visible]);

  const height = 800;

  const handleSelectDataPoint = (e) => {
    setSelectedDataPoint(e.target.value);
  };

  const explanation = dataPointsExplanations[dataPoints.indexOf(selectedDataPoint)];

  return (
    <div className="states-chart-barplot" style={{ backgroundImage }}>
      <div style={{ height: BUTTONS_HEIGHT }} className="states-chart-drop-down-container">
        <select onChange={handleSelectDataPoint} className="drop-down" value={selectedDataPoint}>
          { dataPoints.map((dataPoint) => (
            <option value={dataPoint} key={dataPoint}>
              {dataPoint}
            </option>
          ))}
        </select>

        <HiCursorClick />
      </div>

      <Barplot
        width={width}
        height={height - BUTTONS_HEIGHT}
        data={selectedData}
        dataPoint={selectedDataPoint}
        zoom={zoom}
      />

      { explanation && <div className="map-explanation hide-on-mobile">{explanation}</div> }
    </div>
  );
};

