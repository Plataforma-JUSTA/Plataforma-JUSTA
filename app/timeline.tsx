import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Markdown from 'react-markdown';
import FadeIn from './fade_in';
import { addDotsToNumber, humanizeNumber } from './helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.defaults.color = '#000';

export default function Timeline({ stateData, extraStateData, showLegend, fontSize, footer }) {
  const [inViewPort, setInViewPort] = React.useState(false);

  const handleEnter = () => {
    setInViewPort(true);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
      delay: 500,
    },
    elements: {
      line: {
        tension: 0.3,
      },
      point: {
        radius: 5,
        hoverRadius: 7,
        backgroundColor: (ctx: any) => ctx.dataset.borderColor,
        borderColor: '#fff',
        borderWidth: 2,
      },
    },
    animations: {
      radius: {
        type: 'number',
        easing: 'linear',
        duration: 1000,
        from: 4,
        to: 7,
        loop: true,
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        align: 'center',
        fullSize: false,
        labels: {
          usePointStyle: true,
          pointStyle: 'line',
          color: '#000000',
          font: {
            size: fontSize,
          },
          padding: 8,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          label: function (context) {
            const dataset = context.dataset.label;
            const year = parseInt(context.label, 10);
            if (isNaN(stateData[dataset][year])) {
              return 'Sem Informação';
            }
            const value = addDotsToNumber(context.parsed.y);
            const tooltipLabel = [];
            tooltipLabel.push(`${dataset}: R$ ${value}`);
            if (dataset === 'Polícias' && false) { // Disabled
              Object.keys(extraStateData).forEach((subDataset) => {
                const subValue = extraStateData[subDataset][year];
                if (subValue) {
                  tooltipLabel.push(`${subDataset}: R$ ${addDotsToNumber(subValue)}`);
                }
              });
            }
            return tooltipLabel;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: fontSize,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          // Show only integers
          callback: function (value, index, ticks) {
            if (Number.isInteger(value)) {
              const intValue = parseInt(value, 10);
              if (index === 0 && ticks.length > 1) {
                const secondTick = ticks[1].value - 1;
                return `R$ 0 - ${humanizeNumber(secondTick)}`;
              }
              return humanizeNumber(value);
            }
            return '';
          },
          font: {
            size: fontSize,
          },
        },
        grid: {
          display: false,
        },
      }
    }
  };

  const colorMapping = {
    'Polícias': '#09004F',
    'Sistema Prisional': '#4D003A',
    'Políticas para Egressos': '#FFF200',
  };

  let labels = null;
  const datasets = [];

  Object.keys(stateData).forEach((dataset) => {
    if (dataset !== 'description') {
      if (!labels) {
        labels = Object.keys(stateData[dataset]);
      }
      datasets.push({
        label: dataset,
        data: labels.map(label => stateData[dataset][label]),
        borderColor: colorMapping[dataset],
        backgroundColor: colorMapping[dataset],
        borderWidth: 4,
        pointBorderWidth: 6,
        tension: 0.3,
      });
    }
  });

  const data = {
    labels,
    datasets,
  };

  return (
    <FadeIn onEnter={handleEnter}>
      <div className="timeline">
        <Line options={options} data={data} redraw />
      </div>
      <div className="timeline-footer">
        <Markdown className="markdown-whitespace">{footer}</Markdown>
      </div>
    </FadeIn>
  );
};
