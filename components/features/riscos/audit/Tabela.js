import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import CadastroInputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import usePerm from "../../../../hooks/usePerm";
import useAuth from "../../../../hooks/useAuth";

const TabelaAnalise = () => {
    const { isEditor } = usePerm();
    const { user, token } = useAuth();
    const user_id = user.id;

    const camposVazios = {
        risk_id: '',
        response: '',
        impact: '',
        action: '',
        urgency: '',
        financial_impact: '',
        schedule_impact: '',
        impact_description: '',
        evaluation_description: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [audits, setAudits] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [seeArea, setSeeArea] = useState(false);

    const enviar = async () => {
        await handleReq({
            table: 'risk_audit',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                user_id
            },
            fetchData: fetchAudits
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const handleUpdateClick = async (item) => {
        setLinhaVisivel(item.id);
        var obj = {};
        for (const key in camposVazios) {
            if (key == 'risk_id') {
                obj[key] = item.risk?.id
            } else {
                obj[key] = item[key];
            }
        }
        obj.id = item.id;
        setNovosDados(obj);
        setIsUpdating(item.risk?.id)
    }

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'risk_audit',
                route: 'update',
                token,
                data: novosDados,
                fetchData: fetchAudits
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
                table: "risk_audit",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchAudits
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    const fetchAudits = async () => {
        setLoading(true);
        try {
            const data = await handleFetch({
                table: 'risk_audit',
                query: 'all',
                token
            });
            setAudits(data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudits();
    }, [])

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!'
    };

    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < audits.length; i++) {
            let comparedData = audits[i][parametro];
            if (parametro.includes(".")) {
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], audits[i]);
            }
            if (comparedData === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2>Risk Audit</h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.risk.risk}"?`,
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
                    <table className={`${styles.tabelaAudit} tabela`}>
                        <thead>
                            <tr>
                                {seeArea && (
                                    <React.Fragment>
                                        <th>Area</th>
                                        <th>Item</th>
                                    </React.Fragment>
                                )}
                                <th>Risk</th>
                                <th>Impact description</th>
                                <th className={styles.auditThImpacto}>Financial impact</th>
                                <th className={styles.auditThImpacto}>Schedule impact</th>
                                <th>Response</th>
                                <th>Impact</th>
                                <th>Action</th>
                                <th>Urgency</th>
                                <th>Evaluation description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {audits.map((item, index) => (
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
                                        />
                                    ) : (
                                        <tr style={{ backgroundColor: item?.risk?.wbs_item?.wbs_area?.color || 'white' }}>
                                            {seeArea && (
                                                <React.Fragment>
                                                    {index === 0 || impactos[index - 1].risk?.wbs_item?.wbs_area?.id !== item?.risk?.wbs_item?.wbs_area?.id ? (
                                                        <td rowSpan={calculateRowSpan(item?.risk?.wbs_item?.wbs_area?.id, index, 'risk.wbs_item.wbs_area.id')}
                                                        >{item?.risk?.wbs_item?.wbs_area?.name}</td>
                                                    ) : null}
                                                    {index === 0 || impactos[index - 1].risk?.wbs_item?.id !== item?.risk?.wbs_item?.id ? (
                                                        <td rowSpan={calculateRowSpan(item?.risk?.wbs_item?.id, index, 'risk.wbs_item.id')}
                                                        >{item?.risk?.wbs_item?.name}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            )}
                                            {!isUpdating || isUpdating !== item.risk?.id ? (
                                                <React.Fragment>
                                                    {index === 0 || audits[index - 1].risk?.id !== item.risk?.id ? (
                                                        <td rowSpan={calculateRowSpan(item.risk?.id, index, 'risk.id')}
                                                        >{item.risk?.risk}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{item.risk?.risk}</td>
                                            )}
                                            <td className={styles.auditTdText}>{item.impact_description}</td>
                                            <td className={styles.auditTdComparacao}>
                                                Plan: R${Number(item?.risk?.risk_analysis?.financial_impact || '0').toFixed(2)}<br />
                                                Actual: R${Number(item.financial_impact).toFixed(2)}
                                            </td>
                                            <td className={styles.auditTdComparacao}>
                                                Plan: <br />{item?.risk?.risk_analysis?.schedule_impact || '-'} days<br />
                                                Actual: <br />{item.schedule_impact} days
                                            </td>
                                            <td className={styles.auditTdText}>{item.response}</td>
                                            <td className={styles.auditTdComparacao}>
                                                Plan: {item?.risk?.risk_analysis?.impact || '-'}<br />
                                                Actual: {item.impact}<br />
                                            </td>
                                            <td className={styles.auditTdComparacao}>
                                                Plan: {item?.risk?.risk_analysis?.action || '-'}<br />
                                                Actual: {item.action}<br />
                                            </td>
                                            <td className={styles.auditTdComparacao}>
                                                Plan: {item?.risk?.risk_analysis?.urgency || '-'}<br />
                                                Actual: {item.urgency}<br />
                                            </td>
                                            <td className={styles.auditTdText}>{item.evaluation_description}</td>
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
                            ))}
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

export default TabelaAnalise;