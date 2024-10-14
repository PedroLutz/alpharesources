import React, { useState, useEffect } from "react";
import { Chart } from 'react-google-charts';
import { fetchData } from '../../../functions/crud';
import Loading from '../../Loading';
import styles from '../../../styles/modules/resumo.module.css'

const { grafico, pie_direita, pie_esquerda, pie_container, h3_resumo, custom_span } = styles;

const Resumo = () => {
    const [planosPorArea_Essencial, setPlanosPorArea_Essencial] = useState([]);
    const [planosPorArea_all, setPlanosPorArea_all] = useState([]);
    const [planosSoma_Essencial, setPlanosSoma_Essencial] = useState([]);
    const [planosSoma_all, setPlanosSoma_all] = useState([]);
    const [linhaDoTempoEssencial, setLinhaDoTempoEssencial] = useState([]);
    const [linhaDoTempoAll, setLinhaDoTempoAll] = useState([]);

    const [loading, setLoading] = useState(true);
    const [chartHeight, setChartHeight] = useState('100px');
    const [chartDataLoaded, setChartDataLoaded] = useState(false);
    const [cores, setCores] = useState({});

    const [pieEssencial, setPieEssencial] = useState(false);

    const fetchResumos = async () => {
        try {
            const data = await fetchData('recursos/planoAquisicao/get/resumo');
            setPlanosPorArea_Essencial(data.planosPorArea_Essencial);
            setPlanosPorArea_all(data.planosPorArea_all);
            setPlanosSoma_Essencial(data.planosSoma_Essencial[0]);
            setPlanosSoma_all(data.planosSoma_all[0]);
            setLinhaDoTempoEssencial(data.linhaDoTempoEssencial);
            setLinhaDoTempoAll(data.linhaDoTempoAll);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchCores = async () => {
        const data = await fetchData('wbs/get/cores');
        var cores = {};
        data.areasECores.forEach((area) => {
          cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
        })
        setCores(cores);
      }

    useEffect(() => {
        fetchCores();
        fetchResumos();
    }, []);

    const planosPorArea_Essencial_graph = [['Area', 'Value']]
    planosPorArea_Essencial.forEach((area) => {
        planosPorArea_Essencial_graph.push([area._id, parseFloat((area.mediaPonderada*1.1).toFixed(2) )]);
    });

    const planosPorArea_all_graph = [['Area', 'Value']];
    planosPorArea_all.forEach((area) => {
        planosPorArea_all_graph.push([area._id, parseFloat((area.mediaPonderada*1.1).toFixed(2) )]);
    });

    const linhaDoTempoEssencial_graph = [['Resource', 'Resource', 'Start', 'End']];
    linhaDoTempoEssencial.forEach((recurso) => {
        const dataInicial = new Date(2024, 2, 13);
        const dataEsperada = new Date(recurso.data_esperada);
        const dataLimite = new Date(recurso.data_limite)

        linhaDoTempoEssencial_graph.push([recurso._id, `Expected`, dataInicial, dataEsperada]);
        linhaDoTempoEssencial_graph.push([recurso._id, `Critical`, dataEsperada, dataLimite]);
    });

    const linhaDoTempoAll_graph = [['Resource', 'Resource', 'Start', 'End']];
    linhaDoTempoAll.forEach((recurso) => {
        const dataInicial = new Date(2024, 2, 13);
        const dataEsperada = new Date(recurso.data_esperada);
        const dataLimite = new Date(recurso.data_limite)

        linhaDoTempoAll_graph.push([recurso._id, `Expected`, dataInicial, dataEsperada]);
        linhaDoTempoAll_graph.push([recurso._id, `Critical`, dataEsperada, dataLimite]);
    });

    useEffect(() => {
        let dados = pieEssencial ? [linhaDoTempoEssencial_graph] : [linhaDoTempoAll_graph]
        dados.forEach((dado) => {
            if (dado.length > 1) {
                const linhaHeight = 40;
                const novaAltura = ((dado.length * linhaHeight) + 50) + 'px';
                setChartHeight(novaAltura);
                setChartDataLoaded(true);
            }
        })

    }, [linhaDoTempoEssencial_graph, linhaDoTempoAll_graph]);

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
                <h3>Budget</h3>

                <div style={{ display: 'flex' }} className={pie_container}>
                        <div className={pie_esquerda}>
                            <Chart
                                width={'100%'}
                                height={'400px'}
                                chartType="PieChart"
                                loader={<div>Loading graph</div>}
                                data={planosPorArea_Essencial_graph}
                                options={{
                                    ...estiloGraph,
                                    title: 'Essencial Scenario',
                                    slices: planosPorArea_Essencial_graph.slice(1).map((row, index) => ({
                                        color: cores[row[0]] || '#ccc', 
                                      })),
                                      pieSliceTextStyle: {
                                        color: 'black', 
                                      },
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
                                data={planosPorArea_all_graph}
                                options={{
                                    ...estiloGraph,
                                    title: 'Ideal Scenario',
                                    slices: planosPorArea_all_graph.slice(1).map((row, index) => ({
                                        color: cores[row[0]] || '#ccc', 
                                      })),
                                      pieSliceTextStyle: {
                                        color: 'black', 
                                      },
                                }}
                                rootProps={{ 'data-testid': '1' }}
                            />
                        </div>
                    </div>

                <div className="centered-container" style={{ flexDirection: "row" }}>
                    <span className={custom_span}>Essential Scenario: R${parseFloat((planosSoma_Essencial.mediaPonderada *1.1)).toFixed(2) }</span>
                    <span className={custom_span}>Ideal Scenario: R${parseFloat((planosSoma_all.mediaPonderada)*1.1).toFixed(2)}</span>
                </div>

                <div className='centered-container'>
                    <button className='botao-bonito' style={{ width: '10rem', height: !pieEssencial ? '3rem' : '2rem' }} onClick={() => setPieEssencial(!pieEssencial)}>
                        {pieEssencial ? `View all resources` : `View only essential resources`}
                    </button>
                </div>

                {chartDataLoaded && (
                    <React.Fragment>
                        {pieEssencial ? (
                            <React.Fragment>
                                <div className='centered-container'>
                                    <h3>Essential timeline</h3>
                                </div>

                                <div className={grafico}>
                                    <Chart
                                        width={'90%'}
                                        height={chartHeight}
                                        chartType="Timeline"
                                        loader={<div>Loading graph</div>}
                                        data={linhaDoTempoEssencial_graph}
                                        options={{
                                            ...estiloGraph,
                                            timeline: {
                                                rowLabelStyle: {
                                                    color: 'black',
                                                    fontSize: 12, 
                                                },
                                                barLabelStyle: {
                                                    fontSize: 9, 
                                                },
                                                showRowLabels: true, 
                                            },
                                        }}
                                        rootProps={{ 'data-testid': '1' }}
                                    />
                                </div>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <div className='centered-container'>
                                    <h3>All resources timeline</h3>
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
                                                    color: 'black',
                                                    fontSize: 12, 
                                                },
                                                barLabelStyle: {
                                                    fontSize: 9, 
                                                },
                                                showRowLabels: true, 
                                            },
                                        }}
                                        data={linhaDoTempoAll_graph}
                                        rootProps={{ 'data-testid': '1' }}
                                    />
                                </div>
                            </React.Fragment>
                        )}
                    </React.Fragment>
                )}
            </div>
        </div>
    )
}

export default Resumo;