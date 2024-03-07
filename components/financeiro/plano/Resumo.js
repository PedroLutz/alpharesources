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

  const piorPlanoPorAreaGraph = [['Area', 'Value']];
  piorPlanoPorArea.forEach((area) => {
    piorPlanoPorAreaGraph.push([area._id, area.total]);
    somaPiorPlano += area.total
  });

  const cenarioIdealPorAreaGraph = [['Area', 'Value']];
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

  const crescimentoDosGastosGraph = [['Month', 'Value']];
crescimentoDosGastos.forEach((area) => {
  somaDosGastos += area.total;
  const dateParts = area._id.split('/');
  const formattedDate = `${dateParts[1]}/${dateParts[0]}`;
  crescimentoDosGastosGraph.push([formattedDate, somaDosGastos]);
});


// Agora ValoresPorMesGraph conterá os valores para todos os meses, mesmo que não haja receita ou despesa para um mês específico


  useEffect(() => {
    // Fazer uma solicitação para a rota existente que retorna as informações de resumo
    fetch('/api/financeiro/plano/get')
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
        console.error('Error in getting report data', error);
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
      
      <h2 className="centered-container">Report</h2>
     
      <div>
        <h3>Cost scenarios</h3>

        {/* Pior cenário */}
        <div style={{ display: 'flex' }}>
          <div className="pie-esquerda">
            <Chart
              width={'100%'}
              height={'400px'}
              chartType="PieChart"
              loader={<div>Loading graph</div>}
              data={piorPlanoPorAreaGraph}
              options={{ ...estiloGraph,
                title: 'Worst scenario',
              }}
              rootProps={{ 'data-testid': '1' }}
            />
          </div>
          
          <div className="pie-direita">
            <Chart
              width={'100%'}
              height={'400px'}
              chartType="PieChart"
              loader={<div>Loading graph</div>}
              data={cenarioIdealPorAreaGraph}
              options={{
                ...estiloGraph,
                title: 'Ideal scenario',
              }}
              rootProps={{ 'data-testid': '1' }}
            />
          </div>
        </div>

        <div className="centered-container" style={{flexDirection: "row"}}>
          <span className="custom-span">Worst scenario: R${somaPiorPlano}</span>
          <span className="custom-span">Ideal scenario: R${somaCenarioIdeal}</span>
        </div>

        <h3>Expected timeline</h3>
        <div className="grafico">
            <Chart
                width={'90%'}
                height={'700px'}
                chartType="Timeline"
                loader={<div>Loading graph</div>}
                data={linhaDoTempoEsperadaGraph}
                options={{...estiloGraph, 
                  timeline: {
                    rowLabelStyle: {
                      color: 'black'
                    }
                  }
                }}
                rootProps={{ 'data-testid': '1' }}
            />
        </div>

        <h3>Critical timeline</h3>
        <div className="grafico">
            <Chart
                width={'90%'}
                height={'700px'}
                chartType="Timeline"
                loader={<div>Loading graph</div>}
                options={{...estiloGraph,
                  timeline: {
                    rowLabelStyle: {
                      color: 'black'
                    },
                  }
                }}
                data={linhaDoTempoLimiteGraph}
                rootProps={{ 'data-testid': '1' }}
            />
        </div>

        <h3>Expected monthly cost growth</h3>
        <div className="grafico">
          <Chart
              width={'90%'}
              height={'400px'}
              chartType="LineChart"
              loader={<div>Carregando Gráfico</div>}
              data={crescimentoDosGastosGraph}
              options={{...estiloGraph, 
                colors: ["#ff00e3"],
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
