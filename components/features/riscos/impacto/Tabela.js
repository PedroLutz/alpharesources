import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import CadastroInputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import HelpBubble from "../../../ui/HelpBubble/risco/Impacto";
import { getTextColor } from "../../../../functions/colors";

const TabelaImpacto = () => {
    const { user, token } = useAuth();
    const user_id = user.id;
    const { isEditor } = usePerm();

    const camposVazios = {
        risk_id: '',
        impact_area: '',
        score: '',
        description: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [impactos, setImpactos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [seeArea, setSeeArea] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const enviar = async () => {
        await handleReq({
            table: 'risk_impact',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                user_id
            },
            fetchData: fetchImpactos
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const isImpactoCadastrado = (risco, areaImpacto) => {
        return impactos.some((i) => i.risk?.id == risco
            && i.impact_area.trim().toLowerCase() === areaImpacto.trim().toLowerCase());
    }

    const handleUpdateClick = (item) => {
        setLinhaVisivel(item.id);
        setIsUpdating(item?.risk?.id);
        setNovosDados({
            id: item.id,
            risk_id: item.risk.id,
            impact_area: item.impact_area,
            score: item.score,
            description: item.description
        })
        setSeeArea(false);
    }

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'risk_impact',
                route: 'update',
                token,
                data: novosDados,
                fetchData: fetchImpactos
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
                table: "risk_impact",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchImpactos
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    const fetchImpactos = async () => {
        setLoading(true);
        try {
            const data = await handleFetch({
                table: 'risk_impact',
                query: 'all',
                token
            });
            setImpactos(data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setReload(false);
        fetchImpactos();
    }, [reload]);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!',
        'impactoRepetido': 'You have already registered the impact in this area for this risk!'
    };

    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < impactos.length; i++) {
            let comparedData = impactos[i][parametro];
            if (parametro.includes(".")) {
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], impactos[i]);
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
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Risk Impact Analysis <button onClick={()=> setShowHelp(true)}>❔</button></h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem?.risk?.risk}"?`,
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
                    <table className={`${styles.tabelaImpacto} tabela`}>
                        <thead>
                            <tr>
                                {seeArea && (
                                    <React.Fragment>
                                        <th>Area</th>
                                        <th>Item</th>
                                    </React.Fragment>
                                )}
                                <th>Risk</th>
                                <th>Area of impact</th>
                                <th style={{ fontSize: '0.7rem', width: '3rem' }}>Score</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {impactos.map((item, index) => {

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
                                            isEditor={isEditor}
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
                                            {!isUpdating || isUpdating !== risk?.id ? (
                                                <React.Fragment>
                                                    {!shouldMergeRisk ? (
                                                        <td rowSpan={calculateRowSpan(risk?.id, index, "risk.id")}
                                                        >{risk?.risk}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{risk?.risk}</td>
                                            )}
                                            <td>{capitalizeFirstLetter(item.impact_area)}</td>
                                            <td style={{ width: '3rem', textAlign: 'center' }}>{item.score}</td>
                                            <td className={styles.impactoTdDescricao}>{item.description}</td>
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
                            )})}
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{ enviar, isImpactoCadastrado }}
                                setExibirModal={setExibirModal}
                                isEditor={isEditor}
                                seeArea={seeArea}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default TabelaImpacto;