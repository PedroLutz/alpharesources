import { useEffect, useState, useMemo } from 'react';
import { Chart } from 'react-google-charts';
import Loading from '../../ui/Loading';
import { handleFetch } from '../../../functions/crud_s';
import { jsDateToEuDate, euDateToJsDate } from '../../../functions/general';
import useAuth from '../../../hooks/useAuth';
import chroma from 'chroma-js';

const Tabela = () => {
    const { user, token } = useAuth();
    const [cronogramas, setCronogramas] = useState([]);
    const [planosCronogramas, setPlanosCronogramas] = useState([]);
    const [chartHeight, setChartHeight] = useState('100px');
    const [chartDataLoaded, setChartDataLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(false);
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
            const data = await handleFetch({
                table: "gantt",
                query: "monitors",
                token
            });
            data.data.forEach((item) => {
                item.gantt_data[0].start = jsDateToEuDate(item?.gantt_data[0].start);
                item.gantt_data[0].end = jsDateToEuDate(item?.gantt_data[0].end);
            });
            setCronogramas(data.data);

            const data2 = await handleFetch({
                table: "gantt",
                query: "plans",
                token
            });
            data2.data.forEach((item) => {
                item.gantt_data[0].start = jsDateToEuDate(item?.gantt_data[0].start);
                item.gantt_data[0].end = jsDateToEuDate(item?.gantt_data[0].end);
            });
            setPlanosCronogramas(data2.data);

            //adicionar cores na tabela
            var cores = {};
                        data.data.forEach((c) => {
                            cores = { ...cores, [c.wbs_item.wbs_area.name]: c.wbs_item.wbs_area.color ? c.wbs_item.wbs_area.color : '' }
                        })
            
                        var paleta = [];
                        for (const [key, value] of Object.entries(cores)) {
                            if (data.data.some((item) => item.wbs_item.wbs_area.name === key && item.end !== null)) {
                                paleta.push({
                                    "color": value ? chroma(value).darken().saturate(3).hex() : '#000000',
                                    "dark": value ? chroma(value).hex() : '#000000',
                                    "light": value ? chroma(value).darken().hex() : '#000000'
                                })
                            }
                        }

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
            if (!item.gantt_data[0].is_plan) {
                if (euDateToJsDate(item.gantt_data[0].start) < euDateToJsDate(item.gantt_data[0].end) &&
                    euDateToJsDate(item.gantt_data[0].start) != null &&
                    euDateToJsDate(item.gantt_data[0].end) != null) {

                    const planoDoGantt = planosCronogramas.find(plan => plan.id === item.id);
                    console.log(planoDoGantt, item)
                    if (planoDoGantt) {
                        var dependencies2 = '';
                        const taskID2 = `${planoDoGantt.gantt_data[0].id}`;
                        const taskName2 = planoDoGantt.wbs_item.name;
                        const resource2 = planoDoGantt.wbs_item.wbs_area.name;
                        const startDate2 = euDateToJsDate(planoDoGantt.gantt_data[0].start);
                        const endDate2 = euDateToJsDate(planoDoGantt.gantt_data[0].end);
                        if (!planoDoGantt.gantt_dependency[0]) {
                            dependencies2 = null;
                        } else {
                            dependencies2 = `${planosCronogramas.find(plan => plan.id == planoDoGantt.gantt_dependency[0].dependency_id).gantt_data[0].id}`;
                        }
                        ganttData.push([taskID2, taskName2, resource2, startDate2, endDate2, 0, 100, dependencies2]);
                    }

                    var dependencies = '';
                    const taskID = `${item.gantt_data[0].id}`;
                    const taskName = item.wbs_item.name;
                    const resource = item.wbs_item.wbs_area.name;
                    const startDate = euDateToJsDate(item.gantt_data[0].start);
                    const endDate = euDateToJsDate(item.gantt_data[0].end);
                    if (!item.gantt_dependency[0]) {
                        dependencies = null;
                    } else {
                        dependencies = `${cronogramas.find(c => c.id == item.gantt_dependency[0].dependency_id).gantt_data[0].id}`;
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
                            (item.gantt_data[0].start != item.gantt_data[0].end)
                            && (item.gantt_data[0].start != null)
                            && (item.gantt_data[0].end != null)
                            && (item.gantt_data[0].status != 'start'))
                            .map((item, index) => (
                                <tr key={index}
                                    style={{
                                        height: '30px',
                                        borderColor: 'black',
                                        borderStyle: 'solid',
                                        borderWidth: '0.01rem',
                                        borderRightWidth: '0rem',
                                        backgroundColor: item.wbs_item.wbs_area.color
                                    }}>
                                    <td style={{ fontSize: tamanhoDaFonte(item.wbs_item.name.length), minWidth: '6rem', maxWidth: '8rem' }}>{item.wbs_item.name}</td>
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
                            {cronogramas.filter(item => (item.gantt_data[0].start != item.gantt_data[0].end)
                                && (item.gantt_data[0].start != null)
                                && (item.gantt_data[0].end != null)
                                && (item.gantt_data[0].status != 'start')).map((item, index) => (
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