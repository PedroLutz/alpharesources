import React from 'react';
import { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { sortBy } from 'lodash';

const Resumo = () => {
  const [totalValor, setTotalValor] = useState(0);
  const [receitasPorArea, setReceitasPorArea] = useState([]);
  const [despesasPorArea, setDespesasPorArea] = useState([]);
  const [receitasPorMes, setReceitasPorMes] = useState([]);
  const [despesasPorMes, setDespesasPorMes] = useState([]);
  const [maiorValor, setMaiorValor] = useState([]);
  const [menorValor, setMenorValor] = useState([]);
  const [receitasTotais, setReceitasTotais] = useState([]);
  const [despesasTotais, setDespesasTotais] = useState([]);

  //gerar Array do grafico de pizza Receitas Por Area
  const ReceitasPorAreaGraph = [['Area', 'Value']];
  receitasPorArea.forEach((area) => {
    ReceitasPorAreaGraph.push([area._id, area.total]);
  });

  //gerar Array do grafico de pizza Despesas por Area
  const DespesasPorAreaGraph = [['Area', 'Value']];
  despesasPorArea.forEach((area) => {
    DespesasPorAreaGraph.push([area._id, -area.total]);
  });

  //gerar Array do grafico de colunas de valores por area
  const ValoresPorAreaGraph = [['Area', 'Revenue', 'Expense']];
  const areasGanhos = new Set(receitasPorArea.map((receitaArea) => receitaArea._id));
  const areasGastos = new Set(despesasPorArea.map((despesaArea) => despesaArea._id));
  const todasAreas = Array.from(new Set([...areasGanhos, ...areasGastos]));
  todasAreas.forEach((areaNome) => {
    const receitaArea = receitasPorArea.find((receita) => receita._id === areaNome);
    const receitaValor = receitaArea ? receitaArea.total : 0;

    const despesaArea = despesasPorArea.find((despesa) => despesa._id === areaNome);
    const despesaValor = despesaArea ? -despesaArea.total : 0;

    ValoresPorAreaGraph.push([areaNome, receitaValor, despesaValor]);
  });

  //gerar Array do grafico de colunas de valores por mês, crescimento mensal e gasto mensal
  const ValoresPorMesGraph = [['Month', 'Revenue', 'Expense']];
  const CaixaMensalGraph = [['Month', 'Value']];
  const CrescimentoDosGastosGraph = [['Month', 'Value']];
  let saldoAcumulado = 0;
  let gastosAcumulados = 0;

  const mesesGanhos = new Set(receitasPorMes.map((receitaMes) => receitaMes._id));
  const mesesGastos = new Set(despesasPorMes.map((despesaMes) => despesaMes._id));
  const todosMeses = sortBy(Array.from(new Set([...mesesGanhos, ...mesesGastos])));
  todosMeses.forEach((mesNome) => {
    const receitaMes = receitasPorMes.find((receita) => receita._id === mesNome);
    const receitaValor = receitaMes ? receitaMes.total : 0;

    const despesaMes = despesasPorMes.find((despesa) => despesa._id === mesNome);
    const despesaValor = despesaMes ? -despesaMes.total : 0;

    const saldoMes = receitaValor - despesaValor;

      saldoAcumulado += saldoMes;
      gastosAcumulados += despesaValor;

      const dateParts = mesNome.split('/');
      const formattedDate = `${dateParts[1]}/${dateParts[0]}`;
    
      ValoresPorMesGraph.push([formattedDate, receitaValor, despesaValor]);
      CaixaMensalGraph.push([formattedDate, saldoAcumulado]);
      CrescimentoDosGastosGraph.push([formattedDate, gastosAcumulados]);
  });

  //receber dados das financas
  useEffect(() => {
    fetch('/api/financeiro/financas/get')
      .then((response) => response.json())
      .then((data) => {
        const { somaValores, receitasPorArea, despesasPorArea,
          receitasPorMes, despesasPorMes , maiorEMenorValor,
          receitasTotais, despesasTotais } = data;

        setTotalValor(somaValores[0]?.total || 0);
        setReceitasPorArea(receitasPorArea);
        setDespesasPorArea(despesasPorArea);
        setReceitasPorMes(receitasPorMes);
        setDespesasPorMes(despesasPorMes);
        setMaiorValor(maiorEMenorValor[0]?.max || 0);
        setMenorValor(maiorEMenorValor[0]?.min || 0);
        setReceitasTotais(receitasTotais[0]?.total || 0); 
        setDespesasTotais(despesasTotais[0]?.total || 0); 
      })
      .catch((error) => {
        console.error('Erro ao buscar informações de resumo', error);
      });
  }, []);

  const estiloGraph = {
    backgroundColor: 'transparent',
    titleTextStyle: {
      color: "black"
    },
    legend: {
      textStyle: {color: 'black'}
    },
    hAxis: {
      textStyle: {color: 'black'},
      gridlines: {color: 'black'}
    },
    vAxis: {
      textStyle: {color: 'black'},
    },
  }

  return (
    <div className="h3-resumo">
      <div className="centered-container">
        <h2>Report</h2>

        <div>
          <span className="custom-span">Cash value:<br/>R${Number(totalValor).toFixed(2)}</span>
          <br/>
          <span className="custom-span">Largest income:<br/>R${Number(maiorValor).toFixed(2)}</span>
          <span className="custom-span">Total revenue:<br/>R${Number(receitasTotais).toFixed(2)}</span>
          <span className="custom-span">Largest expense:<br/>R${Number(-menorValor).toFixed(2)}</span>
          <span className="custom-span">Total cost:<br/>R${Number(-despesasTotais).toFixed(2)}</span>
        </div>

      </div>
      
      <div>
        <h3>Releases per area</h3>

        <div style={{ display: 'flex'}}>
          <div className="pie-esquerda">
            <Chart
              width={"100%"}
              height={"400px"}
              chartType="PieChart"
              loader={<div>Loading graph</div>}
              data={ReceitasPorAreaGraph}
              options={{
                ...estiloGraph,
                title: 'Revenues per area',
              }}
              rootProps={{ 'data-testid': '1' }}
            />
          </div>

          <div className="pie-direita">
            <Chart
              width={"100%"}
              height={"400px"}
              chartType="PieChart"
              loader={<div>Loading graph</div>}
              data={DespesasPorAreaGraph}
              options={{
                ...estiloGraph,
                title: 'Costs per area',
              }}
              rootProps={{ 'data-testid': '1' }}
            />
          </div>
        </div>

        <div className="grafico">
          <Chart
              width={"90%"}
              height={"400px"}
              chartType="ColumnChart"
              loader={<div>Loading graph</div>}
              options={{...estiloGraph, colors: ['green', 'red']}}
              data={ValoresPorAreaGraph}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>
      </div>

      <div>
        <h3>Releases per month</h3>
        <div className="grafico">
          <Chart
              width={"90%"}
              height={"400px"}
              chartType="ColumnChart"
              loader={<div>Loading graph</div>}
              data={ValoresPorMesGraph}
              options={{
                ...estiloGraph,
                title: 'Releases per month',
                colors: ['green', 'red']
              }}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>

        <div className="grafico">
          <h3>Cash value per month</h3>
          <Chart
              width={"90%"}
              height={"400px"}
              chartType="LineChart"
              loader={<div>Loading graph</div>}
              data={CaixaMensalGraph}
              options={{...estiloGraph, 
                colors: ["#ff00e3"], 
                series: {
                0: {
                  lineWidth: 5, 
                },
              },}}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>

        <div className="grafico">
          <h3>Cost growth per month</h3>
          <Chart
              width={"90%"}
              height={"400px"}
              chartType="LineChart"
              loader={<div>Loading graph</div>}
              data={CrescimentoDosGastosGraph}
              options={{...estiloGraph, colors: ["#ff00e3"], 
              series: {
                0: {
                  lineWidth: 5,
                },
              }
              }}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>
      </div>
    </div>
  );
};

export default Resumo;
