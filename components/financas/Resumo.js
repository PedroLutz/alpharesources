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
  const [crescimentoDosGastosPlano, setCrescimentoDosGastosPlano] = useState([]);

  const ReceitasPorAreaGraph = [['Área', 'Valor']];
  receitasPorArea.forEach((area) => {
    ReceitasPorAreaGraph.push([area._id, area.total]);
  });

  const DespesasPorAreaGraph = [['Área', 'Valor']];
  despesasPorArea.forEach((area) => {
    DespesasPorAreaGraph.push([area._id, -area.total]);
  });


  const ValoresPorAreaGraph = [['Área', 'Receita', 'Despesa']];
  
  const areasGanhos = new Set(receitasPorArea.map((receitaArea) => receitaArea._id));
  const areasGastos = new Set(despesasPorArea.map((despesaArea) => despesaArea._id));
  const todasAreas = Array.from(new Set([...areasGanhos, ...areasGastos]));

  // Percorra a lista de meses
  todasAreas.forEach((areaNome) => {
    // Encontre o correspondente da receita para o mês
    const receitaArea = receitasPorArea.find((receita) => receita._id === areaNome);
    const receitaValor = receitaArea ? receitaArea.total : 0;

    // Encontre o correspondente da despesa para o mês
    const despesaArea = despesasPorArea.find((despesa) => despesa._id === areaNome);
    const despesaValor = despesaArea ? -despesaArea.total : 0;

    ValoresPorAreaGraph.push([areaNome, receitaValor, despesaValor]);
  });

  const ValoresPorMesGraph = [['Mês', 'Receita', 'Despesa']];
  const CaixaMensalGraph = [['Mês', 'Valor']];
  const CrescimentoDosGastosGraph = [['Mês', 'Valor']];
  const ComparaçãoDosGastosGraph = [['Mês', 'Plano', 'Real']];
  let saldoAcumulado = 0;
  let gastosAcumulados = 0;

  const mesesGanhos = new Set(receitasPorMes.map((receitaMes) => receitaMes._id));
  const mesesGastos = new Set(despesasPorMes.map((despesaMes) => despesaMes._id));
  const todosMeses = sortBy(Array.from(new Set([...mesesGanhos, ...mesesGastos])));

  // Percorra a lista de meses
  todosMeses.forEach((mesNome) => {
    // Encontre o correspondente da receita para o mês
    const receitaMes = receitasPorMes.find((receita) => receita._id === mesNome);
    const receitaValor = receitaMes ? receitaMes.total : 0;

    // Encontre o correspondente da despesa para o mês
    const despesaMes = despesasPorMes.find((despesa) => despesa._id === mesNome);
    const despesaValor = despesaMes ? -despesaMes.total : 0;

    const saldoMes = receitaValor - despesaValor;

      saldoAcumulado += saldoMes;
      gastosAcumulados += despesaValor;

    ValoresPorMesGraph.push([mesNome, receitaValor, despesaValor]);
    CaixaMensalGraph.push([mesNome, saldoAcumulado]);
    CrescimentoDosGastosGraph.push([mesNome, gastosAcumulados]);
  });

// Agora ValoresPorMesGraph conterá os valores para todos os meses, mesmo que não haja receita ou despesa para um mês específico


  useEffect(() => {
    // Fazer uma solicitação para a rota existente que retorna as informações de resumo
    fetch('/api/financas/get')
      .then((response) => response.json())
      .then((data) => {
        // Extrair os valores do objeto de resposta
        const { somaValores, receitasPorArea, despesasPorArea, receitasPorMes, despesasPorMes , maiorEMenorValor, receitasTotais, despesasTotais } = data;

        // Definir o estado com os valores obtidos
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
    backgroundColor: '#1B1B1B',
    titleTextStyle: {
      color: "white"
    },
    legend: {
      textStyle: {color: 'white'}
    },
    hAxis: {
      textStyle: {color: 'white'},
      gridlines: {color: 'white'}
    },
    vAxis: {
      textStyle: {color: 'white'},
    },
  }

  return (
    <div className="h3-resumo">
      <div className="centered-container">
        <h2>Resumo</h2>

        <div>
          <span className="custom-span">Valor em Caixa:<br/>R${totalValor}</span>
          <br/>
          <span className="custom-span">Maior receita:<br/>R${maiorValor}</span>
          <span className="custom-span">Ganhos totais:<br/>R${receitasTotais}</span>
          <span className="custom-span">Maior despesa:<br/>R${-menorValor}</span>
          <span className="custom-span">Gastos totais:<br/>R${-despesasTotais}</span>
        </div>
      </div>
     
     {/* div Lançamentos por Área*/}
      <div>
        <h3>Lançamentos Por Área</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Chart
            width={"100%"}
            height={"400px"}
            chartType="PieChart"
            loader={<div>Carregando Gráfico</div>}
            data={ReceitasPorAreaGraph}
            options={{
              ...estiloGraph,
              title: 'Receitas por Área',
            }}
            rootProps={{ 'data-testid': '1' }}
          />
          <Chart
            width={"100%"}
            height={"400px"}
            chartType="PieChart"
            loader={<div>Carregando Gráfico</div>}
            data={DespesasPorAreaGraph}
            options={{
              ...estiloGraph,
              title: 'Despesas Por Área',
            }}
            rootProps={{ 'data-testid': '1' }}
          />
        </div>
        <div>
          <Chart
              width={"100%"}
              height={"400px"}
              chartType="ColumnChart"
              loader={<div>Carregando Gráfico</div>}
              options={{...estiloGraph, colors: ['green', 'red']}}
              data={ValoresPorAreaGraph}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>
      </div>
      {/* fim div Lançamentos por Área*/}

      {/* div Lançamentos por Mês*/}
      <div>
      <h3>Lançamentos Por Mês</h3>
        <div>
          <Chart
              width={"100%"}
              height={"400px"}
              chartType="ColumnChart"
              loader={<div>Carregando Gráfico</div>}
              data={ValoresPorMesGraph}
              options={{
                ...estiloGraph,
                title: 'Lançamentos Por Mês',
                colors: ['green', 'red']
              }}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>
        <div>
          <h3>Caixa Mensal por Mês</h3>
          <Chart
              width={"100%"}
              height={"400px"}
              chartType="LineChart"
              loader={<div>Carregando Gráfico</div>}
              data={CaixaMensalGraph}
              options={{...estiloGraph, 
                colors: ["#ff00e3"], 
                series: {
                0: {
                  lineWidth: 5, // Largura da linha da série 0
                },
              },}}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>

        {/* fim div Lançamentos por Mês*/}

        {/* div Crescimento dos Gastos*/}
        <div>
          <h3>Crescimento dos Gastos</h3>
          <Chart
              width={"100%"}
              height={"400px"}
              chartType="LineChart"
              loader={<div>Carregando Gráfico</div>}
              data={CrescimentoDosGastosGraph}
              options={{...estiloGraph, colors: ["#ff00e3"], 
              series: {
                0: {
                  lineWidth: 5, // Largura da linha da série 0
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
