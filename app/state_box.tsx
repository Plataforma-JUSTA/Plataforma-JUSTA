import * as React from 'react';
import Markdown from 'react-markdown';
import { useSpring, animated } from 'react-spring';
import { HiArrowUturnDown, HiArrowUturnLeft, HiXMark } from 'react-icons/hi2';
import TabChart from './tab_chart';
import Bar from './bar';
import { Barplot } from './bar_plot';
import { ourParseFloat, addDotsToNumber } from './helpers';
import CirclesChart from './circles_chart';
import FadeIn from './fade_in';
import DottedChart from './dotted_chart';
import Timeline from './timeline';
import Actions from './actions';
import StateFunnel from './state_funnel';
import FunnelIcon from './funnel_icon';

export default function StateBox({ show, state, description, allData, data, zoom, onClose }) {
  const [tabIndex, setTabIndex] = React.useState(null);
  const [inViewPort, setInViewPort] = React.useState(false);

  const handleEnter = () => {
    setInViewPort(true);
  };

  const maxBarWidth = 420;

  const props = useSpring({
    left: show ? 185 : 680,
    width: 450,
  });

  if (!state) {
    return null;
  }

  // Data processing
  if (data.police) {
    data.police.firstChart = { ...data.police };
    const policeSecondChartData = [];
    const percentages = [];
    const values = data.police.value.replace(/^[^=]+=/, '').split('+');
    const labels = data.police.label.replace(/^[^=]+=/, '').split('+');
    const total = values.reduce((accumulator, currentValue) => accumulator + parseFloat(currentValue), 0);
    const names = data.police.caption.replace(/^[^=]+=/, '').split('+');

    values.forEach((value, i) => {
      let percentage = (parseFloat(value) / total * 100).toFixed(1);

      // Look for percentage in the data table, for consistency
      const stateInTable = allData.table.rows.find(row => row['Estado'].toLowerCase() === state.toLowerCase());
      if (stateInTable) {
        Object.keys(stateInTable).forEach((key) => {
          const currentName = names[i] || '';
          if (key.toLowerCase().trim().match(currentName.toLowerCase().trim()) && /%/.test(stateInTable[key])) {
            percentage = stateInTable[key].match(/ \(([^%]+)%\)/)[1];
          }
        });
      }
      percentages[i] = percentage;
      policeSecondChartData.push({ name: `${names[i]} (${percentage}%)`, value: (parseFloat(value) / 1000.0), tooltip: labels[i] });
    });

    data.police.firstChart.percentages = percentages;
    data.police.secondChart = {
      title: 'Orçamento das polícias (bilhões de reais)',
      data: policeSecondChartData,
    };
  }

  return (
    <animated.div style={props} id="state-box" onClick={(e) => { e.stopPropagation(); }}>

      {/* State name and description */}
      <h2>{state} <span className="state-box-close" title="Fechar" onClick={onClose}><HiXMark /></span></h2>
      <div className="description"><Markdown>{data.description}</Markdown></div>

      {/* Tabs, which are also a chart */}
      { data.tabsChart && (
        <>
          <h3>
            <span className="tab-title">
              {data.tabsChart.title.replace(/ \(.*\)$/, '')}
              { data.funnel.available ?
                <span id="state-funnel-icon" title="Clique para ver o funil do orçamento deste estado">
                  <FunnelIcon
                    animated={tabIndex !== 3}
                    onClick={(e) => {
                      if (tabIndex === 3) {
                        setTabIndex(null);
                      } else {
                        setTabIndex(3);
                      }
                      e.stopPropagation();
                    }}
                  />
                </span>
                : null
              }
            </span>
            <span className="tab-disclaimer">
              { tabIndex === null ?
                <span><HiArrowUturnDown className="animate-jump" /> <span style={{ cursor: 'help' }} title="Clique nos gráficos abaixo para ver mais detalhes sobre os dados sobre 'Polícias', 'Sistema Prisional' e 'Políticas exclusivas para Egressos'.">explore os dados</span></span> :
                <span className="tab-disclaimer-clickable" onClick={(e) => { setTabIndex(null); e.stopPropagation(); }}><HiArrowUturnLeft /> <span>voltar para visão geral</span></span>
              }
            </span>
          </h3>
          <div id="tab-charts">
            {data.tabsChart.tabs.map((tab, i) => (
              <div
                key={tab.label}
                onClick={(e) => {
                  if (tabIndex === i) {
                    setTabIndex(null);
                  } else {
                    setTabIndex(i);
                  }
                  e.stopPropagation();
                }}
              >
                <TabChart
                  title={data.tabsChart.title}
                  label={tab.label}
                  originalValue={parseFloat(tab.value.toString().replace(',', '.'))}
                  value={ourParseFloat(tab.value)}
                  zero={/\([^)]+\)/.test(tab.value) ? tab.value.match(/\(([^)]+)\)/)[1] : 'Zero'}
                  maxValue={Math.max(...data.tabsChart.tabs.map(t => ourParseFloat(t.value)))}
                  selected={i === tabIndex}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <hr />
      
      {/* Charts displayed when no tab is clicked */}
      <div id="state-box-none" className={`state-box-content ${tabIndex === null ? 'selected' : ''}`}>
        { data.general.firstChart.values[0].value ?
          <>
            <div className="description">
              {data.texts.home ? <Markdown>{data.texts.home}</Markdown> : <>Para cada <b>R$ {addDotsToNumber(data.general.firstChart.values[0].value)}</b> gastos com <b>polícias</b> e cada <b>R$ {addDotsToNumber(data.general.firstChart.values[1].value)}</b> gastos com o sistema <b>penitenciário</b>, <b>R$ {addDotsToNumber(data.general.firstChart.values[2].value)}</b> foi destinado a ações voltadas para <b>egressos e pessoas privadas de liberdade</b>.</>}
            </div>
            <div className="circles-chart">
              <CirclesChart values={data.general.firstChart.values} />
            </div>
          </> :
          <div className="description">{data.texts.home ? <Markdown>{data.texts.home}</Markdown> : <>Não verificamos quaisquer programas ou ações de governo voltados exclusivamente para a população egressa do sistema prisional, não sendo possível realizar a análise de proporcionalidade com outros gastos.</>}</div>
        }
        <hr />
        <div className="description smaller-description">
          Comparação entre gastos com funções de inegável importância no orçamento público em relação ao valor destinado à manutenção do sistema prisional.
        </div>
        <div>
          <Bar
            id={`${state.toLowerCase().replaceAll(' ', '-')}-general-first-chart`}
            className="state-box-bar split-chart state-box-bar-1"
            index={0}
            maxWidth={parseInt(data.general.secondChart.value.match(/^([0-9]+)=/)[1], 10) * maxBarWidth / parseInt(data.general.thirdChart.value, 10)}
            minWidth={20}
            maxValue={null}
            value={data.general.secondChart.value}
            label={data.general.secondChart.label}
            caption={data.general.secondChart.caption}
            useGradient
          />
        </div>
        <div>
          <Bar
            id={`${state.toLowerCase().replaceAll(' ', '-')}-general-second-chart`}
            className="state-box-bar full-chart state-box-bar-2"
            index={0}
            maxWidth={maxBarWidth}
            minWidth={20}
            maxValue={parseInt(data.general.thirdChart.value, 10)}
            value={parseInt(data.general.thirdChart.value, 10)}
            label={data.general.thirdChart.label}
            caption={data.general.thirdChart.caption}
          />
          <h4><b>{data.general.thirdChart.label}:</b> {data.general.thirdChart.caption}</h4>
        </div>
        { data.police.firstChart?.caption && (
          <>
            <hr />
            <div className="description smaller-description">
              Comparação entre gastos com funções de inegável importância no orçamento público em relação ao valor destinado às polícias.
            </div>
            <div>
              <Bar
                id={`${state.toLowerCase().replaceAll(' ', '-')}-general-third-chart`}
                className="state-box-bar split-chart state-box-bar-3"
                index={0}
                maxWidth={parseInt(data.general.fourthChart.value.match(/^([0-9]+)=/)[1], 10) * maxBarWidth / parseInt(data.police.firstChart.value.replace(/=.*$/, ''), 10)}
                minWidth={20}
                maxValue={null}
                value={data.general.fourthChart.value}
                label={data.general.fourthChart.label}
                caption={data.general.fourthChart.caption}
                useGradient
              />
            </div>
            <div>
              { /=/.test(data.police.firstChart.label) ?
                <Bar
                  id={`${state.toLowerCase().replaceAll(' ', '-')}-general-fourth-chart`}
                  className="state-box-bar split-chart state-box-bar-4"
                  index={0}
                  maxWidth={maxBarWidth}
                  minWidth={20}
                  maxValue={null}
                  value={data.police.firstChart.value}
                  label={data.police.firstChart.label}
                  caption={data.police.firstChart.caption}
                  useGradient
                /> :
                <Bar
                  id={`${state.toLowerCase().replaceAll(' ', '-')}-general-fourth-chart`}
                  className="state-box-bar full-chart state-box-bar-4"
                  index={0}
                  maxWidth={maxBarWidth}
                  minWidth={20}
                  value={parseInt(data.police.firstChart.value, 10)}
                  maxValue={parseInt(data.police.firstChart.value, 10)}
                  label={data.police.firstChart.label}
                  caption={data.police.firstChart.caption}
                />
              }
              <h4><b>{data.police.firstChart.label.replace(/=.*$/, '')}</b>: {data.police.firstChart.title}</h4>
            </div>
          </>
        )}

        {/* Timeline */}
        <hr />
        <div className="description smaller-description">
          <Markdown>{allData.timeline[state].description || 'Evolução dos gastos com polícias, sistema prisional e políticas para egressos.'}</Markdown>
        </div>       
        <Timeline stateData={allData.timeline[state]} extraStateData={allData.timelineExtra[state]} showLegend={false} fontSize={12} footer={allData.timeline.footer} />
      </div>

      {/* Charts displayed when the first tab is clicked (Police) */}
      <div id="state-box-0" className={`state-box-content ${tabIndex === 0 ? 'selected' : ''}`}>
        { data.police.firstChart && (tabIndex === 0) && (!data.police.firstChart.caption) && (
          <FadeIn onEnter={handleEnter}>
            <h3>{data.police.firstChart.title}</h3>
            <div classname="description">Dados não disponíveis.</div>
          </FadeIn>
        )}
        { data.police.firstChart && (tabIndex === 0) && (data.police.firstChart.caption) && (
          <>
            <h3>{data.police.firstChart.title}</h3>
            <div>
              <Bar
                id={`${state.toLowerCase().replaceAll(' ', '-')}-police-first-chart`}
                className="state-box-bar split-chart"
                index={0}
                maxWidth={418}
                minWidth={20}
                maxValue={null}
                value={data.police.firstChart.value}
                label={data.police.firstChart.label}
                caption={data.police.firstChart.caption}
                percentages={data.police.firstChart.percentages}
                useGradient
              />
            </div>
            <FadeIn onEnter={handleEnter}>
              { inViewPort && (
                <>
                  <div id="police-second-chart">
                    <Barplot
                      key={state}
                      width={400}
                      height={50 * data.police.secondChart.data.length}
                      data={data.police.secondChart.data}
                      dataPoint={data.police.secondChart.title}
                      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                      zoom={zoom}
                      disableSpring
                    />
                  </div>
                  <div className="description"><Markdown>{data.police.description}</Markdown></div>
                </>
              )}
            </FadeIn>
          </>
        )}
      </div>

      {/* Charts displayed when the second tab is clicked (Prision) */}
      <div id="state-box-1" className={`state-box-content ${tabIndex === 1 ? 'selected' : ''}`}>
        { tabIndex === 1 && (
          <>
            <div className="description">
              { data.texts.prisionBefore ? <Markdown>{data.texts.prisionBefore}</Markdown> : (<>
                  <p>Do orçamento total do estado,
                  <b> {data.prision.data.find(x => x.label === 'Sistema Prisional (%)').value.toString().replace(/[0]+$/, '').replace('.', ',').replace(/$/, '%')} </b>
                  dos recursos foram destinados para o sistema prisional.</p>
                </>) }
            </div>
            { data.prision.data.map((dataPoint) => {
              if (isNaN(dataPoint.value)) {
                return null;
              }
              const percentage = dataPoint.value == 0 ? 'ZERO' : dataPoint.value.toString().replace(/[0]+$/, '0').replace('.', ',').replace(/$/, '%');
              return (
                <DottedChart
                  key={dataPoint.label}
                  max={100}
                  selected={Math.round(dataPoint.value)}
                  title={dataPoint.label === 'Sistema Prisional (%)' ? (<span><b>{dataPoint.label}</b> (<b>{percentage}</b>)</span>) : (<span>{dataPoint.label} (<b>{percentage}</b>)</span>)}
                />
              );
            })}
            <div className="description">
              { data.texts.prisionAfter && <Markdown>{data.texts.prisionAfter}</Markdown> }
            </div>
          </>
        )}
      </div>

      {/* Content displayed when the third tab is clicked (Actions) */}
      <div id="state-box-2" className={`state-box-content ${tabIndex === 2 ? 'selected' : ''}`}>
        { tabIndex === 2 && (
          <>
            <h3>{data.actions.title}</h3>
            <div className="description"><Markdown>{data.actions.description}</Markdown></div>
            <Actions titles={data.actions.titles} descriptions={data.actions.descriptions} />
          </>
        )}
      </div>

      {/* Content displayed when the funnel icon is clicked */}
      <div id="state-box-3" className={`state-box-content ${tabIndex === 3 ? 'selected' : ''}`}>
        { tabIndex === 3 && (
          <StateFunnel data={data.funnel} />
        )}
      </div>
    </animated.div>
  );
};
