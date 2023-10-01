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
        const { somaValores, receitasPorArea, despesasPorArea, receitasPorMes, despesasPorMes } = data;

        // Definir o estado com os valores obtidos
        setTotalValor(somaValores[0]?.total || 0);
        setReceitasPorArea(receitasPorArea);
        setDespesasPorArea(despesasPorArea);
        setReceitasPorMes(receitasPorMes);
        setDespesasPorMes(despesasPorMes);
      })
      .catch((error) => {
        console.error('Erro ao buscar informações de resumo', error);
      });
  }, []);

  return (
    <div>
      
      <h2>Resumo</h2>

      <div>
        <p>Valor em Caixa: <span>R${totalValor}</span></p>
      </div>
     
      <div>
        <h3>Lançamentos Por Área</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Chart
            width={'100%'}
            height={'400px'}
            chartType="PieChart"
            loader={<div>Carregando Gráfico</div>}
            data={ReceitasPorAreaGraph}
            options={{
              title: 'Receitas por Área',
            }}
            rootProps={{ 'data-testid': '1' }}
          />
          <Chart
            width={'100%'}
            height={'400px'}
            chartType="PieChart"
            loader={<div>Carregando Gráfico</div>}
            data={DespesasPorAreaGraph}
            options={{
              title: 'Despesas Por Área',
            }}
            rootProps={{ 'data-testid': '1' }}
          />
        </div>
        <div>
          <Chart
              width={'100%'}
              height={'400px'}
              chartType="ColumnChart"
              loader={<div>Carregando Gráfico</div>}
              data={ValoresPorAreaGraph}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>
      </div>

      <div>
      <h3>Lançamentos Por Mês</h3>
        <div>
          <Chart
              width={'100%'}
              height={'400px'}
              chartType="ColumnChart"
              loader={<div>Carregando Gráfico</div>}
              data={ValoresPorMesGraph}
              options={{
                title: 'Lançamentos Por Mês',
              }}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>
        <div>
          <h3>Caixa Mensal por Mês</h3>
          <Chart
              width={'100%'}
              height={'400px'}
              chartType="LineChart"
              loader={<div>Carregando Gráfico</div>}
              data={CaixaMensalGraph}
              options={{}}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>

        <div>
          <h3>Crescimento dos Gastos</h3>
          <Chart
              width={'100%'}
              height={'400px'}
              chartType="LineChart"
              loader={<div>Carregando Gráfico</div>}
              data={CrescimentoDosGastosGraph}
              options={{}}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>
      </div>
    </div>
  );
};

export default Resumo;
