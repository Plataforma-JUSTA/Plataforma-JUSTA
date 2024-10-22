import Image from 'next/image';

export default function Header({ years, year, onChangeYear }) {
  const handleChangeYear = (e) => {
    onChangeYear(e.target.value);
  };

  return (
    <div className="header">
      <a href="https://www.justa.org.br" target="_blank" rel="noopener noreferrer" id="logo">
        <Image
          src="/justa.svg"
          alt="Logo Justa"
          height={70}
          width={280}
          priority
        />
      </a>
      <select onChange={handleChangeYear} defaultValue={year} value={year}>
        { years.slice().sort().map(y => (<option value={y} key={y}>{y}</option>)) }
      </select>
      <ul>
        <li>
          { year ? <a href={`https://www.justa.org.br/metodologia-justa-${year}/`} target="_blank" rel="noopener noreferrer">Metodologia</a> : <a href="#">Metodologia</a> }
        </li>
        <li>
          <a href="https://www.justa.org.br/termos-tecnicos-2/" target="_blank" rel="noopener noreferrer">Termos técnicos</a>
        </li>
        <li>
          <a href="https://www.justa.org.br/como-funciona-o-orcamento-estadual/" target="_blank" rel="noopener noreferrer">Como funciona o orçamento estadual</a>
        </li>
      </ul>
    </div>
  );
}
