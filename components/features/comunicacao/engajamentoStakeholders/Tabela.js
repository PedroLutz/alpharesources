import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import Inputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import HelpBubble from "../../../ui/HelpBubble/comunicacao/Engajamento";

const Tabela = () => {
    const camposVazios = {
        id: "",
        stakeholder_id: "",
        eng_level: "",
        eng_target_level: ""
    }
    const { token } = useAuth();
    const { isEditor } = usePerm();
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [engajamentos, setEngajamentos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const handleUpdateClick = (item) => {
        const obj = {
            id: item.id,
            stakeholder_id: item?.stakeholder?.id,
            eng_level: item.eng_level || "",
            eng_target_level: item.eng_target_level || ""
        }
        setNovosDados(obj);
        setLinhaVisivel(item.id);
        setIsUpdating(item?.stakeholder?.stakeholder_group?.id)
    }

    //funcao que trata e envia o objeto de atualizacao para o backend
    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'engagement',
                route: 'update',
                token,
                data: novosDados,
                fetchData: fetchStakeholders
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLinhaVisivel();
        setLoading(false);
        cleanForm(novosDados, setNovosDados, camposVazios);
    };

    //funcao que busca stakeholders
    const fetchStakeholders = async () => {
        try {
            const data = await handleFetch({
                table: 'engagement',
                query: 'all',
                token
            });
            setEngajamentos(data.data);
        } finally {
            setLoading(false);
        }
    };

    //funcao que gera o mapeamento de poder e interesse
    const generateMapping = (p, i) => {
        if (p && i) {
            return "Close Management"
        }
        if (!p && i) {
            return "Keep informed"
        }
        if (p && !i) {
            return "Keep satisfied"
        }
        if (!p && !p) {
            return "Monitor"
        }
    }

    //useEffect que só roda no primeiro render
    useEffect(() => {
        fetchStakeholders();
    }, [])

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

    //funcao que calcula o rowSpan do td do grupo de acordo com a quantidade de stakeholders
    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < engajamentos.length; i++) {
            let comparedData = engajamentos[i][parametro];
            if (parametro.includes(".")) {
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], engajamentos[i]);
            }
            if (comparedData === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    function capitalizeFirstLetter(str) {
        if (typeof str !== 'string' || str.length === 0) {
            return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Stakeholder Engagement Matrix <button onClick={()=> setShowHelp(true)}>❔</button></h2>
            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}

            {engajamentos.length != 0 ? (


                <div className={styles.tabelaComunicacao_container}>
                    <div className={styles.tabelaComunicacao_wrapper}>
                        <table className={`${styles.tabelaEngajamento} tabela`}>
                            <thead>
                                <tr>
                                    <th>Stakeholder Group</th>
                                    <th>Stakeholder</th>
                                    <th className={styles.eng_poderId}>Power</th>
                                    <th className={styles.eng_interesseId}>Interest</th>
                                    <th>Mapping</th>
                                    <th className={styles.eng_engajamentoId}>Current Engagement Level</th>
                                    <th className={styles.eng_engajamentoId}>Expected Engagement Level</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>

                                {engajamentos.map((engajamento, index) => (
                                    <tr key={index}>
                                        {!isUpdating || isUpdating !== engajamento?.stakeholder?.stakeholder_group?.id ? (
                                            <React.Fragment>
                                                {index === 0 || engajamentos[index - 1]?.stakeholder?.stakeholder_group?.id !== engajamento?.stakeholder?.stakeholder_group?.id ? (
                                                    <td rowSpan={calculateRowSpan(engajamento?.stakeholder?.stakeholder_group?.id, index, 'stakeholder.stakeholder_group.id')}
                                                    >{engajamento?.stakeholder?.stakeholder_group?.group}</td>
                                                ) : null}
                                            </React.Fragment>
                                        ) : (
                                            <td>{engajamento?.stakeholder?.stakeholder_group?.group}</td>
                                        )}
                                        <td>{engajamento.stakeholder?.stakeholder}</td>
                                        <td id={styles.poderId}>{engajamento.stakeholder?.power ? 'High' : 'Low'}</td>
                                        <td id={styles.interesseId}>{engajamento.stakeholder?.interest ? 'High' : 'Low'}</td>
                                        <td>{generateMapping(engajamento.stakeholder?.power, engajamento.stakeholder?.interest)}</td>
                                        {linhaVisivel === engajamento.id ? (
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
                                            <React.Fragment>
                                                <td>{capitalizeFirstLetter(engajamento.eng_level)}</td>
                                                <td>{capitalizeFirstLetter(engajamento.eng_target_level)}</td>
                                                <td className='botoes_acoes'>
                                                    <button onClick={() => {
                                                        handleUpdateClick(engajamento)
                                                    }
                                                    } disabled={!isEditor}>⚙️</button>
                                                </td>
                                            </React.Fragment>
                                        )}

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div>No Stakeholders registered! Please register a stakeholder first.</div>
            )}
        </div>
    )
};

export default Tabela;
