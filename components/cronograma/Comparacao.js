import React, { useEffect, useState, useContext } from 'react';
import { Chart } from 'react-google-charts';
import Loading from '../Loading';
import Modal from '../Modal';
import { fetchData, handleDelete, handleUpdate } from '../../functions/crud';
import { jsDateToEuDate, euDateToJsDate, euDateToIsoDate, cleanForm } from '../../functions/general';
import styles from '../../styles/modules/cronograma.module.css';
import CadastroInputs from './CadastroInputs';
import chroma from 'chroma-js';
import { AuthContext } from "../../contexts/AuthContext";

const Tabela = () => {
    const [cronogramas, setCronogramas] = useState([]);
    const [planosCronogramas, setPlanosCronogramas] = useState([]);
    const [deleteInfo, setDeleteInfo] = useState({ success: false, item: null });
    const [filtroAreaSelecionada, setFiltroAreaSelecionada] = useState('');
    const [filtroAreaResetarData, setFiltroAreaResetarData] = useState('');
    const [itemSelecionado, setItemSelecionado] = useState('');
    const [itemSelecionadoResetar, setItemSelecionadoResetar] = useState('');
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmResetData, setConfirmResetData] = useState(false);
    const [report, setReport] = useState([])
    const [exibirModal, setExibirModal] = useState(null);
    const [mostrarTabela, setMostrarTabela] = useState(false);
    const [chartHeight, setChartHeight] = useState('100px');
    const [chartDataLoaded, setChartDataLoaded] = useState(false);
    const [confirmCompleteTask, setConfirmCompleteTask] = useState(false);
    const [loading, setLoading] = useState(true);
    const [linhaVisivel, setLinhaVisivel] = useState({});
    const [reload, setReload] = useState(false);
    const [cores, setCores] = useState({});
    const camposVazios = {
        plano: '',
        item: '',
        area: '',
        inicio: '',
        termino: '',
        dp_item: '',
        dp_area: '',
        situacao: '',
    }
    const [novosDados, setNovosDados] = useState(camposVazios);
    const { isAdmin } = useContext(AuthContext);

    const labelsSituacao = {
        iniciar: 'Starting',
        emandamento: 'Executing',
        concluida: 'Completed',
    }

    const handleAtualizarTarefa = async (situacao) => {
        if (itemSelecionado === '') {
            setExibirModal('semtarefa');
            return;
        }

        try {
            const itemParaAtualizar = cronogramas.find(
                (item) =>
                    item.area.toLowerCase() === filtroAreaSelecionada.toLowerCase() &&
                    item.item === itemSelecionado &&
                    !item.plano
            );

            if (!itemParaAtualizar) {
                setExibirModal('semtarefa');
                return;
            }

            if (itemParaAtualizar.situacao === 'concluida') {
                setExibirModal('tarefaConcluida')
                return;
            }

            if (situacao !== 'em andamento' && itemParaAtualizar.situacao === 'iniciar') {
                setExibirModal('tarefaNaoIniciada')
                return;
            }

            const today = new Date();
            const formattedDate = today.
                toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
                .split(',')[0];

            var updatedItem;

            if (situacao === 'em andamento') {
                updatedItem = {
                    inicio: formattedDate,
                    situacao: situacao
                };
            } else if (situacao === 'check') {
                updatedItem = {
                    termino: formattedDate,
                };
            } else if (situacao === 'concluida') {
                updatedItem = {
                    termino: formattedDate,
                    situacao: situacao
                };
            }

            await handleUpdate({
                route: 'cronograma',
                dados: updatedItem,
                item: itemParaAtualizar
            });

            fetchCronogramas();
            setReload(true);
        } catch (error) {
            console.error('Erro ao atualizar a situação do cronograma', error);
        }
    };

    const handleResetarData = async () => {
        if (itemSelecionadoResetar === '') {
            setExibirModal('semtarefa');
            return;
        }

        try {
            const itemParaAtualizar = cronogramas.find(
                (item) =>
                    item.area.toLowerCase() === filtroAreaResetarData.toLowerCase() &&
                    item.item === itemSelecionadoResetar &&
                    !item.plano
            );

            console.log(itemParaAtualizar)

            if (!itemParaAtualizar) {
                setExibirModal('semtarefa');
                return;
            }

            var updatedItem = {
                inicio: null,
                termino: null
            }

            await handleUpdate({
                route: 'cronograma',
                dados: updatedItem,
                item: itemParaAtualizar
            });
            setConfirmResetData(false)

            fetchCronogramas();
            setReload(true);
        } catch (error) {
            console.error('Erro ao atualizar a situação do cronograma', error);
        }
    }

    const fetchCores = async () => {
        const data = await fetchData('wbs/get/cores');
        var cores = {};
        data.areasECores.forEach((area) => {
            cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
        })
        setCores(cores);
    }

    useEffect(() => {
        setReload(false);
        fetchCronogramas();
        fetchCores();
    }, [reload]);

    const handleClick = (item) => {
        setDeleteInfo({ success: false, item });
    };

    const checkDados = (tipo) => {
        setExibirModal(tipo); return;
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'dadosUsados': 'This item is already registered in the timelines!',
        'depFaltando': 'Please select the dependencies correctly!',
        'dpNotUsed': "The item you've selected as predecessor is not registered!",
        'dpNotOkay': "The predecessor must finish before the successor starts!",
        'datasErradas': 'The finishing date must be after the starting date!',
        'semtarefa': 'Select a task to update.',
        'tarefaConcluida': "You can't update a task you've already completed!",
        'tarefaNaoIniciada': "You can't update a task you haven't started yet!"
    };

    const generateReport = async () => {
        const responsePlano = await fetchData('cronograma/get/startAndEndPlano');
        const responseGantt = await fetchData('cronograma/get/startAndEndGantt');
        const dadosPlano = responsePlano.resultadosPlano;
        const dadosGantt = responseGantt.resultadosGantt;
        var duplas = [];
        dadosPlano.forEach((dado) => {
            const gantt = dadosGantt.find(o => o.area === dado.area);
            duplas.push([dado, gantt])
        })

        let arrayAnalise = [];
        duplas.forEach((dupla) => {
            const area = dupla[0].area;
            const planoUltimo = dupla[0].ultimo;
            const ganttPrimeiro = dupla[1].primeiro;
            const ganttUltimo = dupla[1].ultimo;
            const hoje = new Date().toISOString();

            //executing
            if (ganttUltimo.situacao === "em andamento") {
                var obj = { area: area, state: 'Executing' }
                if (planoUltimo.termino >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //hold
            if ((planoUltimo.item !== ganttUltimo.item && ganttUltimo.situacao === 'concluida')) {
                var obj = { area: area, state: 'Hold' }
                if (planoUltimo.termino >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //complete
            if (planoUltimo.item === ganttUltimo.item && ganttUltimo.situacao === 'concluida') {
                var obj = { area: area, state: 'Complete' }
                if (planoUltimo.termino >= ganttUltimo.termino) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //to begin
            if (ganttPrimeiro.inicio === null && ganttUltimo.termino === null) {
                var obj = { area: area, state: 'To Begin' }
                if (planoUltimo.termino >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }
        })
        setReport(arrayAnalise)
    }

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
        } finally {
            generateReport();
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchCronogramas();
        fetchCores();
    }, []);

    const handleConfirmDelete = () => {
        if (deleteInfo.item) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = handleDelete({
                    route: 'cronograma',
                    item: deleteInfo.item,
                    fetchDados: fetchCronogramas
                });
            } finally {
                setDeleteInfo({ success: getDeleteSuccess, item: null });
            }
        }
    };

    const generatePaleta = () => {

        var paleta = [];
        for (const [key, value] of Object.entries(cores)) {
            paleta.push({
                "color": value ? chroma(value).darken().saturate(3).hex() : '#000000',
                "dark": value ? chroma(value).hex() : '#000000',
                "light": value ? chroma(value).darken().hex() : '#000000'
            })
        }
        return paleta;
    }
    const paleta = generatePaleta();

    const createGanttData = () => {
        const ganttData = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];
        cronogramas.forEach((item) => {
            if (!item.plano) {
                if (euDateToJsDate(item.inicio) < euDateToJsDate(item.termino)) {
                    const cocoxixi = planosCronogramas.find(plan => plan.item === item.item && plan.area === item.area);
                    if (cocoxixi) {
                        var dependencies2 = '';
                        const taskID2 = `${cocoxixi.area}_${cocoxixi.item}2`;
                        const taskName2 = cocoxixi.item;
                        const resource2 = item.area;
                        const startDate2 = euDateToJsDate(cocoxixi.inicio);
                        const endDate2 = euDateToJsDate(cocoxixi.termino);
                        if (!cocoxixi.dp_area && !cocoxixi.dp_item) {
                            dependencies2 = null;
                        } else {
                            dependencies2 = `${cocoxixi.dp_area}_${cocoxixi.dp_item}2`;
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


    const chartData = createGanttData();

    useEffect(() => {
        if (chartData.length > 1) {
            const linhaHeight = 30;
            const novaAltura = ((chartData.length * linhaHeight) + 50) + 'px';
            setChartHeight(novaAltura);
            setChartDataLoaded(true);
        }
    }, [chartData]);

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2>Timeline monitoring</h2>

        

            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}

            <div style={{
                width: "50rem",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                position: 'relative',
            }}>
                <table style={{
                    marginBottom: '5rem',
                }}>
                    <tbody style={{ borderColor: 'black', borderStyle: 'solid', borderWidth: '0.01rem' }}>
                        {cronogramas.filter(item => item.inicio != null).map((item, index) => (
                            <tr key={index}
                                style={{ 
                                    height: '30px', 
                                    borderColor: 'black', 
                                    borderStyle: 'solid', 
                                    borderWidth: '0.01rem', 
                                    borderRightWidth: '0rem',
                                    backgroundColor: cores[item.area]}}>
                                <td style={{ fontSize: item.item.length > 13 ? '0.65rem' : '0.7rem' }}>{item.item}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="centered-container" style={{
                    width: "50rem",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start", // Alinha as tabelas e o gráfico no topo
                    position: 'relative',
                }}>

                    {/* Tabela à esquerda do gráfico Gantt */}
                    <table style={{
                        marginBottom: '5rem',
                        position: 'absolute',
                        zIndex: 2,
                        width: '100%'
                    }}>
                        <tbody>
                            {cronogramas.filter(item => item.inicio != null).map((item, index) => (
                                <tr key={index}
                                    style={{ height: '30px', borderColor: 'black', borderStyle: 'solid', borderWidth: '0.1rem', borderLeftWidth: '0rem' }}>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Gráfico Gantt */}
                    {chartDataLoaded && (
                        <Chart
                            width={'100%'}
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