import React from 'react';
import { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';

const Resumo = () => {
  const [piorPlanoPorArea, setPiorPlanoPorArea] = useState([]);
  const [cenarioIdealPorArea, setCenarioIdealPorArea] = useState([]);
  const [linhaDoTempo, setLinhaDoTempo] = useState([]);
  const [crescimentoDosGastos , setCrescimentoDosGastos] = useState([]);

  let somaPiorPlano = 0;
  let somaCenarioIdeal = 0;
  let somaDosGastos = 0;

  const piorPlanoPorAreaGraph = [['Área', 'Valor']];
  piorPlanoPorArea.forEach((area) => {
    piorPlanoPorAreaGraph.push([area._id, area.total]);
    somaPiorPlano += area.total
  });

  const cenarioIdealPorAreaGraph = [['Área', 'Valor']];
  cenarioIdealPorArea.forEach((area) => {
    cenarioIdealPorAreaGraph.push([area._id, area.total]);
    somaCenarioIdeal += area.total
  });

  const linhaDoTempoEsperadaGraph = [['Resource', 'Start', 'End']];
  linhaDoTempo.forEach((recurso) => {
    // Data inicial fixa em 5 de agosto de 2023
    const dataInicial = new Date('2023-08-05T00:00:00.000Z');
    const dataEsperada = new Date(recurso.data_esperada);
    
    linhaDoTempoEsperadaGraph.push([recurso._id, dataInicial, dataEsperada]);
  });

  const linhaDoTempoLimiteGraph = [['Resource', 'Start', 'End']];
  linhaDoTempo.forEach((recurso) => {
    // Data inicial fixa em 5 de agosto de 2023
    const dataInicial = new Date('2023-08-05T00:00:00.000Z');
    const dataLimite = new Date(recurso.data_limite);
    
    linhaDoTempoLimiteGraph.push([recurso._id, dataInicial, dataLimite]);
  });

  const crescimentoDosGastosGraph = [['Mês', 'Valor']];
  crescimentoDosGastos.forEach((area) => {
    somaDosGastos += area.total
    crescimentoDosGastosGraph.push([area._id, somaDosGastos]);
  });

// Agora ValoresPorMesGraph conterá os valores para todos os meses, mesmo que não haja receita ou despesa para um mês específico


  useEffect(() => {
    // Fazer uma solicitação para a rota existente que retorna as informações de resumo
    fetch('/api/plano/get')
      .then((response) => response.json())
      .then((data) => {
        // Extrair os valores do objeto de resposta
        const { piorPlanoPorArea , cenarioIdealPorArea , linhaDoTempo , crescimentoDosGastos} = data;

        // Definir o estado com os valores obtidos
        setPiorPlanoPorArea(piorPlanoPorArea);
        setCenarioIdealPorArea(cenarioIdealPorArea);
        setLinhaDoTempo(linhaDoTempo);
        setCrescimentoDosGastos(crescimentoDosGastos);
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
    <div>
      
      <h2>Resumo</h2>
     
      <div>
        <h3>Cenários de gastos</h3>

        {/* Pior cenário */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Chart
            width={'100%'}
            height={'400px'}
            chartType="PieChart"
            loader={<div>Carregando Gráfico</div>}
            data={piorPlanoPorAreaGraph}
            options={{ ...estiloGraph,
              title: 'Pior Cenário',
            }}
            rootProps={{ 'data-testid': '1' }}
          />
          <Chart
            width={'100%'}
            height={'400px'}
            chartType="PieChart"
            loader={<div>Carregando Gráfico</div>}
            data={cenarioIdealPorAreaGraph}
            options={{
              ...estiloGraph,
              title: 'Cenário Ideal',
            }}
            rootProps={{ 'data-testid': '1' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p>Pior Cenário: <span>R${somaPiorPlano}</span></p>
          <p>Cenário Ideal: <span>R${somaCenarioIdeal}</span></p>
        </div>

        <div>
          <h3>Linha do tempo esperada</h3>
            <Chart
                width={'100%'}
                chartType="Timeline"
                loader={<div>Carregando Gráfico</div>}
                data={linhaDoTempoEsperadaGraph}
                options={{...estiloGraph, 
                  timeline: {
                    rowLabelStyle: {
                      color: 'white'
                    }
                  }
                }}
                rootProps={{ 'data-testid': '1' }}
            />
        </div>

        <div>
          <h3>Linha do tempo crítica</h3>
            <Chart
                width={'100%'}
                chartType="Timeline"
                loader={<div>Carregando Gráfico</div>}
                options={{...estiloGraph,
                  timeline: {
                    rowLabelStyle: {
                      color: 'white'
                    }
                  }
                }}
                data={linhaDoTempoLimiteGraph}
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
              data={crescimentoDosGastosGraph}
              options={{...estiloGraph, }}
              rootProps={{ 'data-testid': '1' }}
            />
        </div>
      </div>
    </div>
  );
};

export default Resumo;
