import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import Inputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleFetch, handleReq } from "../../../../functions/crud_s";
import usePerm from "../../../../hooks/usePerm";
import useAuth from "../../../../hooks/useAuth";
import { cleanForm } from "../../../../functions/general";
import Link from "next/link";
import HelpBubble from "../../../ui/HelpBubble/comunicacao/Informacao";

const Tabela = () => {
    const { isEditor } = usePerm();
    const { user, token } = useAuth();
    const user_id = user.id;
    const camposVazios = {
        stakeholder_id: "",
        information: "",
        method: "",
        frequency: "",
        channel: "",
        responsible_id: "",
        register: "",
        feedback: "",
        action: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [informacoes, setInformacoes] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    //funcao que envia os dados para registro no backend
    const enviar = async () => {
        await handleReq({
            table: 'information',
            route: 'create',
            token,
            data: {...novoSubmit, 
                responsible_id: novoSubmit.responsible_id == -1 ? novoSubmit.responsible_id : null,
                user_id},
            fetchData: fetchInformacoes
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const handleUpdateClick = (item) => {
        const obj = {
            id: item.id,
            stakeholder_id: item?.stakeholder?.id,
            information: item.information,
            method: item.method,
            frequency: item.frequency,
            channel: item.channel,
            responsible_id: item?.member?.id != null ? item?.member?.id : -1,
            register: item.register,
            feedback: item.feedback,
            action: item.action
        }
        setNovosDados(obj);
        setLinhaVisivel(item.id);
        setIsUpdating([item.stakeholder?.stakeholder_group?.id, item.stakeholder?.id])
    }

    //funcao que trata os dados e envia o conteudo para o backend para update
    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'information',
                route: 'update',
                token,
                data: {...novosDados, responsible_id: novosDados.responsible_id != -1 ? novosDados.responsible_id : null},
                fetchData: fetchInformacoes
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLinhaVisivel();
        setLoading(false);
        setIsUpdating(false);
        cleanForm(novosDados, setNovosDados, camposVazios);
    };

    //funcao que envia os dados para atualizacao no backend
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "information",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchInformacoes
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    //funcao que busca as informacoes no backend
    const fetchInformacoes = async () => {
        try {
            const data = await handleFetch({
                table: 'information',
                query: 'all',
                token
            });
            setInformacoes(data.data);
        } finally {
            setLoading(false);
        }
    };

    //useEffect que so roda quando reload atualiza
    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchInformacoes();
        }
    }, [reload]);

    //useEffect que so roda no primeiro render
    useEffect(() => {
        fetchInformacoes();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'stakeholderRepetido': 'You have already registered the information for this stakeholder!'
    };

    //funcao que calcula o rowSpan de grupo de acordo com a quantidade de stakeholders nele
    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < informacoes.length; i++) {
            let comparedData = informacoes[i][parametro];
            if (parametro.includes(".")) {
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], informacoes[i]);
            }
            if (comparedData === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    let lastGroupId, lastStakeholderId = null;

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Communicated Information <button onClick={()=> setShowHelp(true)}>❔</button></h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete the information for "${confirmDeleteItem?.stakeholder?.stakeholder}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabelaComunicacao_container}>
                <div className={styles.tabelaComunicacao_wrapper}>
                    <table className={`${styles.tabelaInformacao} tabela`}>
                        <thead>
                            <tr>
                                <th>Stakeholder Group</th>
                                <th>Stakeholder</th>
                                <th className={styles.infoTdInfo}>Information</th>
                                <th>Method</th>
                                <th>Frequency</th>
                                <th>Channel</th>
                                <th>Responsible</th>
                                <th>Record *</th>
                                <th>Feedback *</th>
                                <th>Action taken *</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {informacoes.map((informacao, index) => { 
                                const { stakeholder_group } = informacao.stakeholder;
                                const shouldMergeGroup = stakeholder_group.id !== lastGroupId;

                                lastGroupId = stakeholder_group.id;

                                const { stakeholder } = informacao;
                                const shouldMergeStakeholder = stakeholder.id !== lastStakeholderId;

                                lastStakeholderId = stakeholder.id;

                                const register = informacao.register ?
                                    (
                                        <Link href={informacao.register}>{informacao.register}</Link>
                                    ) : (
                                        '-'
                                    );

                                return (
                                <React.Fragment key={index}>
                                    {linhaVisivel === informacao.id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { setLinhaVisivel(); setIsUpdating(false); }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            {!isUpdating || isUpdating[0] !== stakeholder_group?.id ? (
                                                <React.Fragment>
                                                    {shouldMergeGroup ? (
                                                        <td rowSpan={calculateRowSpan(stakeholder_group?.id, index, 'stakeholder.stakeholder_group.id')}
                                                        >{stakeholder_group?.group}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{stakeholder_group?.group}</td>
                                            )}
                                            {!isUpdating || isUpdating[1] !== stakeholder?.id ? (
                                                <React.Fragment>
                                                    {shouldMergeStakeholder ? (
                                                        <td rowSpan={calculateRowSpan(stakeholder?.id, index, 'stakeholder.id')}
                                                        >{stakeholder?.stakeholder}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{stakeholder?.stakeholder}</td>
                                            )}
                                            <td className={styles.infoTdInfo}>{informacao.information}</td>
                                            <td>{informacao.method}</td>
                                            <td>{informacao.frequency}</td>
                                            <td>{informacao.channel}</td>
                                            <td>{informacao?.member?.name || 'Circunstancial'}</td>
                                            <td>{register}</td>
                                            <td>{informacao.feedback || '-'}</td>
                                            <td>{informacao.action || '-'}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(informacao)} disabled={!isEditor}>❌</button>
                                                <button onClick={() => {
                                                    handleUpdateClick(informacao)
                                                }
                                                } disabled={!isEditor}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )})}
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