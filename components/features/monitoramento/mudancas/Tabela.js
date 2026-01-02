import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/monitoramento.module.css'
import Inputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { cleanForm, isoDateToEuDate } from "../../../../functions/general";
import usePerm from "../../../../hooks/usePerm";
import useAuth from "../../../../hooks/useAuth";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import HelpBubble from "../../../ui/HelpBubble/monitoramento/Mudancas";

const Tabela = () => {
    const { user, token } = useAuth();
    const user_id = user.id;
    const { isEditor } = usePerm();
    const camposVazios = {
        date: '',
        area_id: '',
        type: '',
        item: '',
        change: '',
        reasoning: '',
        impact: '',
        is_approved: '',
        status: '',
        responsible_request: '',
        responsible_approval: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [mudancas, setMudancas] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);


    //funcao que envia os dados de novoSubmit para cadastro
    const enviar = async () => {
        await handleReq({
            table: 'change',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                area_id: novoSubmit.area_id == -1 ? null : novoSubmit.area_id,
                user_id
            },
            fetchData: fetchMudancas
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };


    //funcao que recebe o item, o insere no estado confirmUpdateItem e como objeto de novosDados
    const handleUpdateClick = (item) => {
        const {wbs_area, ...obj} = item;
        obj.area_id = item?.wbs_area?.id ?? -1;
        
        setNovosDados(obj);
        setLinhaVisivel(item.id);
    };


    //funcao que trata os dados e os envia para atualizacao
    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'change',
                route: 'update',
                token,
                data: {
                    ...novosDados,
                    area_id: novosDados.area_id == -1 ? null : novosDados.area_id
                },
                fetchData: fetchMudancas
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setReload(true);
        setLoading(false);
        setLinhaVisivel();
        setNovosDados(camposVazios);
    };

    //funcao que envia o id para ser deletado
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "change",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchMudancas
            });
            setExibirModal(`deleteSuccess`);
            setConfirmDeleteItem(null);
        }
    };

    //funcao que busca os dados
    const fetchMudancas = async () => {
        try {
            const data = await handleFetch({
                table: 'change',
                query: 'all',
                token
            })
            setMudancas(data.data);
        } finally {
            setLoading(false);
        }
    };

    //useEffect que so executa quando reload eh igual true
    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchMudancas();
        }
    }, [reload]);

    //useEffect que so executa no primeiro render
    useEffect(() => {
        fetchMudancas();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!'
    };

    const typeLabels = {
        corrective: 'Corrective Action',
        preventive: 'Preventive Action',
        repair: 'Defect Repair',
        update: 'Update'
    }

    const statusLabels = {
        starting: 'Starting',
        progress: 'In progress',
        finalized: 'Finalized'
    }

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Change Log <button onClick={()=> setShowHelp(true)}>❔</button></h2>

            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}

            {confirmDeleteItem && (
                <Modal objeto={{
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.item}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.container}>
                <div className={styles.wrapper}>
                    <table className={`tabela ${styles.tabela_mudancas}`}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Area</th>
                                <th>Type of change</th>
                                <th>Configurated item</th>
                                <th>Change</th>
                                <th>Reasoning</th>
                                <th>Impact</th>
                                <th>Decision</th>
                                <th>Status</th>
                                <th>Applicant</th>
                                <th>Responsible for approval</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {mudancas.map((mudanca, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === mudanca.id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => setLinhaVisivel()
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            <td className={styles.mudancasData}>{isoDateToEuDate(mudanca.date)}</td>
                                            <td>{mudanca.wbs_area?.name || "Others"}</td>
                                            <td>{typeLabels[mudanca.type]}</td>
                                            <td>{mudanca.item}</td>
                                            <td className={styles.mudancasMudanca}>{mudanca.change}</td>
                                            <td className={styles.mudancasJustificativa}>{mudanca.reasoning}</td>
                                            <td className={styles.mudancasImpacto}>{mudanca.impact}</td>
                                            <td>{mudanca.is_approved ? 'Approved' : 'Rejected'}</td>
                                            <td>{statusLabels[mudanca.status]}</td>
                                            <td>{mudanca.responsible_request}</td>
                                            <td>{mudanca.responsible_approval}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(mudanca)} disabled={!isEditor}>❌</button>
                                                <button onClick={() => {
                                                    handleUpdateClick(mudanca)
                                                }
                                                } disabled={!isEditor}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <Inputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{ enviar }}
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default Tabela;