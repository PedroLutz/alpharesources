import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import CadastroInputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import HelpBubble from "../../../ui/HelpBubble/risco/Resposta";
import { getTextColor } from "../../../../functions/colors";

const TabelaPlanos = () => {
    const { user, token } = useAuth();
    const user_id = user.id;
    const { isEditor } = usePerm();
    const camposVazios = {
        risk_id: "",
        strategy: "",
        details: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [respostas, setRespostas] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [seeArea, setSeeArea] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const enviar = async () => {
        await handleReq({
            table: 'risk_response',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                user_id
            },
            fetchData: fetchRespostas
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const handleUpdateClick = (item) => {
        setLinhaVisivel(item.id);
        setIsUpdating(item?.risk?.id);
        setNovosDados({
            id: item.id,
            risk_id: item.risk.id,
            strategy: item.strategy,
            details: item.details,
        })
        setSeeArea(false);
    }

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'risk_response',
                route: 'update',
                token,
                data: novosDados,
                fetchData: fetchRespostas
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setIsUpdating(false);
        setLinhaVisivel();
        setLoading(false);
        setNovosDados(camposVazios);
    };

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "risk_response",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchRespostas
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    const fetchRespostas = async () => {
        setLoading(true);
        try {
            const data = await handleFetch({
                table: 'risk_response',
                query: 'all',
                token
            });
            setRespostas(data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRespostas();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < respostas.length; i++) {
            let comparedData = respostas[i][parametro];
            if (parametro.includes(".")) {
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], respostas[i]);
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

    let lastAreaId = null, lastItemId = null, lastRiskId = null;

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">Risk Response Planning <button onClick={() => setShowHelp(true)}>❔</button></h2>
            <button className="botao-bonito" style={{ marginBottom: '1rem', width: 'fit-content' }}
                onClick={() => { !isUpdating && setSeeArea(!seeArea) }}
            >See areas and items</button>
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
                    titulo: `Are you sure you want to PERMANENTLY delete the response for "${confirmDeleteItem?.risk?.risk}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabelaRisco_container}>
                <div className={styles.tabelaRisco_wrapper}>
                    <table className={`${styles.tabelaPlano} tabela`}>
                        <thead>
                            <tr>
                                {seeArea && (
                                    <React.Fragment>
                                        <th>Area</th>
                                        <th>Item</th>
                                    </React.Fragment>
                                )}
                                <th>Risk</th>
                                <th>Strategy</th>
                                <th>Response</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {respostas.map((item, index) => {
                                const { wbs_item } = item?.risk ?? {};
                                const { wbs_area } = wbs_item ?? {};

                                const shouldMergeArea = wbs_area?.id === lastAreaId;
                                const shouldMergeItem = wbs_item?.id === lastItemId;

                                lastAreaId = wbs_area?.id;
                                lastItemId = wbs_item?.id;

                                const { risk } = item;
                                const shouldMergeRisk = risk?.id === lastRiskId;

                                lastRiskId = risk?.id;

                                return (
                                    <React.Fragment key={index}>
                                        {linhaVisivel === item.id ? (
                                            <CadastroInputs tipo="update"
                                                obj={novosDados}
                                                objSetter={setNovosDados}
                                                funcoes={{
                                                    enviar: handleUpdateItem,
                                                    cancelar: () => { setLinhaVisivel(); setIsUpdating(false) }
                                                }}
                                                setExibirModal={setExibirModal}
                                                seeArea={seeArea}
                                                backgroundColor={wbs_area?.color}
                                            />
                                        ) : (
                                            <tr style={{ backgroundColor: wbs_area?.color || 'white', color: getTextColor(wbs_area?.color ?? "#ffffff") }}>
                                                {seeArea && (
                                                    <React.Fragment>
                                                        {!shouldMergeArea ? (
                                                            <td rowSpan={calculateRowSpan(wbs_area?.id, index, 'risk.wbs_item.wbs_area.id')}
                                                            >{wbs_area?.name || "Others"}</td>
                                                        ) : null}
                                                        {!shouldMergeItem ? (
                                                            <td rowSpan={calculateRowSpan(wbs_item?.id, index, 'risk.wbs_item.id')}
                                                            >{wbs_item?.name || "Others"}</td>
                                                        ) : null}
                                                    </React.Fragment>
                                                )}
                                                {!isUpdating || isUpdating !== item?.risk?.id ? (
                                                    <React.Fragment>
                                                        {!shouldMergeRisk ? (
                                                            <td rowSpan={calculateRowSpan(item?.risk?.id, index, "risk.id")}
                                                            >{risk?.risk}</td>
                                                        ) : null}
                                                    </React.Fragment>
                                                ) : (
                                                    <td>{risk?.risk}</td>
                                                )}
                                                <td>{capitalizeFirstLetter(item.strategy)}</td>
                                                <td className={styles.planoTdResponse}>{item.details}</td>
                                                <td className='botoes_acoes'>
                                                    <button onClick={() => setConfirmDeleteItem(item)} disabled={!isEditor}>❌</button>
                                                    <button onClick={() => {
                                                        handleUpdateClick(item)
                                                    }
                                                    } disabled={!isEditor}>⚙️</button>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{ enviar }}
                                setExibirModal={setExibirModal}
                                seeArea={seeArea}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default TabelaPlanos;