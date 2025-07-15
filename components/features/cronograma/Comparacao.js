import { useEffect, useState, useMemo } from 'react';
import { Chart } from 'react-google-charts';
import Loading from '../../ui/Loading';
import { fetchData } from '../../../functions/crud';
import { jsDateToEuDate, euDateToJsDate } from '../../../functions/general';
import chroma from 'chroma-js';

const Tabela = () => {
    const [cronogramas, setCronogramas] = useState([]);
    const [planosCronogramas, setPlanosCronogramas] = useState([]);
    const [chartHeight, setChartHeight] = useState('100px');
    const [chartDataLoaded, setChartDataLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(false);
    const [cores, setCores] = useState({});
    const [paleta, setPaleta] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    //useEffect que so executa quando acontece reload é atualizado
    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchCronogramas();
        }
    }, [reload]);


    //funcao que busca os cronogramas e as cores, trata as datas dos cronogramas,
    //trata as cores e cria a paleta para o grafico
    const fetchCronogramas = async () => {
        try {
            const data = await fetchData('cronograma/get/gantts');
            data.cronogramaGantts.forEach((item) => {
                item.inicio = jsDateToEuDate(item.inicio);
                item.termino = jsDateToEuDate(item.termino);
            });
            setCronogramas(data.cronogramaGantts);

            const data2 = await fetchData('cronograma/get/planos');
            data2.cronogramaPlanos.forEach((item) => {
                item.inicio = jsDateToEuDate(item.inicio);
                item.termino = jsDateToEuDate(item.termino);
            });
            setPlanosCronogramas(data2.cronogramaPlanos);

            const dataCores = await fetchData('wbs/get/cores');

            //adicionar cores na tabela
            var cores = {};
            dataCores.areasECores.forEach((area) => {
                cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
            })

            //adicionar cores no grafico (apenas as cores de areas que tem alguma coisa sendo executada)
            var paleta = [];
            for (const [key, value] of Object.entries(cores)) {
                if (data.cronogramaGantts.some((item) => item.area === key && item.termino !== null)) {
                    paleta.push({
                        "color": value ? chroma(value).darken().saturate(3).hex() : '#000000',
                        "dark": value ? chroma(value).hex() : '#000000',
                        "light": value ? chroma(value).darken().hex() : '#000000'
                    })
                }
            }

            setCores(cores);
            setPaleta(paleta);
        } finally {
            setLoading(false);
        }
    };


    //useEffect que roda apenas no primeiro render
    useEffect(() => {
        fetchCronogramas();
    }, []);


    //funcao que cria a array que sera insa inserida no grafico cantt
    const createGanttData = () => {
        const ganttData = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];
        cronogramas.forEach((item) => {
            console.log(item)
            if (!item.plano) {
                if (euDateToJsDate(item.inicio) < euDateToJsDate(item.termino) &&
                    euDateToJsDate(item.inicio) != null &&
                    euDateToJsDate(item.termino) != null) {

                    const planoDoGantt = planosCronogramas.find(plan => plan.item === item.item && plan.area === item.area);
                    if (planoDoGantt) {
                        var dependencies2 = '';
                        const taskID2 = `${planoDoGantt.area}_${planoDoGantt.item}2`;
                        const taskName2 = planoDoGantt.item;
                        const resource2 = item.area;
                        const startDate2 = euDateToJsDate(planoDoGantt.inicio);
                        const endDate2 = euDateToJsDate(planoDoGantt.termino);
                        if (!planoDoGantt.dp_area && !planoDoGantt.dp_item) {
                            dependencies2 = null;
                        } else {
                            dependencies2 = `${planoDoGantt.dp_area}_${planoDoGantt.dp_item}2`;
                        }
                        ganttData.push([taskID2, taskName2, resource2, startDate2, endDate2, 0, 100, dependencies2]);
                    }

                    var dependencies = '';
                    const taskID = `${item.area}_${item.item}`;
                    const taskName = item.item;
                    const resource = item.area;
                    const startDate = euDateToJsDate(item.inicio);
                    const endDate = euDateToJsDate(item.termino);
                    if (!item.dp_area && !item.dp_item) {
                        dependencies = null;
                    } else {
                        dependencies = `${item.dp_area}_${item.dp_item}`;
                    }
                    ganttData.push([taskID, taskName, resource, startDate, endDate, 0, 100, dependencies]);

                }
            }
        });
        return ganttData;
    };

    //funcao que executa na primeira render e depois so quando cronogramas ou etis atualiza
    //armazenando os dados diretamente nas constantes
    const chartData = useMemo(() => {
        if (cronogramas.length === 0) return [];
        return createGanttData();
    }, [cronogramas, planosCronogramas]);


    //useEffect ativado quando os dados do grafico sao montados para calcular a altura do grafico
    useEffect(() => {
        if (chartData.length > 1) {
            const linhaHeight = 30;
            const novaAltura = ((chartData.length * linhaHeight) + 50) + 'px';
            setChartHeight(novaAltura);
            setChartDataLoaded(true);
        }
    }, [chartData]);

    const tamanhoDaFonte = (num) => {
        if(num <= 13){
            return '0.7rem'
        }
        if(num > 13 && num <= 20){
            return '0.6rem'
        } else {
            return isMobile ? '0.5rem' : '0.6rem'
        }
    }

    const handleResize = () => {
        if (window.innerWidth < 1024) {
        setIsMobile(true)
        } else {
        setIsMobile(false)
        }
    }

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
    }, []);

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2 className='smallTitle'>Planned Schedule vs Reality</h2>

            <div className='centered-container' style={{
                width: "50vw",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                position: 'relative',
            }}>
                <table style={{
                    marginBottom: '80px',
                }}>
                    <tbody style={{ borderColor: 'black', borderStyle: 'solid', borderWidth: '0.01rem' }}>
                        {cronogramas.filter(item =>
                            (item.inicio != item.termino)
                            && (item.inicio != null)
                            && (item.termino != null)
                            && (item.situacao != 'iniciar'))
                            .map((item, index) => (
                                <tr key={index}
                                    style={{
                                        height: '30px',
                                        borderColor: 'black',
                                        borderStyle: 'solid',
                                        borderWidth: '0.01rem',
                                        borderRightWidth: '0rem',
                                        backgroundColor: cores[item.area]
                                    }}>
                                    <td style={{ fontSize: tamanhoDaFonte(item.item.length), minWidth: '6rem', maxWidth: '8rem' }}>{item.item}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                <div className="centered-container" style={{
                    width: isMobile ? "70vw" :"40vw",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    position: 'relative',
                }}>

                    <table style={{
                        position: 'absolute',
                        zIndex: 2,
                        width: '100%'
                    }}>
                        <tbody>
                            {cronogramas.filter(item => (item.inicio != item.termino)
                                && (item.inicio != null)
                                && (item.termino != null)
                                && (item.situacao != 'iniciar')).map((item, index) => (
                                    <tr key={index}
                                        style={{ height: '30px', borderColor: 'black', borderStyle: 'solid', borderWidth: '0.1rem', borderLeftWidth: '0rem' }}>
                                        <td></td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>

                    {chartDataLoaded && (
                        <Chart
                            width={isMobile ? "70vw" :"40vw"}
                            height={chartHeight}
                            chartType="Gantt"
                            loader={<div>Loading Chart</div>}
                            data={chartData}
                            options={{
                                gantt: {
                                    trackHeight: 15,
                                    sortTasks: false,
                                    palette: paleta,
                                    shadowEnabled: false,
                                    criticalPathEnabled: false,
                                    barHeight: 10,
                                    arrow: {
                                        angle: 100,
                                        length: 4,
                                        width: 1,
                                        color: 'black',
                                        radius: 0
                                    },
                                    labelStyle: {
                                        fontSize: 0.01
                                    },
                                    innerGridTrack: {
                                        fill: '#FFFFFF'
                                    },
                                    innerGridDarkTrack: {
                                        fill: '#FFFFFF'
                                    },
                                    innerGridHorizLine: {
                                        strokeWidth: '0',
                                    }
                                },
                            }}
                            style={{
                                position: 'relative',
                                zIndex: 1,
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tabela;