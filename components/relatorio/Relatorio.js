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

const years = ['2022', '2023']; // Adicione os anos necessários

const Resumo = () => {
  const [receitasTotais, setReceitasTotais] = useState([]);
  const [despesasTotais, setDespesasTotais] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonthData, setSelectedMonthData] = useState([]);
  const [receitasPorMes, setReceitasPorMes] = useState([]);
  const [despesasPorMes, setDespesasPorMes] = useState([]);
  const [iniciosNoMes, setIniciosNoMes] = useState([]);
  const [terminosNoMes, setTerminosNoMes] = useState([]);
  const [iniciosNoMesSeguinte, setIniciosNoMesSeguinte] = useState([]);

  useEffect(() => {
    // Fazer uma solicitação para a rota existente que retorna as informações de resumo
    fetch('/api/financeiro/financas/get')
      .then((response) => response.json())
      .then((data) => {
        // Extrair os valores do objeto de resposta
        const { receitasTotais, despesasTotais, receitasPorMes, despesasPorMes } = data;

        // Definir o estado com os valores obtidos
        setReceitasTotais(receitasTotais[0]?.total || 0);
        setDespesasTotais(despesasTotais[0]?.total || 0);
        setReceitasPorMes(receitasPorMes);
        setDespesasPorMes(despesasPorMes);
      })
      .catch((error) => {
        console.error('Erro ao buscar informações de resumo', error);
      });

    if (selectedMonth && selectedYear) {
      // Fazer uma solicitação para a rota que retorna os lançamentos do mês selecionado
      fetch(`/api/financeiro/financas/get?month=${selectedMonth}&year=${selectedYear}`)
        .then((response) => response.json())
        .then((data) => {
          // Atualizar o estado com os lançamentos do mês selecionado
          setSelectedMonthData(data.lancamentos);
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

      html2pdf(content);
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




  // Filtra os ganhos e gastos com base no mês e ano selecionados
  const filteredReceitasPorMes = receitasPorMes.filter((receita) => receita._id === `${selectedYear}/${selectedMonth}`);
  const filteredDespesasPorMes = despesasPorMes.filter((despesa) => despesa._id === `${selectedYear}/${selectedMonth}`);

  return (
    <div className="h3-resumo">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <h2>Report</h2>

        <div id='pdf-content'>
          <span>Total revenue:<br/>R${Number(receitasTotais).toFixed(2)}</span>
          <span>Total cost:<br/>R${Number(-despesasTotais).toFixed(2)}</span>

          {iniciosNoMes.length > 0 && (
  <div>
<div>
<b style={{fontSize: '25px'}}>Início</b>
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
</div>

<div>
  <b style={{fontSize: '25px'}}>Terminos</b>
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
</div>

<div>
  <b style={{fontSize: '25px'}}>Planejadas</b>
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

          {selectedMonth && selectedYear && (
          <div>
            <h3>{`Details for ${selectedMonth}/${selectedYear}`}</h3>
            <span>Total revenue: R${filteredReceitasPorMes.length > 0 ? filteredReceitasPorMes[0].total.toFixed(2) : '0.00'}</span>
            <span>Total cost: R${filteredDespesasPorMes.length > 0 ? -filteredDespesasPorMes[0].total.toFixed(2) : '0.00'}</span>

            {filteredReceitasPorMes.length > 0 || filteredDespesasPorMes.length > 0 ? (
      <div>
        <h4>Lançamentos do mês:</h4>
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {selectedMonthData.map((lancamento) => (
              <tr key={lancamento._id}>
                <td>{lancamento.descricao}</td>
                <td>{new Date(new Date(lancamento.data).setDate(new Date(lancamento.data).getDate() + 1)).toLocaleDateString()}</td>
                <td>{lancamento.valor.toFixed(2)}</td>
                <td>{lancamento.tipo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>Nenhum lançamento para o mês selecionado.</p>
    )}
          </div>
        )}
        </div>

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

        

        <button onClick={generatePDF}>Generate PDF</button>
      </div>
    </div>
  );
};

export default Resumo;
