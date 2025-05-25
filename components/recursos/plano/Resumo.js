import React, { useState, useEffect, useMemo } from "react";
import { Chart } from 'react-google-charts';
import { fetchData } from '../../../functions/crud';
import Loading from '../../Loading';
import styles from '../../../styles/modules/resumo.module.css'
import { parse } from "path";

const { grafico, pie_direita, pie_esquerda, pie_container, h3_resumo, custom_span } = styles;

const Resumo = () => {
    const [planosSoma_Essencial, setPlanosSoma_Essencial] = useState([]);
    const [planosSoma_all, setPlanosSoma_all] = useState([]);
    const [linhaDoTempoEssencial, setLinhaDoTempoEssencial] = useState([]);
    const [linhaDoTempoAll, setLinhaDoTempoAll] = useState([]);
    const [reservaContingencial, setReservaContingencial] = useState();
    const [planosPorItem, setPlanosPorItem] = useState([]);
    const [verReserves, setVerReserves] = useState(false);
    const [dataInicial, setDataInicial] = useState();

    const [loading, setLoading] = useState(true);
    const [chartHeight, setChartHeight] = useState('100px');
    const [chartDataLoaded, setChartDataLoaded] = useState(false);
    const [cores, setCores] = useState({});

    const [pieEssencial, setPieEssencial] = useState(false);


    //funcao para  buscar os dados par a construcao do resumo
    const fetchResumos = async () => {
        try {
            const data = await fetchData('recursos/planoAquisicao/get/resumo');
            const reservaDeContingencia = await fetchData('riscos/analise/get/emvs')
            const dataMaisAntiga = await fetchData('cronograma/get/dataMaisCedo');
            const data2 = await fetchData('recursos/planoAquisicao/get/planosPorItem');
            setLinhaDoTempoEssencial(data.linhaDoTempoEssencial);
            setPlanosPorItem(data2.planosPorItem);
            setLinhaDoTempoAll(data.linhaDoTempoAll);
            setReservaContingencial(reservaDeContingencia.resultadosAgrupados);
            setDataInicial(dataMaisAntiga.registroMaisAntigo.inicio);
        } finally {
            setLoading(false);
        }
    };

    //funcao para buscar as cores e inseri-las num array de objetos no formato { [area]: cor }
    const fetchCores = async () => {
        const data = await fetchData('wbs/get/cores');
        var cores = {};
        data.areasECores.forEach((area) => {
            cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
        })
        setCores(cores);
    }

    //useEffect que so roda no primeiro render
    useEffect(() => {
        fetchCores();
        fetchResumos();
    }, []);

    //useMemo que so ativa quando planosPorItem for atualizado, que armazena os dados do graph de planosPorArea_Essencial_graph
    const planosPorArea_Essencial_graph = useMemo(() => {
        const graph = [['Area', 'Value']];
        if(planosPorItem.length == 0) return graph;
        var obj = {};
        var somaTotal = 0;
        planosPorItem.forEach((item) => {
            var somaAtual;
            if(obj[item.area]){
                somaAtual = obj[item.area];
            } else {
                somaAtual = 0;
            }
            somaAtual += item.custo_essencial;
            obj = {
                ...obj,
                [item.area]: somaAtual
            }
            somaTotal += item.custo_essencial;
        })
        Object.keys(obj).forEach((key) => {
            graph.push([key, parseFloat(obj[key].toFixed(2))])
        })
        setPlanosSoma_Essencial(somaTotal);
        return graph;
    }, [planosPorItem])


    //useMemo que so ativa quando planosPorItem foi atualizada, que armazena os dados dos graph dos planosPorArea_all e reserve
    const [planosPorArea_all_graph, planosPorArea_reserve_graph] = useMemo(() => {
        const graph_all = [['Area', 'Value']];
        const graph_reserve = [['Area', 'Value']];
        if(planosPorItem.length == 0) return [graph_all, graph_reserve];
        var obj = {};
        var somaTotal = 0;
        planosPorItem.forEach((item) => {
            var somaAtual;
            if(obj[item.area]){
                somaAtual = obj[item.area];
            } else {
                somaAtual = 0;
            }
            somaAtual += item.custo_ideal;
            obj = {
                ...obj,
                [item.area]: somaAtual
            }
            somaTotal += item.custo_ideal;
        })
        Object.keys(obj).forEach((key) => {
            graph_all.push([key, parseFloat(obj[key].toFixed(2))]);
            if (reservaContingencial[key] != undefined) {
                graph_reserve.push([key, parseFloat((obj[key] + reservaContingencial[key]).toFixed(2))]);
            } else {
                graph_reserve.push([key, parseFloat((obj[key]).toFixed(2))]);
            }
        })
        graph_reserve.push(['Managerial Reserve', parseFloat((somaTotal * 0.05).toFixed(2))]);
        setPlanosSoma_all(somaTotal);
        return [graph_all, graph_reserve];
    }, [planosPorItem]);


    //useMemo que so ativa quando linhaDoTempoEssencial atualiza, que armazena os dados de linhaDoTempoEssencial
    const linhaDoTempoEssencial_graph = useMemo(() => {
        const graph = [['Resource', 'Resource', 'Start', 'End']];
        linhaDoTempoEssencial.forEach((recurso) => {
        const dataInicio = new Date(dataInicial);
        const dataEsperada = new Date(recurso.data_esperada);
        const dataLimite = new Date(recurso.data_limite)

        graph.push([recurso._id, `Expected`, dataInicio, dataEsperada]);
        graph.push([recurso._id, `Critical`, dataEsperada, dataLimite]);
    });

    return graph;

    }, [linhaDoTempoEssencial]);        


    //useMemo que so ativa quando linhaDoTempoAll atualiza, que armazena os dados de linhaDoTempoAll
    const linhaDoTempoAll_graph = useMemo(() => {
        const graph = [['Resource', 'Resource', 'Start', 'End']];
        linhaDoTempoAll.forEach((recurso) => {
        const dataInicio = new Date(dataInicial);
        const dataEsperada = new Date(recurso.data_esperada);
        const dataLimite = new Date(recurso.data_limite)

        graph.push([recurso._id, `Expected`, dataInicio, dataEsperada]);
        graph.push([recurso._id, `Critical`, dataEsperada, dataLimite]);
    });

    return graph;
    }, [linhaDoTempoAll]);   


    //useEffect que acontece quando linhaDoTempoEssencial e All graphs atualiza, e quando pieEssencial atualiza, para
    //mudar a altura do grafico gantt
    useEffect(() => {
        let dados;
        if(pieEssencial == true) {
            dados = linhaDoTempoEssencial_graph;
        } else {
            dados = linhaDoTempoAll_graph;
        }
        if (dados.length > 1) {
            const linhaHeight = 30;
            const novaAltura = (((dados.length - 1)/2 * linhaHeight)) + 'px';
            setChartHeight(novaAltura);
            setChartDataLoaded(true);
        }

    }, [linhaDoTempoEssencial_graph, linhaDoTempoAll_graph, pieEssencial]);


    //configuracaoo dos graficos
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
                    <button className='botao-bonito' style={{ width: '10rem', marginTop: '0.1rem' }} onClick={() => setVerReserves(!verReserves)}>
                        {!verReserves ? `View reserves` : `View only resources`}
                    </button>
                </div>

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
                            data={!verReserves ? planosPorArea_all_graph : planosPorArea_reserve_graph}
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
                    <span className={custom_span}>Essential Scenario: R${parseFloat((planosSoma_Essencial)).toFixed(2)}</span>
                    {!verReserves ? (
                        <span className={custom_span}>Ideal Scenario: R${parseFloat((planosSoma_all)).toFixed(2)}</span>
                    ) : (
                        <span className={custom_span}>Ideal Scenario + Reserves: R${parseFloat(planosSoma_all * 1.05 + reservaContingencial.Total).toFixed(2)}</span>
                    )}

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
                                        key={chartHeight}
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
                                        key={chartHeight}
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