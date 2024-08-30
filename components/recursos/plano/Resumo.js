import React, { useState, useEffect } from "react";
import { Chart } from 'react-google-charts';
import { fetchData } from '../../../functions/crud';
import Loading from '../../Loading';
import styles from '../../../styles/modules/resumo.module.css'

const { grafico, pie_direita, pie_esquerda, pie_container, h3_resumo, custom_span } = styles;

const Resumo = () => {
    const [planosAPorArea_Essencial, setPlanosAPorArea_Essencial] = useState([]);
    const [planosBPorArea_Essencial, setPlanosBPorArea_Essencial] = useState([]);
    const [planosAPorArea_all, setPlanosAPorArea_all] = useState([]);
    const [planosBPorArea_all, setPlanosBPorArea_all] = useState([]);
    const [planosASoma_Essencial, setPlanosASoma_Essencial] = useState([]);
    const [planosBSoma_Essencial, setPlanosBSoma_Essencial] = useState([]);
    const [planosASoma_all, setPlanosASoma_all] = useState([]);
    const [planosBSoma_all, setPlanosBSoma_all] = useState([]);
    const [linhaDoTempoEssencial, setLinhaDoTempoEssencial] = useState([]);
    const [linhaDoTempoAll, setLinhaDoTempoAll] = useState([]);

    const [loading, setLoading] = useState(true);
    const [chartHeight, setChartHeight] = useState('100px');
    const [chartDataLoaded, setChartDataLoaded] = useState(false);

    const [pieEssencial, setPieEssencial] = useState(false);

    const fetchResumos = async () => {
        try {
            const data = await fetchData('recursos/planoAquisicao/get/resumo');
            setPlanosAPorArea_Essencial(data.planosAPorArea_Essencial);
            setPlanosBPorArea_Essencial(data.planosBPorArea_Essencial);
            setPlanosAPorArea_all(data.planosAPorArea_all);
            setPlanosBPorArea_all(data.planosBPorArea_all);
            setPlanosASoma_Essencial(data.planosASoma_Essencial[0].total);
            setPlanosBSoma_Essencial(data.planosBSoma_Essencial[0].total);
            setPlanosASoma_all(data.planosASoma_all[0].total);
            setPlanosBSoma_all(data.planosBSoma_all[0].total);
            setLinhaDoTempoEssencial(data.linhaDoTempoEssencial);
            setLinhaDoTempoAll(data.linhaDoTempoAll);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumos();
    }, []);

    const planosAPorArea_Essencial_graph = [['Area', 'Value']]
    planosAPorArea_Essencial.forEach((area) => {
        planosAPorArea_Essencial_graph.push([area._id, area.total]);
    });

    const planosBPorArea_Essencial_graph = [['Area', 'Value']]
    planosBPorArea_Essencial.forEach((area) => {
        planosBPorArea_Essencial_graph.push([area._id, area.total]);
    });

    const planosAPorArea_all_graph = [['Area', 'Value']]
    planosAPorArea_all.forEach((area) => {
        planosAPorArea_all_graph.push([area._id, area.total]);
    });

    const planosBPorArea_all_graph = [['Area', 'Value']]
    planosBPorArea_all.forEach((area) => {
        planosBPorArea_all_graph.push([area._id, area.total]);
    });

    const linhaDoTempoEssencial_graph = [['Resource', 'Resource', 'Start', 'End']];
    linhaDoTempoEssencial.forEach((recurso) => {
        const dataInicial = new Date(2024, 2, 13);
        const dataEsperada = new Date(recurso.data_esperada);
        const dataLimite = new Date(recurso.data_limite)

        linhaDoTempoEssencial_graph.push([recurso._id, `Expected`, dataInicial, dataEsperada]);
        linhaDoTempoEssencial_graph.push([recurso._id, `Critical`, dataInicial, dataLimite]);
    });

    const linhaDoTempoAll_graph = [['Resource', 'Resource', 'Start', 'End']];
    linhaDoTempoAll.forEach((recurso) => {
        const dataInicial = new Date(2024, 2, 13);
        const dataEsperada = new Date(recurso.data_esperada);
        const dataLimite = new Date(recurso.data_limite)

        linhaDoTempoAll_graph.push([recurso._id, `Expected`, dataInicial, dataEsperada]);
        linhaDoTempoAll_graph.push([recurso._id, `Critical`, dataInicial, dataLimite]);
    });

    useEffect(() => {
        const dados = [linhaDoTempoEssencial_graph, linhaDoTempoAll_graph]
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

                <div className='centered-container'>
                    <button className='botao-bonito' style={{ width: '10rem', height: !pieEssencial ? '3rem' : '2rem' }} onClick={() => setPieEssencial(!pieEssencial)}>
                        {pieEssencial ? `View all resources` : `View only essential resources`}
                    </button>
                </div>

                {pieEssencial ?
                    (<div style={{ display: 'flex' }} className={pie_container}>
                        <div className={pie_esquerda}>
                            <Chart
                                width={'100%'}
                                height={'400px'}
                                chartType="PieChart"
                                loader={<div>Loading graph</div>}
                                data={planosAPorArea_Essencial_graph}
                                options={{
                                    ...estiloGraph,
                                    title: 'Plan A',
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
                                data={planosBPorArea_Essencial_graph}
                                options={{
                                    ...estiloGraph,
                                    title: 'Plan B',
                                }}
                                rootProps={{ 'data-testid': '1' }}
                            />
                        </div>
                    </div>) : (<div style={{ display: 'flex' }} className={pie_container}>
                        <div className={pie_esquerda}>
                            <Chart
                                width={'100%'}
                                height={'400px'}
                                chartType="PieChart"
                                loader={<div>Loading graph</div>}
                                data={planosAPorArea_all_graph}
                                options={{
                                    ...estiloGraph,
                                    title: 'Plan A',
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
                                data={planosBPorArea_all_graph}
                                options={{
                                    ...estiloGraph,
                                    title: 'Plan B',
                                }}
                                rootProps={{ 'data-testid': '1' }}
                            />
                        </div>
                    </div>)}

                {pieEssencial ? (<div className="centered-container" style={{ flexDirection: "row" }}>
                    <span className={custom_span}>Plan A - Total Cost: R${planosASoma_Essencial}</span>
                    <span className={custom_span}>Plan B - Total Cost: R${planosBSoma_Essencial}</span>
                </div>) : (
                    <div className="centered-container" style={{ flexDirection: "row" }}>
                        <span className={custom_span}>Plan A - Total Cost: R${planosASoma_all}</span>
                        <span className={custom_span}>Plan B - Total Cost: R${planosBSoma_all}</span>
                    </div>
                )}

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
                                                    color: 'black'
                                                },
                                            }
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