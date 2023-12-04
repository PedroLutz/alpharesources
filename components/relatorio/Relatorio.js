import React, { useEffect, useState } from 'react';

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const years = ['2023', '2024']; // Adicione os anos necessários

const Resumo = () => {
  const [receitasTotais, setReceitasTotais] = useState([]);
  const [despesasTotais, setDespesasTotais] = useState([]);
  const [receitasPorMes, setReceitasPorMes] = useState([]);
  const [despesasPorMes, setDespesasPorMes] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonthData, setSelectedMonthData] = useState([]);
  const [iniciosNoMes, setIniciosNoMes] = useState([]);
  const [terminosNoMes, setTerminosNoMes] = useState([]);
  const [iniciosNoMesSeguinte, setIniciosNoMesSeguinte] = useState([]);
  const [customText, setCustomText] = useState(''); // Estado para armazenar o texto do input

  const handleCustomTextChange = (event) => {
    setCustomText(event.target.value);
  };

  useEffect(() => {
    // Fazer uma solicitação para a rota existente que retorna as informações de resumo
    fetch('/api/financeiro/financas/get')
      .then((response) => response.json())
      .then((data) => {
        // Extrair os valores do objeto de resposta
        const { receitasPorMes, despesasPorMes } = data;

        // Definir o estado com os valores obtidos
        setReceitasPorMes(receitasPorMes || 0);
        setDespesasPorMes(despesasPorMes || 0);
      })
      .catch((error) => {
        console.error('Erro ao buscar informações de resumo', error);
      });

    if (selectedMonth && selectedYear) {
      // Fazer uma solicitação para a rota que retorna os lançamentos do mês selecionado
      fetch(`/api/financeiro/financas/get?month=${selectedMonth}&year=${selectedYear}`)
        .then((response) => response.json())
        .then((data) => {
          const lancamentosDoMes = data.lancamentos.map((lancamento) => {
            const dataLancamento = new Date(lancamento.data);
            dataLancamento.setDate(dataLancamento.getDate() + 1);
            return { ...lancamento, data: dataLancamento.toISOString() };
          });
  
          // Atualizar o estado com os lançamentos do mês selecionado
          setSelectedMonthData(lancamentosDoMes);
        })
        .catch((error) => {
          console.error('Erro ao buscar lançamentos do mês', error);
        });

        fetch(`/api/cronograma/get?month=${selectedMonth}&year=${selectedYear}`)
        .then((response) => response.json())
        .then((data) => {
          // Atualizar o estado com os lançamentos do mês selecionado
          setIniciosNoMes(data.iniciosNoMes);
          setTerminosNoMes(data.terminosNoMes);
          setIniciosNoMesSeguinte(data.iniciosNoMesSeguinte);
        })
        .catch((error) => {
          console.error('Erro ao buscar lançamentos do mês', error);
        });
    }
  }, [selectedMonth, selectedYear]);

  const generatePDF = () => {
  import('html2pdf.js').then((html2pdfModule) => {
    const html2pdf = html2pdfModule.default;

    const content = document.getElementById('pdf-content');

    // Opções de configuração do PDF
    const pdfOptions = {
      margin: 10,
      filename: `status_report_${selectedMonth}/${selectedYear}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // Adicionando um cabeçalho personalizado para cada página
    };

    html2pdf().from(content).set(pdfOptions).save();
  });
};


  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const areasIniciosMap = {};
  iniciosNoMes.forEach((elemento) => {
    if (!elemento.plano) {
      if (!areasIniciosMap[elemento.area]) {
        areasIniciosMap[elemento.area] = [];
      }
  
      areasIniciosMap[elemento.area].push(elemento);
    }
  });

  const areasTerminosMap = {};
  terminosNoMes.forEach((elemento) => {
    if (!elemento.plano && elemento.situacao === 'concluida' ) {
      if (!areasTerminosMap[elemento.area]) {
        areasTerminosMap[elemento.area] = [];
      }
  
      areasTerminosMap[elemento.area].push(elemento);
    }
  });

  const areasIniciosProxMesMap = {};
  iniciosNoMesSeguinte.forEach((elemento) => {
    if (elemento.plano) {
      if (!areasIniciosProxMesMap[elemento.area]) {
        areasIniciosProxMesMap[elemento.area] = [];
      }
  
      areasIniciosProxMesMap[elemento.area].push(elemento);
    }
  });

  const lancamentosPorTipo = {};
    selectedMonthData.forEach((lancamento) => {
      const tipo = lancamento.tipo;
      if (!lancamentosPorTipo[tipo]) {
        lancamentosPorTipo[tipo] = [];
      }
      lancamentosPorTipo[tipo].push(lancamento);
    });
    const tiposOrdenados = Object.keys(lancamentosPorTipo).sort((a, b) => b.localeCompare(a));


  // Filtra os ganhos e gastos com base no mês e ano selecionados
  const filteredLancamentosPorMes = selectedMonthData.filter((lancamento) => {
    const lancamentoDate = new Date(lancamento.data);
    return (
      lancamentoDate.getMonth() === parseInt(selectedMonth, 10) - 1 &&
      lancamentoDate.getFullYear() === parseInt(selectedYear, 10)
    );
  });
  
  return (
    <div className="h3-resumo">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <h2>Status Report</h2>

        <div>
          <label>Select Month:</label>
          <select value={selectedMonth} onChange={handleMonthChange}>
            <option value="">--Select Month--</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>

          <label>Select Year:</label>
          <select value={selectedYear} onChange={handleYearChange}>
            <option value="">--Select Year--</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Comments:</label>
          <input type="text" value={customText} onChange={handleCustomTextChange} />
        </div>

        <button onClick={generatePDF} className="botao-cadastro">Generate PDF</button>

        <div id='pdf-content' style={{width: '700px'}}>


          {iniciosNoMes.length > 0 && (
  <div>
    <div className="cabecario">
            <img src={'/images/logo.png'} alt="Logo" style={{width: '80px', marginRight: '20px'}}/>
            <b>Alpha - Status Report {selectedMonth}/{selectedYear}</b>
          </div>
<div style={{marginTop: '10px'}}>
<b style={{fontSize: '25px', color: '#ff00e3'}}>Initiated tasks</b>
{Object.entries(areasIniciosMap).map(([area, itens]) => (
  <div key={area}>
    <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{area}</p>
    {itens.map((item) => (
      <p key={item.item} style={{ fontSize: '13px', marginBottom: '' }}>
        {item.item} ({new Date(item.inicio).toLocaleDateString()})
      </p>
    ))}
  </div>
))}
<div> - </div>
</div>

<div>
  <b style={{fontSize: '25px', color: '#ff00e3'}}>Completed tasks</b>
{Object.entries(areasTerminosMap).map(([area, itens]) => (
  <div key={area}>
    <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{area}</p>
    {itens.map((item) => (
      <p key={item.item} style={{ fontSize: '13px', marginBottom: '' }}>
        {item.item} ({new Date(item.termino).toLocaleDateString()})
      </p>
    ))}
  </div>
))}
<div> - </div>
</div>

<div>
  <b style={{fontSize: '25px', color: '#ff00e3'}}>Planned tasks</b>
{Object.entries(areasIniciosProxMesMap).map(([area, itens]) => (
  <div key={area}>
    <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{area}</p>
    {itens.map((item) => (
      <p key={item.item} style={{ fontSize: '13px', marginBottom: '' }}>
        {item.item} ({new Date(item.inicio).toLocaleDateString()})
      </p>
    ))}
  </div>
))}
</div>
    
  </div>
)}
<div className="html2pdf__page-break"></div>

          {selectedMonth && selectedYear && (
          <div>
            <div className="cabecario" style={{marginTop: '10px'}}>
            <img src={'/images/logo.png'} alt="Logo" style={{width: '80px', marginRight: '20px'}}/>
            <b>Alpha - Status Report {selectedMonth}/{selectedYear}</b>
          </div>
            <div style={{marginTop: '10px'}}>
            <b style={{fontSize: '25px', color: '#ff00e3'}}>Financial results</b><br/>
              
  <h4>Monthly releases</h4>

  {selectedMonthData.length > 0 ? (

    // Renderizar lançamentos por tipo
    tiposOrdenados.map((tipo) => (
      <div key={tipo}>
        <h5>{tipo}</h5>
        <ul>
        {filteredLancamentosPorMes
        .filter((lancamento) => lancamento.tipo === tipo)
        .map((lancamento) => (

            <li key={lancamento._id}>
              {lancamento.descricao} - R${Math. abs(lancamento.valor.toFixed(2))} ({new Date(lancamento.data).toLocaleDateString()})
            </li>
          ))}
        </ul>
        <div> - </div>
      </div>
    ))
  ) : (
    <p>Nenhum lançamento para o mês selecionado.</p>
  )}
  <div style={{marginTop: '10px'}}>
    <div>
    <span style={{fontSize: '20px'}}><b>Total revenue: </b>
            R${Number(receitasPorMes.find(
              item => item._id === `${selectedYear}/${selectedMonth}`
            )?.total || 0).toFixed(2)}
            </span>
    </div>
            
              
            <div style={{marginBottom: '20px'}}>
            <span style={{fontSize: '20px'}}><b>Total cost: </b>R${Number(-despesasPorMes.find(
              item => item._id === `${selectedYear}/${selectedMonth}`
            )?.total || 0).toFixed(2)}
            <br/></span>
              </div>
          
            </div>
</div>

<label style={{fontWeight: 'bold'}}>Comments:</label>
<p style={{border: '1px dotted #000000', borderRadius: '10px', padding: '5px'}}>{customText}</p>

          </div>
        )}
        </div>

        
      </div>
    </div>
  );
};

export default Resumo;
