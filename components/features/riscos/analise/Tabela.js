import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import CadastroInputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import HelpBubble from "../../../ui/HelpBubble/risco/Analise";
import { getTextColor } from "../../../../functions/colors";

const TabelaAnalise = () => {
    const { user, token } = useAuth();
    const user_id = user.id;
    const { isEditor } = usePerm();

    const camposVazios = {
        risk_id: "",
        occurrence: "",
        action: "",
        urgency: "",
        impact: "",
        financial_impact: "",
        schedule_impact: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [analises, setAnalises] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [seeArea, setSeeArea] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const enviar = async () => {
        await handleReq({
            table: 'risk_analysis',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                user_id
            },
            fetchData: fetchAnalises
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const isRiscoCadastrado = (risco) => {
        return analises.some((r) => r.risk.id == risco);
    }

    const getRiscosMapeados = (occ, imp) => {
        let riscos = []
        if (analises) {
            analises.forEach((analise) => {
                if (analise.occurrence === occ && analise.impact === imp) {
                    riscos.push(analise.risk.risk)
                }
            })
        }
        if(riscos.length > 0){
            return (
                <ul>
                    {riscos.map((risco, index) => (
                        <li key={index} style={{ fontSize: '0.65rem', textAlign: 'left', marginLeft: '-2rem' }}>{risco}</li>
                    ))}
                </ul>
            );
        }
        return "-";
    }

    const handleUpdateClick = (item) => {
        setLinhaVisivel(item.id);
        setIsUpdating(item?.risk?.risk);
        setNovosDados({
            id: item.id,
            risk_id: item.risk.id,
            action: item.action,
            occurrence: item.occurrence,
            urgency: item.urgency,
            impact: item.impact,
            financial_impact: item.financial_impact,
            schedule_impact: item.schedule_impact
        })
        setSeeArea(false);
    }

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'risk_analysis',
                route: 'update',
                token,
                data: novosDados,
                fetchData: fetchAnalises
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
                table: "risk_analysis",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchAnalises
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    const fetchAnalises = async () => {
        setLoading(true);
        try {
            const data = await handleFetch({
                table: 'risk_analysis',
                query: 'all',
                token
            });
            setAnalises(data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalises();
    }, [])

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!',
        'riscoRepetido': 'You have already analysed this risk!'
    };

    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < analises.length; i++) {
            let comparedData = analises[i][parametro];
            if (parametro.includes(".")) {
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], analises[i]);
            }
            if (comparedData === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    const calculaRPN = (item) => {
        return item.occurrence * item.impact * item.action * item.urgency;
    }

    let lastAreaId = null, lastItemId = null, lastRiskId = null;

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Risk Analysis <button onClick={()=> setShowHelp(true)}>❔</button></h2>
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
                    <table className={`${styles.tabelaAnalise} tabela`}>
                        <thead>
                            <tr>
                                {seeArea && (
                                    <React.Fragment>
                                        <th>Area</th>
                                        <th>Item</th>
                                    </React.Fragment>
                                )}
                                <th className={styles.analiseRiskTd} style={{ width: '10rem' }}>Risk</th>
                                <th>Occurrence</th>
                                <th>Impact</th>
                                <th>Action</th>
                                <th>Urgency</th>
                                <th>RPN</th>
                                <th>Financial Impact</th>
                                <th>Estimated Monetary Value</th>
                                <th>Schedule Impact</th>
                                <th>Estimated Time Impact</th>
                                <th className={styles.optionsTh}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analises.map((item, index) => {
                                const { wbs_item } = item?.risk ?? {};
                                const { wbs_area } = wbs_item ?? {};

                                const shouldMergeArea = wbs_area?.id === lastAreaId;
                                const shouldMergeItem = wbs_item?.id === lastItemId;

                                lastAreaId = wbs_area?.id;
                                lastItemId = wbs_item?.id;

                                const { risk } = item;
                                const shouldMergeRisk = risk?.id === lastRiskId;

                                lastRiskId = risk?.id;

                                const riskPriorityNumber = calculaRPN(item);
                                const rpnBackgroundColor = riskPriorityNumber >= 150 ? '#f7b2b2' : (calculaRPN(item) >= 50 ? '#f7dcb2' : '#d2f5c6');

                                const financialImpact = item?.financial_impact ?? 0;
                                const financialImpactLabel = financialImpact != 0 ? `R$${financialImpact.toFixed(2)}` : '-';
                                const emv = ((financialImpact ?? 0)  * (item.occurrence / 5)).toFixed(2);

                                const scheduleImpact = item?.schedule_impact;
                                const hasScheduleImpact = scheduleImpact != 0 && scheduleImpact != null;
                                const scheduleImpactLabel = hasScheduleImpact ? `${scheduleImpact} days` : '-';
                                const eti = hasScheduleImpact ? `${(scheduleImpact * (item.occurrence / 5)).toFixed()} days` : '-';

                                return (
                                <React.Fragment key={index}>
                                    {linhaVisivel === item.id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { setLinhaVisivel(); setIsUpdating(false) },
                                            }}
                                            setExibirModal={setExibirModal}
                                            seeArea={seeArea}
                                            backgroundColor={wbs_area?.color}
                                        />
                                    ) : (
                                        <tr style={{ backgroundColor: wbs_area?.color, color: getTextColor(wbs_area?.color ?? "#ffffff") }}>
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
                                            {!isUpdating || isUpdating !== risk?.risk ? (
                                                <React.Fragment>
                                                    {!shouldMergeRisk ? (
                                                        <td className={styles.riskTd} rowSpan={calculateRowSpan(risk?.risk, index, 'risk.risk')}
                                                        >{risk?.risk}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td className={styles.analiseRiskTd}>{risk?.risk}</td>
                                            )}
                                            <td className={styles.analiseOcurrenceTd}>{item.occurrence}</td>
                                            <td>{item.impact}</td>
                                            <td>{item.action}</td>
                                            <td>{item.urgency}</td>
                                            <td style={{backgroundColor: rpnBackgroundColor}}>{riskPriorityNumber}</td>
                                            <td>{financialImpactLabel}</td>
                                            <td>{emv}</td>
                                            <td>{scheduleImpactLabel}</td>
                                            <td>{eti}</td>
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
                                funcoes={{ enviar, isRiscoCadastrado }}
                                setExibirModal={setExibirModal}
                                seeArea={seeArea}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
            <h2 style={{ marginTop: '3rem' }}>Risk Assessment Matrix</h2>
            <div className={styles.tabelaRisco_container}>
                <p>Impact</p>
                <div className={styles.tabelaRisco_wrapper}>
                    <table className={`${styles.tabelaAnalise} tabela`}>
                        <thead style={{ background: 'transparent' }}>
                            <tr>
                                <th style={{ borderColor: 'transparent', backgroundColor: 'transparent', width: '1rem', color: 'white' }}></th>
                                <th style={{ borderColor: 'transparent', borderBottomColor: 'black', borderRightColor: 'black', backgroundColor: 'transparent', width: '1rem', color: 'white' }}></th>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>4</th>
                                <th>5</th>
                            </tr>
                        </thead>
                        <tbody >
                            <tr>
                                <td rowSpan={5}
                                    style={{ border: 'none', width: '0.2rem', fontSize: '1rem', margin: '0rem', padding: '0rem' }}
                                ><div style={{
                                    writingMode: 'sideways-lr',
                                    display: 'inline-block',
                                }}>
                                        Occurrence
                                    </div></td>
                                <th>5</th>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(5, 1)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(5, 2)}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(5, 3)}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(5, 4)}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(5, 5)}</td>
                            </tr>
                            <tr>
                                <th>4</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(4, 1)}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(4, 2)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(4, 3)}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(4, 4)}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(4, 5)}</td>
                            </tr>
                            <tr>
                                <th>3</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(3, 1)}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(3, 2)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(3, 3)}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(3, 4)}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(3, 5)}</td>
                            </tr>
                            <tr>
                                <th>2</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(2, 1)}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(2, 2)}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(2, 3)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(2, 4)}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(2, 5)}</td>
                            </tr>
                            <tr>
                                <th>1</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(1, 1)}</td>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(1, 2)}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(1, 3)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(1, 4)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(1, 5)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default TabelaAnalise; 