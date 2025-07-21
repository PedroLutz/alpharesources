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
        risco: "",
        ocorrencia: "",
        impacto: "",
        acao: "",
        urgencia: "",
        impactoFinanceiro: "",
        impactoCronograma: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [analises, setAnalises] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const { isAdmin } = useContext(AuthContext)

    const enviar = async () => {
        await handleSubmit({
            route: 'riscos/analise',
            dados: novoSubmit,
            fetchDados: fetchAnalises
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const isRiscoCadastrado = (risco) => {
        return analises.some((r) => r.risco.trim().toLowerCase() === risco.trim().toLowerCase());
    }

    const getRiscosMapeados = (occ, imp) => {
        let riscos = []
        if (analises) {
            analises.forEach((analise) => {
                if (analise.ocorrencia === occ && analise.impacto === imp) {
                    riscos.push(analise.risco)
                }
            })
        }
        return (
            <ul>
                {riscos.map((risco, index) => (
                    <li key={index} style={{ fontSize: '0.65rem', textAlign: 'left' }}>{risco}</li>
                ))}
            </ul>
        );
    }

    const handleUpdateItem = async () => {
            setLoading(true);      
            try {
                await handleUpdate({
                    route: 'riscos/analise/update?id',
                    dados: novosDados,
                    fetchDados: fetchAnalises
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
                    route: 'riscos/analise',
                    item: confirmDeleteItem,
                    fetchDados: fetchAnalises
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

    const fetchAnalises = async () => {
        try {
            const data = await fetchData('riscos/analise/get/all');
            setAnalises(data.riscoAnalises);
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

    const calculaRPN = (item) => {
        return item.ocorrencia * item.impacto * item.acao * item.urgencia;
    }

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2 className="smallTitle">Risk Analysis</h2>
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
                    <table className={`${styles.tabelaAnalise} tabela`}>
                        <thead>
                            <tr>
                                <th style={{ width: '10rem'}}>Risk</th>
                                <th>Occurrence</th>
                                <th>Impact</th>
                                <th>Action</th>
                                <th>Urgency</th>
                                <th>RPN</th>
                                <th>Financial Impact</th>
                                <th>Estimated Monetary Value</th>
                                <th>Schedule Impact</th>
                                <th>Estimated Time Impact</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {analises.map((item, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === item._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); setIsUpdating(false) },
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            {!isUpdating || isUpdating !== item.risco ? (
                                                <React.Fragment>
                                                    {index === 0 || analises[index - 1].risco !== item.risco ? (
                                                        <td rowSpan={calculateRowSpan(analises, item.risco, index)}
                                                        >{item.risco}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{item.risco}</td>
                                            )}
                                            <td>{item.ocorrencia}</td>
                                            <td>{item.impacto}</td>
                                            <td>{item.acao}</td>
                                            <td>{item.urgencia}</td>
                                            <td style={{
                                                backgroundColor: calculaRPN(item) >= 150 ? '#f7b2b2' : (calculaRPN(item) >= 50 ? '#f7dcb2' : '#d2f5c6')
                                            }}>{calculaRPN(item)}</td>
                                            <td>{item.impactoFinanceiro != 0 ? `R$${(Number(item.impactoFinanceiro)).toFixed(2)}` : '-'}</td>
                                            <td>{item.impactoFinanceiro != 0 ? `R$${(item.impactoFinanceiro * (item.ocorrencia / 5)).toFixed(2)}` : '-'}</td>
                                            <td>{(item.impactoCronograma != 0 && item.impactoCronograma != null) ? 
                                                `${item.impactoCronograma} days` : '-'}</td>
                                            <td>{(item.impactoCronograma != 0 && item.impactoCronograma != null) ? 
                                                `${(item.impactoCronograma * (item.ocorrencia / 5)).toFixed()} days` : '-'}
                                            </td>
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
                                funcoes={{enviar, isRiscoCadastrado}}
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
            <h2 style={{ marginTop: '3rem' }}>Risk Assessment Matrix</h2>
            <div className={styles.tabelaRisco_container}>
                <p>Impact</p>
                <div className={styles.tabelaRisco_wrapper}>
                    <table className={`${styles.tabelaAnalise} tabela`} style={{ width: '75rem' }}>
                        <thead style={{background: 'transparent'}}>
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
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(5, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(5, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(5, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(5, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(5, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>4</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(4, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(4, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(4, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(4, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(4, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>3</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(3, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(3, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(3, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(3, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(3, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>2</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(2, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(2, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(2, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(2, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(2, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>1</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(1, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(1, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(1, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(1, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(1, 5) || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default TabelaAnalise; 