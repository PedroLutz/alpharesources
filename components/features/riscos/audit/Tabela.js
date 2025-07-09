import React, { useEffect, useState, useContext } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import CadastroInputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../../functions/crud";
import { cleanForm } from "../../../../functions/general";
import { AuthContext } from "../../../../contexts/AuthContext";

const TabelaAnalise = () => {
    const camposVazios = {
        risco: '',
        resposta: '',
        impacto: '',
        acao: '',
        urgencia: '',
        impactoFinanceiro: '',
        impactoCronograma: '',
        descricaoImpacto: '',
        descricaoAvaliacao: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [audits, setAudits] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const { isAdmin } = useContext(AuthContext)

    const enviar = async () => {
        await handleSubmit({
            route: 'riscos/audit',
            dados: novoSubmit,
            fetchDados: fetchAudits
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const handleUpdateItem = async () => {
        setLoading(true);
        var updatedItem = {_id: novosDados._id};
        //tem q recriar o obj pq o obj que novosDados recebe tem um monte
        //de campos usados pra comparação q n devem ser updateados
        for(const key in camposVazios){
            updatedItem = {
                ...updatedItem,
                [key]: novosDados[key]
            }
        }
        try {
            await handleUpdate({
                route: 'riscos/audit/update?id',
                dados: updatedItem,
                fetchDados: fetchAudits
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLoading(false);
        setIsUpdating(false);
        setNovosDados(camposVazios);
        setLinhaVisivel();
    };

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleDelete({
                    route: 'riscos/audit',
                    item: confirmDeleteItem,
                    fetchDados: fetchAudits
                });
            } finally {
                if (getDeleteSuccess) {
                    setExibirModal(`deleteSuccess`)
                } else {
                    setExibirModal(`deleteFail`)
                }
            }
        }
        setConfirmDeleteItem(null);
    };

    const fetchAudits = async () => {
        try {
            const data = await fetchData('riscos/audit/get/all');
            setAudits(data.riscoAudits);
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

    const calculateRowSpan = (itens, currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < itens.length; i++) {
            if (itens[i].risco === currentArea) {
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.risco}"?`,
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
                    <table className={styles.tabelaAudit}>
                        <thead>
                            <tr>
                                <th>Risk</th>
                                <th>Impact description</th>
                                <th style={{ fontSize: '0.8rem' }}>Financial impact</th>
                                <th style={{ fontSize: '0.8rem' }}>Schedule impact</th>
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
                                    {linhaVisivel === item._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); setIsUpdating(false) }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            {!isUpdating || isUpdating !== item.risco ? (
                                                <React.Fragment>
                                                    {index === 0 || audits[index - 1].risco !== item.risco ? (
                                                        <td rowSpan={calculateRowSpan(audits, item.risco, index)}
                                                        >{item.risco}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{item.risco}</td>
                                            )}
                                            <td>{item.descricaoImpacto}</td>
                                            <td style={{ fontSize: '0.8rem' }}>
                                                Plan: R${Number(item.impactoFinanceiroPlano).toFixed(2)}<br />
                                                Actual: R${Number(item.impactoFinanceiro).toFixed(2)}
                                            </td>
                                            <td style={{ fontSize: '0.8rem' }}>
                                                Plan: <br />{item.impactoCronogramaPlano} days<br />
                                                Actual: <br />{item.impactoCronograma} days
                                            </td>
                                            <td>{item.resposta}</td>
                                            <td style={{ fontSize: '0.8rem' }}>
                                                Plan: {item.impactoPlano}<br />
                                                Actual: {item.impacto}<br />
                                            </td>
                                            <td style={{ fontSize: '0.8rem' }}>
                                                Plan: {item.acaoPlano}<br />
                                                Actual: {item.acao}<br />
                                            </td>
                                            <td style={{ fontSize: '0.8rem' }}>
                                                Plan: {item.urgenciaPlano}<br />
                                                Actual: {item.urgencia}<br />
                                            </td>
                                            <td>{item.descricaoAvaliacao}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(item)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(item._id); setNovosDados(item); setIsUpdating(item.risco)
                                                }
                                                } disabled={!isAdmin}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{enviar}}
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default TabelaAnalise;