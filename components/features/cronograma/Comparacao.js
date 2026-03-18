import React, { useEffect, useState, useMemo } from 'react';
import { Chart } from 'react-google-charts';
import Loading from '../../ui/Loading';
import { handleFetch } from '../../../functions/crud_s';
import { jsDateToEuDate, euDateToJsDate, isoDateToJsDate } from '../../../functions/general';
import useAuth from '../../../hooks/useAuth';
import chroma from 'chroma-js';
import HelpBubble from '../../ui/HelpBubble/cronograma/Comparacao';
import Link from 'next/link';
import styles from "../../../styles/modules/cronograma.module.css"
import { getTextColor } from '../../../functions/colors';

const Tabela = () => {
    const { token } = useAuth();
    const [cronogramas, setCronogramas] = useState([]);
    const [planosCronogramas, setPlanosCronogramas] = useState([]);
    const [chartHeight, setChartHeight] = useState('100px');
    const [chartDataLoaded, setChartDataLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(false);
    const [paleta, setPaleta] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showDates, setShowDates] = useState(false);

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
            const ganttMonitors = data.data;
            ganttMonitors.sort((a, b) => {
                if (a.wbs_item.wbs_area.name != b.wbs_item.wbs_area.name) {
                    return a.wbs_item.wbs_area.name > b.wbs_item.wbs_area.name
                }

                return isoDateToJsDate(a.gantt_data[0].start) > isoDateToJsDate(b.gantt_data[0].start)
            })
            const cronogramasShouldBeGraphed = [];
            ganttMonitors.forEach((item) => {
                item.gantt_data[0].start = jsDateToEuDate(item?.gantt_data[0].start);
                item.gantt_data[0].end = jsDateToEuDate(item?.gantt_data[0].end);
                if (euDateToJsDate(item.gantt_data[0].start) < euDateToJsDate(item.gantt_data[0].end) &&
                    item.gantt_data[0].start != null &&
                    item.gantt_data[0].end != null &&
                    item.gantt_data[0].status != 'start') {
                    cronogramasShouldBeGraphed.push(item);
                }
            });

            setCronogramas(cronogramasShouldBeGraphed);

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
            ganttMonitors.forEach((c) => {
                cores = { ...cores, [c.wbs_item.wbs_area.name]: c.wbs_item.wbs_area.color ? c.wbs_item.wbs_area.color : '' }
            })

            var paleta = [];
            for (const [key, value] of Object.entries(cores)) {
                if (ganttMonitors.some((item) => item.wbs_item.wbs_area.name === key && item.gantt_data[0].end !== null)) {
                    paleta.push({
                        "color": '#000000',
                        "dark": value ? chroma(value).hex() : '#000000',
                        "light": value ? chroma(value).hex() : '#000000',
                    })
                    paleta.push({
                        "color": '#000000',
                        "dark": value ? chroma(value).darken(1).hex() : '#000000',
                        "light": value ? chroma(value).darken(1).hex() : '#000000',
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

                const planoDoGantt = planosCronogramas.find(plan => plan.id === item.id);
                if (planoDoGantt) {
                    var dependencies2 = '';
                    const taskID2 = `${planoDoGantt.gantt_data[0].id}`;
                    const taskName2 = planoDoGantt.wbs_item.name;
                    const resource2 = planoDoGantt.wbs_item.wbs_area.name + "p"; //p for planned
                    const startDate2 = euDateToJsDate(planoDoGantt.gantt_data[0].start);
                    const endDate2 = euDateToJsDate(planoDoGantt.gantt_data[0].end);
                    if (!planoDoGantt.gantt_dependency[0]) {
                        dependencies2 = null;
                    } else {
                        dependencies2 = `${planosCronogramas.find(plan => plan.id == item.gantt_dependency[0].dependency_id).gantt_data[0].id}`;
                    }
                    ganttData.push([taskID2, taskName2, resource2, startDate2, endDate2, 0, 100, dependencies2]);
                }

                var dependencies = '';
                const taskID = `${item.gantt_data[0].id}`;
                const taskName = item.wbs_item.name;
                const resource = item.wbs_item.wbs_area.name + "r"; //r for real
                const startDate = euDateToJsDate(item.gantt_data[0].start);
                const endDate = euDateToJsDate(item.gantt_data[0].end);
                if (!item.gantt_dependency[0]) {
                    dependencies = null;
                } else {
                    dependencies = `${cronogramas.find(c => c.id == item.gantt_dependency[0].dependency_id).gantt_data[0].id}`;
                }
                ganttData.push([taskID, taskName, resource, startDate, endDate, 0, 100, dependencies]);


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
        if (num <= 13) {
            return '0.7rem'
        }
        if (num > 13 && num <= 20) {
            return '0.6rem'
        } else {
            return isMobile ? '0.5rem' : '0.6rem'
        }
    }

    const reduceLabel = (text) => {
        return [...text].reduce((acc, cur) => {
            if (cur === cur.toUpperCase() && cur !== " ") {
                acc += cur;
                acc = acc + ". "
            }
            return acc;
        }, "")
    }


    useEffect(() => {
        setIsMobile(window.innerWidth < 1024);
        window.addEventListener("resize", () => setIsMobile(window.innerWidth < 1024));
    }, []);

    const calculateRowSpan = (currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < cronogramas.length; i++) {
            if (cronogramas[i].wbs_item.wbs_area.id === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className='smallTitle'>Planned Schedule vs Reality <button onClick={() => setShowHelp(true)}>❔</button></h2>
            <button className='botao-bonito' onClick={() => setShowDates(!showDates)}>{!showDates ? 'View dates' : 'Hide dates'}</button>

            {cronogramas.length > 0 ? (
                <div className='centered-container' style={{
                    width: "50vw",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    position: 'relative',
                }}>
                    <table style={{
                        marginBottom: '78px',
                        borderBottom: "0.15rem solid black"
                    }}>
                        <tbody style={{ borderColor: 'black', borderStyle: 'solid', borderWidth: '0.01rem' }}>
                            {cronogramas
                                .map((item, index) => {
                                    const isFirstOfArea = index === 0 || cronogramas[index - 1].wbs_item.wbs_area.id !== item.wbs_item.wbs_area.id;
                                    const plan = planosCronogramas.find((item_) => item_.wbs_item.id === item.wbs_item.id);

                                    const trStyle = {
                                        height: showDates ? '15px' : '30px',
                                        borderColor: 'black',
                                        borderStyle: 'solid',
                                        borderWidth: '0.01rem',
                                        borderRightWidth: '0rem',
                                        backgroundColor: item.wbs_item.wbs_area.color,
                                        color: getTextColor(item.wbs_item.wbs_area.color),
                                    }

                                    const firstOfAreaStyle = isFirstOfArea && {
                                        borderTopStyle: "solid",
                                        borderTopWidth: "0.15rem"
                                    };

                                    const areaName = item.wbs_item.wbs_area.name;
                                    const areaFontSize = tamanhoDaFonte(areaName.length < 28 ? areaName.length : reduceLabel(areaName).length);
                                    const areaLabel = areaName.length < 28 ? areaName : reduceLabel(areaName);

                                    const itemName = item.wbs_item.name;
                                    const itemFontSize = tamanhoDaFonte(itemName.length < 28 ? itemName.length : reduceLabel(itemName).length);
                                    const itemLabel = itemName.length < 28 ? itemName : reduceLabel(itemName);
                                    return (
                                        <React.Fragment key={index}>
                                            <tr
                                                style={trStyle}>
                                                {isFirstOfArea ? (
                                                    <td style={{
                                                        fontSize: areaFontSize, minWidth: '6rem', maxWidth: '8rem', borderRightWidth: '0.1rem', borderRightStyle: 'solid',
                                                        ...firstOfAreaStyle
                                                    }}
                                                        rowSpan={calculateRowSpan(item.wbs_item.wbs_area.id, index) * (showDates ? 2 : 1)}
                                                    >{areaLabel}</td>
                                                ) : null}
                                                <td rowSpan={showDates ? 2 : 1} style={{ fontSize: itemFontSize, minWidth: '6rem', maxWidth: '8rem', ...firstOfAreaStyle }}
                                                >{itemLabel}</td>
                                                {showDates && (
                                                    <>
                                                        <td style={{ fontSize: '0.6rem', ...firstOfAreaStyle }}>Planned</td>
                                                        <td style={{ fontSize: '0.6rem', ...firstOfAreaStyle }}>{plan?.gantt_data[0].start}</td>
                                                        <td style={{ fontSize: '0.6rem', ...firstOfAreaStyle }}>{plan?.gantt_data[0].end}</td>
                                                    </>
                                                )}

                                            </tr>
                                            {showDates && (
                                                <tr style={trStyle}>
                                                    <td style={{ fontSize: '0.6rem' }}>Actual</td>
                                                    <td style={{ fontSize: '0.6rem' }}>{item.gantt_data[0].start}</td>
                                                    <td style={{ fontSize: '0.6rem' }}>{item.gantt_data[0].end}</td>
                                                </tr>
                                            )}

                                        </React.Fragment>
                                    )
                                })}
                        </tbody>
                    </table>
                    <div className="centered-container" style={{
                        width: isMobile ? "70vw" : "40vw",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        position: 'relative',
                    }}>

                        <table style={{
                            position: 'absolute',
                            zIndex: 2,
                            width: '100%',
                            borderBottom: "0.15rem solid black",
                        }}>
                            <tbody>
                                {cronogramas.map((item, index) => {
                                    const isFirstOfArea = index === 0 || cronogramas[index - 1].wbs_item.wbs_area.id !== item.wbs_item.wbs_area.id;
                                    return (
                                        <tr key={index}
                                            style={{
                                                height: '30px', borderStyle: 'solid', borderWidth: '0.1rem', borderLeftWidth: '0rem',
                                                borderBottomColor: '#b4b4b4',
                                                borderTopStyle: (isFirstOfArea) && "solid",
                                                borderTopWidth: (isFirstOfArea) && "0.15rem",
                                                borderTopColor: (isFirstOfArea) ? "black" : '#696969',
                                            }}>
                                            <td></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {chartDataLoaded && (
                            <Chart
                                width={isMobile ? "70vw" : "40vw"}
                                height={chartHeight}
                                chartType="Gantt"
                                loader={<div>Loading Chart</div>}
                                data={chartData}
                                options={{
                                    gantt: {
                                        backgroundColor: {
                                            fill: "transparent"
                                        },
                                        trackHeight: 15,
                                        sortTasks: false,
                                        palette: paleta,
                                        shadowEnabled: false,
                                        criticalPathEnabled: false,
                                        barHeight: 10,
                                        arrow: {
                                            angle: 30,
                                            length: 4,
                                            width: 1,
                                            color: 'black',
                                            radius: 10
                                        },
                                        labelStyle: {
                                            fontSize: 0.01
                                        },
                                        innerGridTrack: {
                                            fill: 'transparent'
                                        },
                                        innerGridDarkTrack: {
                                            fill: 'white'
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
            ) : (
                <div className={styles.quickUpdate} style={{ marginBottom: '1rem' }}>
                    <div>
                        No data available for this graph. <br />
                        Please register all items in <Link href="pags/timeline/timeline_plan">Estimated Timeline</Link><br />
                        and use <Link href="pags/timeline/monitoring">Timeline Monitoring</Link>.
                    </div>
                </div>
            )}

        </div>
    );
};

export default Tabela;