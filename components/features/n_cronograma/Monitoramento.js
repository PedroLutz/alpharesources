import React, { useEffect, useState, useMemo } from 'react';
import Loading from '../../ui/Loading';
import Modal from '../../ui/Modal';
import { Chart } from 'react-google-charts';
import { handleFetch, handleReq } from '../../../functions/crud_s';
import { cleanForm, jsDateToEuDate, euDateToIsoDate, euDateToJsDate } from '../../../functions/general';
import styles from '../../../styles/modules/cronograma.module.css';
import CadastroInputs from './CadastroInputs';
import chroma from 'chroma-js';
import useAuth from '../../../hooks/useAuth';
import usePerm from '../../../hooks/usePerm';
import { set } from 'mongoose';

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
        } finally {
            setLoaded(true);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCronogramas();
    }, [])

    // useEffect(() => {
    //     if (chartData.length > 1) {
    //         const linhaHeight = isMobile ? 20 : 30;
    //         const novaAltura = ((chartData.length * linhaHeight) + 50) + 'px';
    //         setChartHeight(novaAltura);
    //         setChartDataLoaded(true);
    //     }
    // }, [chartData]);

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
                        itemSelecionado ? setConfirmUpdateTask({item: itemSelecionado, complete: true}) : setExibirModal('semtarefa')
                    }} disabled={!isEditor}>
                        Complete task
                    </button>
                    <button onClick={() => {
                        itemSelecionado ? setConfirmUpdateTask({item: itemSelecionado, complete: false}) : setExibirModal('semtarefa')
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
            )}

        </div>
    )
}

export default Tabela;