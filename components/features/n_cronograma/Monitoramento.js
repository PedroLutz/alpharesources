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

    const handleUpdateClick = (item) => {
        console.log(item)
        setNovosDados({
            id: item.gantt_data[0].id,
            item_id: item.wbs_item.id,
            is_plan: true,
            gantt_id: item.id,
            start: item?.gantt_data[0]?.start,
            end: item?.gantt_data[0]?.end,
            dependency_id: item.gantt_dependency[0] ? item?.gantt_dependency[0]?.dependency_id : "",
            status: item.gantt_data.status
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
        progress: 'Executing',
        finalized: 'Completed',
    }

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
            <h2 className='smallTitle'>Timeline Monitoring</h2>

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
                                                setLoading
                                            }}
                                            setExibirModal={setExibirModal} />
                                    ) : (
                                        <React.Fragment>
                                            <td>{jsDateToEuDate(item.gantt_data[0].start)}</td>
                                            <td>{jsDateToEuDate(item.gantt_data[0].end)}</td>
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
        </div>
    )
}

export default Tabela;