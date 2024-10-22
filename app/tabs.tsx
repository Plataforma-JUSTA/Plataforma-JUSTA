export default function Tabs({ currentTab, onChange }) {
  return (
    <div id="tabs">
      <div className={`tab ${currentTab === 'funnel' ? 'active' : 'inactive'}`} onClick={() => { onChange('funnel'); }}>Funil de Investimentos</div>
      {/* <div className={`tab ${currentTab === 'budget' ? 'active' : 'inactive'}`}>Justiça e Orçamento</div> */}
    </div>
  );
};
