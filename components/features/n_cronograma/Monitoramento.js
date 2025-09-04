import React, { useEffect, useState, useMemo } from 'react';
import Loading from '../../ui/Loading';
import Modal from '../../ui/Modal';
import { Chart } from 'react-google-charts';
import { handleFetch, handleReq } from '../../../functions/crud_s';
import { cleanForm, jsDateToEuDate, isoDateToJsDate } from '../../../functions/general';
import styles from '../../../styles/modules/cronograma.module.css';
import CadastroInputs from './CadastroInputs';
import chroma from 'chroma-js';
import useAuth from '../../../hooks/useAuth';
import usePerm from '../../../hooks/usePerm';

const Tabela = () => {
    const { user, token } = useAuth();
    const { isEditor } = usePerm();

    const [cronogramas, setCronogramas] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const camposVazios = {
        id: "",
        item_id: "",
        is_plan: false,
        gantt_id: "",
        start: "",
        end: "",
        dependency_id: "",
        status: ""
    }
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [filtroAreaSelecionada, setFiltroAreaSelecionada] = useState('');
    const [itemSelecionado, setItemSelecionado] = useState('');
    const [mostrarTabela, setMostrarTabela] = useState(false);
    const [confirmUpdateTask, setConfirmUpdateTask] = useState();
    const [chartHeight, setChartHeight] = useState('');
    const [chartDataLoaded, setChartDataLoaded] = useState(false);
    const [paleta, setPaleta] = useState([]);
    const [report, setReport] = useState([]);

    const handleUpdateClick = (item) => {
        setNovosDados({
            id: item.gantt_data[0].id,
            item_id: item.wbs_item.id,
            is_plan: false,
            gantt_id: item.id,
            start: item?.gantt_data[0]?.start,
            end: item?.gantt_data[0]?.end,
            dependency_id: item.gantt_dependency[0] ? item?.gantt_dependency[0]?.dependency_id : "",
            status: item.gantt_data[0].status
        });
    };

    const fetchCronogramas = async () => {
        setLoaded(false);
        setLoading(true);
        try {
            const data = await handleFetch({
                table: "gantt",
                query: "monitors",
                token
            })
            setCronogramas(data.data);

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
            generateReport();
            setLoaded(true);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCronogramas();
    }, [])

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

    const labelsSituacao = {
        start: 'Starting',
        executing: 'Executing',
        complete: 'Completed',
    }

    const handleUpdateItem = async () => {
        setLoading(true);
        const updatedData = {
            ...novosDados
        };

        delete updatedData?.dependency_id;
        delete updatedData?.dp_item;
        delete updatedData?.item_id;
        if (novosDados) {
            try {
                await handleReq({
                    table: 'gantt_data',
                    route: 'update',
                    token,
                    data: updatedData,
                    fetchData: fetchCronogramas
                });
            } catch (error) {
                console.error("Update failed:", error);
            }
        }
        cleanForm(novosDados, setNovosDados, camposVazios);
        setLinhaVisivel();
        setLoading(false);
    };

    const createGanttData = () => {
        const ganttData = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];

        cronogramas.forEach((item) => {
            if (!item.gantt_data[0].is_plan && item.gantt_data[0].start && item.gantt_data[0].end) {
                var dependencies = ''
                const taskID = `${item.id}`;
                const taskName = item.wbs_item.name;
                const resource = item.wbs_item.wbs_area.name;
                const startDate = isoDateToJsDate(item.gantt_data[0].start);
                const endDate = isoDateToJsDate(item.gantt_data[0].end);
                if (!item.gantt_dependency[0]) {
                    dependencies = null;
                } else {
                    dependencies = `${item.gantt_dependency[0].dependency_id}`;
                }
                ganttData.push([taskID, taskName, resource, startDate, endDate, 10, 100, dependencies]);
            }
        });

        return ganttData;
    };

    //funcao que executa na primeira render e depois so quando cronogramas ou etis atualiza
    //armazenando os dados diretamente nas constantes
    const chartData = useMemo(() => {
        if (cronogramas.length === 0) return [[], []];
        return createGanttData();
    }, [cronogramas]);

    useEffect(() => {
        if (chartData.length > 1) {
            const linhaHeight = isMobile ? 20 : 30;
            const novaAltura = ((chartData.length * linhaHeight) + 50) + 'px';
            setChartHeight(novaAltura);
            setChartDataLoaded(true);
        }
    }, [chartData]);

    const handleAtualizarTarefa = async (status) => {
        if (itemSelecionado === '') {
            setExibirModal('semtarefa');
            return;
        }

        try {
            const itemParaAtualizar = cronogramas.find(
                (item) =>
                    item.wbs_item.id == itemSelecionado
            );

            if (!itemParaAtualizar) {
                setExibirModal('semtarefa');
                return;
            }

            if (itemParaAtualizar.status === 'complete') {
                setExibirModal('tarefaConcluida')
                return;
            }

            if (status !== 'executing' && itemParaAtualizar.status === 'start') {
                setExibirModal('tarefaNaoIniciada')
                return;
            }

            const today = new Date();
            const formattedDate = today
                .toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
                .split(',')[0];

            var updatedItem = { id: itemParaAtualizar.gantt_data[0]?.id, user_id: user.id };

            switch (status) {
                case 'executing': {
                    updatedItem = {
                        ...updatedItem,
                        start: formattedDate,
                        status: status
                    };
                    break;
                }

                case 'check': {
                    updatedItem = {
                        ...updatedItem,
                        end: formattedDate,
                    };
                    break;
                }

                case 'complete': {
                    updatedItem = {
                        ...updatedItem,
                        end: formattedDate,
                        status: status
                    };
                    break;
                }

                case 'reset': {
                    updatedItem = {
                        ...updatedItem,
                        start: null,
                        end: null,
                        status: 'start'
                    }
                    break;
                }

            }

            await handleReq({
                table: 'gantt_data',
                route: 'update',
                token,
                data: updatedItem,
                fetchData: fetchCronogramas
            });
        } catch (error) {
            console.error('Erro ao atualizar a situação do cronograma', error);
        }
    };

    const calculateRowSpan = (itens, currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < itens.length; i++) {
            if (itens[i].wbs_item.wbs_area.name === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    const findGanttById = (id) => {
        return cronogramas.find((c) => c.id == id);
    }

    const findGanttByItemId = (id) => {
        return cronogramas.find((c) => c.wbs_item.id == id);
    }

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'depFaltando': 'Please select the dependencies correctly!',
        'dpNotOkay': "The predecessor must finish before the successor starts!",
        'datasErradas': 'The finishing date must be after the starting date!',
        'semtarefa': 'Select a task to update.',
        'tarefaConcluida': "You can't update a task you've already completed!",
        'tarefaNaoIniciada': "You can't update a task you haven't started yet!"
    };

    const generateReport = async () => {
        const responsePlano = await handleFetch({
            table: "gantt",
            query: "startAndEndPlans",
            token
        });
        const responseGantt = await handleFetch({
            table: "gantt",
            query: "startAndEndMonitors",
            token
        });
        const responseSituacoesGantt = await handleFetch({
            table: "gantt",
            query: "monitorsAndStatus",
            token
        });
        const dadosPlano = responsePlano.data;
        const dadosGantt = responseGantt.data;
        const dadosSituacoesGantt = responseSituacoesGantt.data;

        var primeiroEUltimoPlanos = [];
        var primeiroEUltimoGantts = [];
        const areas = new Map(dadosPlano.map(item => [item.wbs_item.wbs_area.id, {id: item.wbs_item.wbs_area.id, name: item.wbs_item.wbs_area.name}]).values())
        areas.forEach((area) => {
            {
                const primeiroInicio = dadosPlano.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                            .reduce((min, obj) => obj.gantt_data[0].start < min.gantt_data[0].start ? obj : min);
                const ultimoTermino = dadosPlano.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                            .reduce((max, obj) => obj.gantt_data[0].end > max.gantt_data[0].end ? obj : max);
                primeiroEUltimoPlanos.push({primeiro: primeiroInicio, ultimo: ultimoTermino});
                
            }
            {
                const primeiroInicio = dadosGantt.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                            .reduce((min, obj) => obj.gantt_data[0].start < min.gantt_data[0].start ? obj : min);
                const ultimoTermino = dadosGantt.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                            .reduce((max, obj) => obj.gantt_data[0].end > max.gantt_data[0].end ? obj : max);
                primeiroEUltimoGantts.push({primeiro: primeiroInicio, ultimo: ultimoTermino});
            }
        })

        var objSituacao = {}
        dadosSituacoesGantt.ganttPorArea.forEach((dado) => {
            if (dado.itens.filter((item) => item?.status === "executing").length === 0 &&
                dado.itens.filter((item) => item?.status === "start").length === 0) {
                objSituacao = { ...objSituacao, [dado.area]: "Complete" }
            }
            else if (dado.itens.filter((item) => item?.status === "executing").length === 0 &&
                dado.itens.filter((item) => item?.status === "start").length > 0 &&
                dado.itens.filter((item) => item?.status === 'complete').length > 0) {
                objSituacao = { ...objSituacao, [dado.area]: "Hold" }
            }
            else if (dado.itens.filter((item) => item?.status === "executing").length > 0) {
                objSituacao = { ...objSituacao, [dado.area]: "Executing" }
            }
            else if (dado.itens.filter((item) => item?.status === "executing").length === 0 &&
                dado.itens.filter((item) => item?.status === "complete").length === 0) {
                objSituacao = { ...objSituacao, [dado.area]: "To Begin" }
            }
        })

        var duplas = [];
        primeiroEUltimoPlanos.forEach((dado) => {
            const gantt = primeiroEUltimoGantts.find(o => o.primeiro.id === dado.primeiro.id);
            duplas.push([dado, gantt])
        })

        let arrayAnalise = [];
        duplas.forEach((dupla) => {
            const area = dupla[0].ultimo.wbs_item.wbs_area.name;
            const planoUltimo = dupla[0].ultimo;
            const ganttUltimo = dupla[1].ultimo;
            const hoje = new Date().toISOString();
            var obj = { area: area, state: objSituacao[area] }


            //executing
            if (objSituacao[area] === "Executing") {
                if (planoUltimo.gantt_data[0].end >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //hold
            if (objSituacao[area] === "Hold") {
                if (planoUltimo.gantt_data[0].end >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //complete
            if (objSituacao[area] === "Complete") {
                if (planoUltimo.gantt_data[0].end >= ganttUltimo.gantt_data[0].end) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //to begin
            if (objSituacao[area] === "To Begin") {
                if (planoUltimo.gantt_data[0].end >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }
        })
        setReport(arrayAnalise)
    }

    const chartEvents = [
        {
            eventName: "error",
            callback: ({ eventArgs }) => {
                setChartDataLoaded(false);
            },
        },
    ];


    return (
        <div className='centered-container'>
            {loading && <Loading />}

            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}

            {confirmUpdateTask && (
                <Modal objeto={{
                    titulo: confirmUpdateTask.complete ?
                        `Are you sure you want to complete "${findGanttByItemId(confirmUpdateTask.item).wbs_item.wbs_area.name} - ${findGanttByItemId(confirmUpdateTask.item).wbs_item.name}"?` :
                        `Are you sure you want to reset the dates of "${findGanttByItemId(confirmUpdateTask.item).wbs_item.wbs_area.name} - ${findGanttByItemId(confirmUpdateTask.item).wbs_item.name}"?`,
                    botao1: {
                        funcao: () => { handleAtualizarTarefa(confirmUpdateTask.delete ? 'complete' : 'reset'); setConfirmUpdateTask(null) }, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmUpdateTask(null), texto: 'Cancel'
                    }
                }} />
            )}

            <h2 className='smallTitle'>Timeline Monitoring</h2>

            {chartDataLoaded ? (
                <div style={{ width: '90%', height: chartHeight }}>
                    <Chart
                        key={isMobile ? "mobile" : "desktop"}
                        height="100%"
                        width="100%"
                        chartType="Gantt"
                        loader={<div>Loading Chart</div>}
                        data={chartData}
                        chartEvents={chartEvents}
                        options={{
                            gantt: {
                                trackHeight: isMobile ? 20 : 30,
                                barHeight: isMobile ? 10 : null,
                                arrow: {
                                    length: isMobile ? 0 : 8
                                },
                                sortTasks: false,
                                palette: paleta,
                                shadowEnabled: false,
                                criticalPathEnabled: false,
                                labelMaxWidth: isMobile ? 0 : 300
                            },
                        }}
                    />
                </div>
            ) : (
                <div className={styles.quickUpdate} style={{ marginBottom: '1rem' }}>
                    <h4>Error while loading Gantt Chart!</h4>
                    <div>
                        Possible causes:<br /><br />
                        • None of the tasks have both start and end dates <br />
                        • A task might have dates, but the task it depends <br /> on does not<br /><br />
                        Please check your data to see if any of these cases apply. <br />
                        If not, please contact the developer. Thanks!
                    </div>
                </div>
            )}
            <div className={styles.quickUpdate}>
                <h4>Quick update</h4>
                <div>
                    <select
                        name="area"
                        value={filtroAreaSelecionada}
                        onChange={(e) => {
                            setFiltroAreaSelecionada(e.target.value);
                            setItemSelecionado('');
                        }}
                        required
                    >
                        <option value="" disabled>Select an area</option>
                        {[...new Set(cronogramas.map((item) => item.wbs_item.wbs_area.name))].map((area, index) => (
                            <option key={index} value={area}>
                                {area}
                            </option>
                        ))}
                    </select>
                    <select
                        name="item"
                        value={itemSelecionado}
                        onChange={(e) => {
                            setItemSelecionado(e.target.value);
                            setExibirModal(null);
                        }}
                        required
                    >
                        <option value="" disabled>Select an item</option>
                        {cronogramas
                            .filter((item) => item.wbs_item.wbs_area.name === filtroAreaSelecionada)
                            .map((item, index) => (
                                <option key={index} value={item.wbs_item.id}>
                                    {item.wbs_item.name}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <button onClick={() => handleAtualizarTarefa('executing')} disabled={!isEditor}>
                        Start task
                    </button>
                    <button onClick={() => handleAtualizarTarefa('check')} disabled={!isEditor}>
                        Check execution
                    </button>
                    <button onClick={() => {
                        itemSelecionado ? setConfirmUpdateTask({ item: itemSelecionado, complete: true }) : setExibirModal('semtarefa')
                    }} disabled={!isEditor}>
                        Complete task
                    </button>
                    <button onClick={() => {
                        itemSelecionado ? setConfirmUpdateTask({ item: itemSelecionado, complete: false }) : setExibirModal('semtarefa')
                    }} disabled={!isEditor}>
                        Reset dates
                    </button>
                </div>
            </div>


            <button className="botao-padrao"
                style={{ marginTop: '20px' }}
                onClick={() => {
                    setMostrarTabela(!mostrarTabela);
                }}>
                {mostrarTabela ? 'Hide table' : 'Show table'}
            </button>

            {mostrarTabela && (
                <div>
                    <div className={styles.tabelaCronograma_container}>
                        <div className={styles.tabelaCronograma_wrapper}>
                            <table className={`${styles.tabelaCronograma} tabela`}>
                                <thead>
                                    <tr>
                                        <th>Area</th>
                                        <th>Task</th>
                                        <th>Start</th>
                                        <th>End</th>
                                        <th>Dependency: Area</th>
                                        <th>Dependency: Item</th>
                                        <th>Situation</th>
                                        <th>Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cronogramas.map((item, index) => (
                                        <tr key={index} style={{ backgroundColor: item.wbs_item.wbs_area.color }}>
                                            {index === 0 || cronogramas[index - 1].wbs_item.wbs_area.name !== item.wbs_item.wbs_area.name ? (
                                                <td rowSpan={calculateRowSpan(cronogramas, item.wbs_item.wbs_area.name, index)}
                                                >{item.wbs_item.wbs_area.name}</td>
                                            ) : null}
                                            <td>{item.wbs_item.name}</td>
                                            {linhaVisivel === item.id ? (
                                                <CadastroInputs
                                                    tipo="updatemonitoring"
                                                    gantt={true}
                                                    obj={novosDados}
                                                    objSetter={setNovosDados}
                                                    funcoes={{
                                                        enviar: handleUpdateItem,
                                                        cancelar: () => setLinhaVisivel(),
                                                        setLoading,
                                                        findGanttById,
                                                        findGanttByItemId
                                                    }}
                                                    setExibirModal={setExibirModal} />
                                            ) : (
                                                <React.Fragment>
                                                    <td>{jsDateToEuDate(item.gantt_data[0].start) || '-'}</td>
                                                    <td>{jsDateToEuDate(item.gantt_data[0].end) || '-'}</td>
                                                    <td>{item.gantt_dependency[0]?.dependency_id ? cronogramas.find(t => t.id == item.gantt_dependency[0]?.dependency_id).wbs_item.wbs_area.name : '-'}</td>
                                                    <td>{item.gantt_dependency[0]?.dependency_id ? cronogramas.find(t => t.id == item.gantt_dependency[0]?.dependency_id).wbs_item.name : '-'}</td>
                                                    <td>{labelsSituacao[item.gantt_data[0].status] || '-'}</td>
                                                    <td className='botoes_acoes'>
                                                        <button onClick={() => {
                                                            setLinhaVisivel(item.id); handleUpdateClick(item)
                                                        }} disabled={!isEditor}>⚙️</button>
                                                    </td>
                                                </React.Fragment>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={`${styles.areaAnalysis}`}>
                        <table className='tabela'>
                            <thead>
                                <tr>
                                    <th>Area</th>
                                    <th>State</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.map((area, index) => (
                                    <tr key={index}>
                                        <td>{area.area}</td>
                                        <td
                                            style={{
                                                backgroundColor:
                                                    area.state === 'To Begin' ? '#ffc6c6' : (
                                                        area.state === 'Complete' ? '#d8ffc6' : (
                                                            area.state === 'Hold' ? '#e1e1e1' : '#cdf2ff'
                                                        )
                                                    ),
                                            }}>{area.state}</td>
                                        <td
                                            style={{
                                                backgroundColor:
                                                    area.status === 'Overdue' ? '#ffc6c6' : '#d8ffc6'
                                            }}>{area.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>

            )}

        </div>
    )
}

export default Tabela;