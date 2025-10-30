'use client'
import React from 'react';
import Markdown from 'react-markdown';
import { RiYoutubeLine, RiInstagramLine, RiFacebookLine } from 'react-icons/ri';
import { BsSearch, BsPercent } from 'react-icons/bs';
import { MdOutlineSlowMotionVideo } from 'react-icons/md';
import { GoLinkExternal } from 'react-icons/go';
import { useSearchParams } from 'next/navigation';
import { Modal } from 'react-responsive-modal';
import Header from './header';
import Banner from './banner';
import Tabs from './tabs';
import StatesChart from './states_chart';
import Map from './map';
import InPractice from './in_practice';
import Timeline from './timeline';
import { ourParseFloat, parseImageUrlsInText } from './helpers';

const useCache = false;

export default function Home() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');

    const handleMediaQueryChange = (e) => {
      setIsMobile(e.matches);
    };

    // Check the current state of the query and browser
    setIsMobile(mediaQuery.matches);
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
      setIsIOS(true);
      document.documentElement.style.setProperty('--fontSizeSmaller', '10px');
      document.documentElement.style.setProperty('--fontSizeSmall', '10px');
      document.documentElement.style.setProperty('--fontSizeMedium', '10px');
      document.documentElement.style.setProperty('--fontSizeLarge', '11px');
      document.documentElement.style.setProperty('--fontSizeLargeMedium', '13px');
      document.documentElement.style.setProperty('--fontSizeMediumLarge', '17px');
      document.documentElement.style.setProperty('--fontSizeLarger', '19px');
      document.documentElement.style.setProperty('--fontSizeTitle', '20px');
      document.documentElement.style.setProperty('--fontSizeHuge', '28px');
    }

    // Listen for changes to the query state
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, []);

  const [mapTab, setMapTab] = React.useState('map'); // or 'chart'

  /* Set application screen scale dynamically */

  const [zoom, setZoom] = React.useState(100);

  React.useEffect(() => {
    const updateScale = () => {
      const appWidth = 640; // App's ideal width
      const screenWidth = window.innerWidth;
      const newScale = screenWidth / appWidth; // Calculate the scale based on screen width
      if (newScale < 1) {
        setZoom(newScale.toFixed(2) * 100);
      }
    };

    updateScale();

    // Update scale on initial load and window resize
    window.addEventListener('resize', updateScale);

    // Clean up event listener on component unmount
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const dataTemplate = {
    loaded: false,
    summary: {
      title: null,
      description: null,
      link: null,
      connector: null,
      column1: null,
      column2: null,
    },
    funnel: [], // { label, caption, value }
    states: [],
    stateDataPoints: [],
    stateDataPointsExplanations: [],
  };

  const [tab, setTab] = React.useState('funnel'); // or 'budget'
  const [years, setYears] = React.useState([]);
  const [currentYear, setCurrentYear] = React.useState(null);
  const [dataset, setDataset] = React.useState({});
  const [credits, setCredits] = React.useState(null);
  const [videoText, setVideoText] = React.useState(null);
  const [clickText, setClickText] = React.useState(null);
  const [modalOpened, setModalOpened] = React.useState(null); // 'video' or 'two-columns'

  const year = currentYear || years[0];

  const updateDataForYear = (y, newData) => {
    const updatedData = { ...dataset, [y]: newData };
    localStorage.setItem('justaData', JSON.stringify(updatedData));
    // Uncomment to debug
    // console.log('data', updatedData);
    setDataset(updatedData);
  };

  const loadDataForYear = (y, gapiClient) => {
    gapiClient.load('sheets', 'v4', () => {
      gapiClient.sheets.spreadsheets.values
        .batchGet({
          spreadsheetId: '1AIWdzmYw5IlHRB0imVkqYSnrE5-GW-Y5Qz-_XXAzenY',
          ranges: [`(${y}) Dados Gerais!A2:H2`, `(${y}) Dados Gerais!A6:C`, `(${y}) Estados (barra lateral)!A1:Z`, `(${y}) Estados (detalhes)!A1:AJ`, `(${y}) Tabelas!A1:D`, `(${y}) Dados Gerais!E4:I7`, `(${y}) Tabelas!H1:L`, 'Linha do Tempo', 'Linha do Tempo (extra)'],
        })
        .then(
          response => {
            const newData = { ...dataTemplate, loaded: true };
  
            // Title, description, link and texts
            response.result.valueRanges[0].values.forEach(row => {
              newData.summary = {
                title: row[0],
                description: row[1],
                link: row[2],
                connector: row[4],
                conclusion: row[5],
                column1: row[6],
                column2: row[7],
              };
            });
  
            // Big numbers for the funnel
            newData.funnel = [];
            response.result.valueRanges[1].values.forEach(row => {
              newData.funnel.push({
                caption: row[0],
                label: row[1],
                value: row[2],
              });
            });
  
            // States (for national data)
            newData.states = [];
            let statesAttributes = [];
            response.result.valueRanges[2].values.forEach((row, i) => {
              // The first row is the header
              if (i === 0) {
                statesAttributes = row.slice();
                newData.stateDataPoints = statesAttributes.slice(4);
              // The second row is the explanations
              } else if (i === 1) {
                newData.stateDataPointsExplanations = row.slice(4);
              } else {
                const state = {};
                row.forEach((value, j) => {
                  if (statesAttributes[j]) {
                    state[statesAttributes[j]] = value;
                  }
                });
                newData.states.push(state);
              }
            });
  
            // Selected State (for selected state data in the box)
            newData.statesForBox = {};
            let statesForBoxHeaders = [];
            let statesForBoxSubHeaders = [];
            response.result.valueRanges[3].values.forEach((row, i) => {
              if (i === 0) {
                statesForBoxHeaders = [row[3], row[6], row[10], row[13], row[16], row[19], row[24], row[27], row[33]];
  
              } else if (i == 1) {
                statesForBoxSubHeaders = row.slice();
  
              // The first two lines form the header
              } else {
  
                newData.statesForBox[row[0]] = {
                  description: row[2],
                  tabsChart: {
                    title: statesForBoxHeaders[0],
                    tabs: [
                      { label: statesForBoxSubHeaders[3], value: row[3] },
                      { label: statesForBoxSubHeaders[4], value: row[4] },
                      { label: statesForBoxSubHeaders[5], value: row[5] },
                    ],
                  },
                  general: {
                    firstChart: {
                      title: statesForBoxHeaders[2],
                      values: [
                        { label: statesForBoxSubHeaders[10], value: parseInt(row[10], 10) },
                        { label: statesForBoxSubHeaders[11], value: parseInt(row[11], 10) },
                        { label: statesForBoxSubHeaders[12], value: parseInt(row[12], 10) },
                      ],
                    },
                    secondChart: {
                      title: statesForBoxHeaders[3],
                      caption: row[13],
                      label: row[14],
                      value: row[15],
                    },
                    thirdChart: {
                      title: statesForBoxHeaders[4],
                      caption: row[16],
                      label: row[17],
                      value: row[18],
                    },
                    fourthChart: {
                      title: statesForBoxHeaders[8],
                      caption: row[33],
                      label: row[34],
                      value: row[35],
                    },
                  },
                  police: {
                    title: statesForBoxHeaders[1],
                    description: row[6],
                    caption: row[7],
                    label: row[8],
                    value: row[9],
                  },
                  prision: {
                    title: statesForBoxHeaders[5],
                    description: row[19],
                    data: [
                      { label: statesForBoxSubHeaders[20], value: ourParseFloat(row[20]) },
                      { label: statesForBoxSubHeaders[21], value: ourParseFloat(row[21]) },
                      { label: statesForBoxSubHeaders[23], value: ourParseFloat(row[23]) },
                      { label: statesForBoxSubHeaders[22], value: ourParseFloat(row[22]) },
                    ],
                  },
                  actions: {
                    title: statesForBoxHeaders[6],
                    description: row[24],
                    titles: (row[25] ? row[25].split("\n") : []),
                    descriptions: (row[26] ? row[26].split("\n") : []),
                  },
                  funnel: {
                    available: !!row[27],
                    title: statesForBoxHeaders[7],
                    data: [
                      { label: statesForBoxSubHeaders[27], value: row[27] },
                      { label: statesForBoxSubHeaders[28], value: row[28] },
                      { label: statesForBoxSubHeaders[29], value: row[29] },
                    ],
                  },
                  texts: {
                    home: row[30],
                    prisionBefore: row[31],
                    prisionAfter: row[32],
                  },
                };
              }
            });
  
            // Tables
            newData.tables = { columns: [], rows: [] };
            response.result.valueRanges[4].values.forEach((row, i) => {
              if (i === 0) {
                newData.tables.titles = [row[1], row[2], row[3]];
              }
              else if (i === 1) {
                newData.tables.descriptions = [row[1], row[2], row[3]];
              }
              else if (i === 2) {
                newData.tables.columns = row.slice();
              }
              else {
                const tableRow = {}
                row.forEach((cell, j) => {
                  tableRow[newData.tables.columns[j]] = cell;
                });
                newData.tables.rows.push(tableRow);
              }
            });

            // The conclusion
            newData.conclusion = [];
            response.result.valueRanges[5].values.forEach((row, i) => {
              if (i === 0) {
                newData.conclusionTitle = row[0];
              }
              else {
                newData.conclusion.push({ prefix: row[0], amount: row[1], suffix: row[2], title: row[3], text: row[4] });
              }
            });
  
            // Table
            newData.table = { columns: [], rows: [] };
            if (response.result.valueRanges[6].values) {
              response.result.valueRanges[6].values.forEach((row, i) => {
                if (i === 0) {
                  newData.table.title = row[0];
                }
                else if (i === 1) {
                  newData.table.description = parseImageUrlsInText(row[0]);
                }
                else if (i === 2) {
                  newData.table.columns = row.slice();
                }
                else {
                  const tableRow = {}
                  row.forEach((cell, j) => {
                    tableRow[newData.table.columns[j]] = cell;
                  });
                  newData.table.rows.push(tableRow);
                }
              });
            }

            // Timeline
            newData.timeline = {};
            if (response.result.valueRanges[7].values) {
              let timelineDatasets = [];
              let timelineYears = [];
              response.result.valueRanges[7].values.forEach((row, i) => {
                if (i === 0) { // Global description
                  newData.timeline.description = row[0];
                }
                else if (i === 1) { // Footer
                  newData.timeline.footer = row[0];
                }
                else if (i === 2) { // Datasets
                  timelineDatasets = row;
                }
                else if (i === 3) { // Years
                  timelineYears = row.map(cell => parseInt(cell, 10));
                }
                else { // States
                  let timelineState = null;
                  row.forEach((cell, j) => {
                    if (j === 0) {
                      timelineState = row[0];
                      newData.timeline[timelineState] = {};
                    }
                    else if (j === 1) {
                      newData.timeline[timelineState].description = row[1];
                    }
                    else {
                      const timelineDataset = timelineDatasets[j];
                      const timelineYear = timelineYears[j];
                      newData.timeline[timelineState][timelineDataset] ||= {};
                      newData.timeline[timelineState][timelineDataset][timelineYear] = parseInt(cell, 10);
                    }
                  });
                }
              });
            }

            // Extra timeline data
            newData.timelineExtra = {};
            if (response.result.valueRanges[8].values) {
              let timelineDatasets = [];
              let timelineYears = [];
              response.result.valueRanges[8].values.forEach((row, i) => {
                if (i === 0) { // Datasets
                  timelineDatasets = row;
                }
                else if (i === 1) { // Years
                  timelineYears = row.map(cell => parseInt(cell, 10));
                }
                else { // States
                  let timelineState = null;
                  row.forEach((cell, j) => {
                    if (j === 0) {
                      timelineState = row[0];
                      newData.timelineExtra[timelineState] = {};
                    }
                    else {
                      const timelineDataset = timelineDatasets[j];
                      const timelineYear = timelineYears[j];
                      newData.timelineExtra[timelineState][timelineDataset] ||= {};
                      newData.timelineExtra[timelineState][timelineDataset][timelineYear] = parseInt(cell, 10);
                    }
                  });
                }
              });
            }

            updateDataForYear(y, newData);
          }
        )
    });
  };

  const data = dataset[year] || { loaded: false };

  React.useEffect(() => {
    if (years.length === 0) {
      if (useCache) {
        const cachedData = JSON.parse(localStorage.getItem('justaData'));
        const cachedYears = Object.keys(cachedData);
        setYears(cachedYears);
      } else if (!useCache) {
        const { gapi } = require('gapi-script');
        gapi.load('client', () => {
          gapi.client
            .init({
              apiKey: 'AIzaSyApxSpL08Sb5gvVvhXGWUgBVUKHivPY7-U',
              discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            })
            .then(() => {
              gapi.client.load('sheets', 'v4', () => {
                gapi.client.sheets.spreadsheets.values
                  .batchGet({
                    spreadsheetId: '1AIWdzmYw5IlHRB0imVkqYSnrE5-GW-Y5Qz-_XXAzenY',
                    ranges: ['Anos!A1:D30'],
                  })
                  .then(
                    response => {
                      const yearsToSet = [];
                      setCredits(response.result.valueRanges[0].values[1][1]);
                      setVideoText(response.result.valueRanges[0].values[1][2]);
                      setClickText(response.result.valueRanges[0].values[1][3]);
                      response.result.valueRanges[0].values.forEach((row, i) => {
                        if (i > 0) { // i === 0 is the header
                          yearsToSet.push(parseInt(row[0], 10));
                        }
                      });
                      setYears(yearsToSet);
                    }
                  )
                }
              )
            });
        });
      }
    }
  }, []);

  React.useEffect(() => {
    if (year) {
      const loaded = (dataset[year] && dataset[year].loaded);
      if (!loaded && useCache) {
        const cachedData = JSON.parse(localStorage.getItem('justaData'));
        setDataset(cachedData);
      } else if (!loaded && !useCache) {
        const { gapi } = require('gapi-script');
        gapi.load('client', () => {
          gapi.client
            .init({
              apiKey: 'AIzaSyApxSpL08Sb5gvVvhXGWUgBVUKHivPY7-U',
              discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            })
            .then(() => {
               loadDataForYear(year, gapi.client);
            });
        });
      }
    }
  }, [currentYear, years]);

  const searchParams = useSearchParams();
  const embedded = Boolean(searchParams.get('embedded'));
  const getHeight = Boolean(searchParams.get('getHeight'));
  const embedOnly = searchParams.get('embedOnly');

  React.useEffect(() => {
    if (embedded && getHeight && typeof window !== 'undefined' && window.parent) {
      window.setInterval(() => {
        const height = Math.max(window.document.documentElement.scrollHeight - window.document.documentElement.clientHeight, 2400);
        window.parent.postMessage({ height }, '*');
      }, 500);
    }
  }, []);

  const myRef2 = React.useRef(null);
  const myRef3 = React.useRef(null);

  if (data.loaded && embedded && embedOnly && embedOnly === 'inPractice') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between w-full">
        <div id="content" className="embedded">
          <div id="loaded" key={`loaded-${year}`}>
            <InPractice noTitle data={data.conclusion} key={`in-practice-${year}`} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between w-full ${isIOS ? 'is-ios' : 'not-ios'}`} style={{ zoom: `${zoom}%` }}>
      <div id="content" className={embedded ? 'embedded' : 'not-embedded'}>
        { !embedded && (
          <header>
            <Header onChangeYear={setCurrentYear} year={year} years={years} />
            <div className="page-logo hide-on-mobile">Dados</div>
          </header>
        )}
        { data.loaded ?
          <div id="loaded" key={`loaded-${year}`}>
            <Tabs currentTab={tab} onChange={setTab} />
            <Banner
              key={`banner-${year}`}
              title={data.summary.title}
              description={data.summary.description}
              link={data.summary.link}
              funnel={data.funnel}
              tables={data.tables}
              states={data.states}
              isMobile={isMobile}
            />
            <InPractice title={data.conclusionTitle} data={data.conclusion} key={`in-practice-${year}`} />
            { data.summary.column1 && data.summary.column2 && (
              <div className="connector columns">
                <div className="column">
                  <BsSearch className="big-icon" />
                  <div className="column-text">
                    <Markdown>{data.summary.column1}</Markdown>
                  </div>
                </div>
                <div className="column">
                  <BsPercent className="big-icon" />
                  <div className="column-text">
                    <Markdown>{data.summary.column2}</Markdown>
                    <div style={{ textAlign: 'right' }}>{ data.table.title && <GoLinkExternal className="animate-jump" title="Ver tabela" onClick={() => { setModalOpened('two-columns'); }} /> }</div>
                  </div>
                </div>
                <div ref={myRef2} />
                <Modal open={modalOpened === 'two-columns'} onClose={() => { setModalOpened(null); }} className="model" center container={myRef2.current}>
                  <h2 className="title">{data.table.title}</h2>
                  <div className="description"><Markdown>{data.table.description}</Markdown></div>
                  <table>
                    <thead>
                      <tr>
                        {data.table.columns.map((column) => (<td key={column}>{column}</td>))}
                      </tr>
                    </thead>
                    <tbody>
                    {data.table.rows.map(row => (
                      <tr key={row['Estado']}>
                        {data.table.columns.map((column, i) => {
                          let cellContent = row[column];
                          const cellContentRegexp = new RegExp(/^([^(]+)(\([^)]+\))$/);
                          if (cellContentRegexp.test(cellContent)) {
                            const cellContentMatches = cellContent.match(cellContentRegexp);
                            cellContent = (<span className="divided-cell"><span>{cellContentMatches[1]}</span> <span>{cellContentMatches[2]}</span></span>);
                          }
                          return (
                            <td key={column}>{cellContent}</td>
                          );
                        })}
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </Modal>
              </div>
            )}
            <section id="timeline">
              <div id="timeline-description">
                <h1>Evolução dos gastos</h1>
                <Markdown>{data.timeline.description}</Markdown>
              </div>
              <Timeline stateData={data.timeline.Total} extraStateData={data.timelineExtra.Total} fontSize={16} showLegend footer={data.timeline.footer} />
            </section>
            <section id="first-section">
              <h1>Dados orçamentários por UF</h1>
              { isMobile && (
                <div id="first-section-tabs">
                  <button className={mapTab === 'chart' ? 'enabled' : 'disabled'} onClick={() => { setMapTab('chart'); }}>Gráfico</button>
                  <button className={mapTab === 'map' ? 'enabled' : 'disabled'} onClick={() => { setMapTab('map'); }}>Mapa</button>
                </div>
              )}
              { (mapTab === 'chart' || !isMobile) &&
                <StatesChart dataPoints={data.stateDataPoints} dataPointsExplanations={data.stateDataPointsExplanations} data={data.states} key={`states-chart-${year}-${zoom}`} zoom={zoom} /> }
              { (mapTab === 'map' || !isMobile) &&
                <Map id="first-map" data={data} boxData={data.statesForBox} key={`map-${year}-${zoom}`} clickText={clickText} zoom={zoom} /> }
            </section>
            <div className="connector"><Markdown>{data.summary.conclusion}</Markdown></div>
            <div className="connector video" onClick={() => { setModalOpened('video'); }}>
              <MdOutlineSlowMotionVideo /> <Markdown>{videoText}</Markdown>
            </div>
            <div ref={myRef3} />
            <Modal open={modalOpened === 'video'} onClose={() => { setModalOpened(null); }} className="model" center container={myRef3.current}>
              <iframe
                width="600"
                height="340"
                src="https://www.youtube.com/embed/videoseries?si=BkX-geP0Jn3EwgQk&amp;list=PL3uejUreB8rZNh2asmH3HrktIey0ePkgV"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              >
              </iframe>
            </Modal>
          </div> :
          <p id="loading">
            { !year && 'Carregando dados...' }
            { year && `Carregando dados de ${year}...` }
          </p>
        }
        { !embedded && (
          <>
            <footer>
              <div>
                <h2>Entre em contato</h2>
                <div className="email">justa@justa.org.br</div>
                <div className="email">comunicacao@justa.org.br</div>
              </div>
              <div>
                <h2>Acesse nossas redes</h2>
                <div className="social"><RiInstagramLine /> <a href="https://www.instagram.com/justaorgbr" target="_blank" rel="noopener noreferrer">Instagram</a></div>
                <div className="social"><RiYoutubeLine /> <a href="https://www.youtube.com/channel/UCumJO0sXf6EeuSwzjgteBcQ" target="_blank" rel="noopener noreferrer">YouTube</a></div>
                <div className="social"><RiFacebookLine /> <a href="https://www.facebook.com/Plataforma-Justa-102660198383056" target="_blank" rel="noopener noreferrer">Facebook</a></div>
              </div>
            </footer>
            <footer>
              <div className="credits">
                <div>{credits}</div>
              </div>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
