import React from 'react';
import { useEffect, useState } from 'react';
import { fetchData } from '../../../functions/crud';
import { Chart } from 'react-google-charts';
import Loading from '../../Loading';
import styles from '../../../styles/modules/resumo.module.css'

const { grafico, pie_direita, pie_esquerda, pie_container, h3_resumo, custom_span } = styles;

const Resumo = () => {
  const [piorPlanoPorArea, setPiorPlanoPorArea] = useState([]);
  const [cenarioIdealPorArea, setCenarioIdealPorArea] = useState([]);
  const [linhaDoTempo, setLinhaDoTempo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartHeight, setChartHeight] = useState('100px');
  const [chartDataLoaded, setChartDataLoaded] = useState(false);
  const [viewExpected, setViewExpected] = useState(true)
  const [crescimentoDosGastos, setCrescimentoDosGastos] = useState([]);

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
    let dataInicial = new Date(recurso.data_inicial);
    let dataEsperada = new Date(recurso.data_esperada);
    dataInicial.setDate(dataInicial.getDate() + 1);
    dataEsperada.setDate(dataEsperada.getDate() + 1);

    linhaDoTempoEsperadaGraph.push([recurso._id, dataInicial, dataEsperada]);
  });

  const linhaDoTempoLimiteGraph = [['Resource', 'Start', 'End']];
  linhaDoTempo.forEach((recurso) => {
    const dataInicial = new Date(recurso.data_inicial);
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

  const fetchResumos = async () => {
    try {
      const data = await fetchData('financeiro/plano/get/resumo');
      const { piorPlanoPorArea, cenarioIdealPorArea, linhaDoTempo, crescimentoDosGastos } = data;
      setPiorPlanoPorArea(piorPlanoPorArea);
      setCenarioIdealPorArea(cenarioIdealPorArea);
      setLinhaDoTempo(linhaDoTempo);
      setCrescimentoDosGastos(crescimentoDosGastos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumos();
  }, []);

  useEffect(() => {
    const dados = [linhaDoTempoLimiteGraph, linhaDoTempoEsperadaGraph]
    dados.forEach((dado) => {
      if (dado.length > 1) {
        const linhaHeight = 40;
        const novaAltura = ((dado.length * linhaHeight) + 50) + 'px';
        setChartHeight(novaAltura);
        setChartDataLoaded(true);
        console.log(novaAltura);
      }
    })

  }, [linhaDoTempoLimiteGraph, linhaDoTempoEsperadaGraph]);

  const estiloGraph = {
    backgroundColor: 'transparent',
    titleTextStyle: {
      color: "black"
    },
    legend: {
      textStyle: { color: 'black' }
    },
    hAxis: {
      textStyle: { color: 'black' },
      gridlines: { color: 'black' }
    },
    vAxis: {
      textStyle: { color: 'black' },
    },
  }

  return (
    <div className={h3_resumo}>
      {loading && <Loading />}
      <h2 className="centered-container">Report</h2>

      <div>
        <h3>Cost scenarios</h3>

        {/* Pior cenário */}
        <div style={{ display: 'flex' }} className={pie_container}>
          <div className={pie_esquerda}>
            <Chart
              width={'100%'}
              height={'400px'}
              chartType="PieChart"
              loader={<div>Loading graph</div>}
              data={piorPlanoPorAreaGraph}
              options={{
                ...estiloGraph,
                title: 'Essential scenario',
              }}
              rootProps={{ 'data-testid': '1' }}
            />
          </div>

          <div className={pie_direita}>
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

        <div className="centered-container" style={{ flexDirection: "row" }}>
          <span className={custom_span}>Essential scenario: R${somaPiorPlano}</span>
          <span className={custom_span}>Ideal scenario: R${somaCenarioIdeal}</span>
        </div>

        {chartDataLoaded && (
          <React.Fragment>
            {viewExpected ? (
              <React.Fragment>
                <div className='centered-container'>
                  <h3>Expected timeline</h3>
                  <button className='botao-bonito' style={{ width: '10rem', marginBottom: '2rem', marginTop: '-1rem' }}
                    onClick={() => setViewExpected(false)}>Toggle timeline</button>
                </div>

                <div className={grafico}>
                  <Chart
                    width={'90%'}
                    height={chartHeight}
                    chartType="Timeline"
                    loader={<div>Loading graph</div>}
                    data={linhaDoTempoEsperadaGraph}
                    options={{
                      ...estiloGraph,
                      timeline: {
                        rowLabelStyle: {
                          color: 'black'
                        }
                      }
                    }}
                    rootProps={{ 'data-testid': '1' }}
                  />
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className='centered-container'>
                  <h3>Critical timeline</h3>
                  <button className='botao-bonito' style={{ width: '10rem', marginBottom: '2rem', marginTop: '-1rem' }}
                    onClick={() => setViewExpected(true)}>Toggle timeline</button>
                </div>
                <div className={grafico}>
                  <Chart
                    width={'90%'}
                    height={chartHeight}
                    chartType="Timeline"
                    loader={<div>Loading graph</div>}
                    options={{
                      ...estiloGraph,
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
              </React.Fragment>
            )}
          </React.Fragment>
        )}


        <h3>Expected monthly cost growth</h3>
        <div className={grafico}>
          <Chart
            width={'90%'}
            height={'400px'}
            chartType="LineChart"
            loader={<div>Carregando Gráfico</div>}
            data={crescimentoDosGastosGraph}
            options={{
              ...estiloGraph,
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