import React, { useEffect, useState, useContext } from "react"
import styles from '../../../styles/modules/risco.module.css'
import CadastroInputs from "./Inputs";
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext";

const TabelaAnalise = () => {
    const camposVazios = {
        risco: "",
        ocorrencia: "",
        impacto: "",
        acao: "",
        urgencia: "",
        impactoFinanceiro: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [analises, setAnalises] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const {isAdmin} = useContext(AuthContext)

    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'riscos/analise',
            dados: novoSubmit
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
        setReload(true);
    };

    const handleUpdateClick = (item) => {
        setConfirmUpdateItem(item)
        setNovosDados({
            ...item
        });
    };

    const getRiscos = (occ, imp) => {
        let coisos = []
        if(analises){
            analises.forEach((analise)=> {
                if (analise.ocorrencia === occ && analise.impacto === imp){
                    coisos.push(analise.risco)
                }
            })
        }
        return coisos.join(", ");
    }

    const handleUpdateItem = async () => {
        if (confirmUpdateItem) {
            setLoading(true);
            const updatedItem = { ...confirmUpdateItem, ...novosDados };

            const updatedRiscos = analises.map(item =>
                item._id === updatedItem._id ? { ...updatedItem } : item
            );
            setAnalises(updatedRiscos);
            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'riscos/analise/update?id',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
                setAnalises(riscos);
                setConfirmUpdateItem(confirmUpdateItem)
                console.error("Update failed:", error);
            }
            setLoading(false);
        }
    };

    const handleConfirmDelete = () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = handleDelete({
                    route: 'riscos/analise',
                    item: confirmDeleteItem,
                    fetchDados: fetchAnalises
                });
            } finally {
                setExibirModal(`deleteSuccess-${getDeleteSuccess}`)
            }
        }
        if (getDeleteSuccess) {
            setExibirModal(`deleteSuccess`)
        } else {
            setExibirModal(`deleteFail`)
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
        setReload(false);
        fetchAnalises();
    }, [reload]);

    const checkDados = (tipo) => {
        setExibirModal(tipo); return;
    };

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

    const calculaRPN = (item) => {
        return item.ocorrencia * item.impacto * item.acao * item.urgencia;
    }

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2>Risk Analysis</h2>
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
                    <table className={styles.tabelaAnalise}>
                        <thead>
                            <tr>
                                <th style={{width: '10rem'}}>Risk</th>
                                <th style={{wordWrap: 'break-word', width: '2rem', fontSize: '0.7rem'}}>Occurrence</th>
                                <th style={{wordWrap: 'break-word', width: '2rem', fontSize: '0.7rem'}}>Impact</th>
                                <th style={{wordWrap: 'break-word', width: '2rem', fontSize: '0.7rem'}}>Action</th>
                                <th style={{wordWrap: 'break-word', width: '2rem', fontSize: '0.7rem'}}>Urgency</th>
                                <th style={{wordWrap: 'break-word', width: '2rem', fontSize: '0.7rem'}}>RPN</th>
                                <th style={{wordWrap: 'break-word', width: '2rem', fontSize: '0.7rem'}}>Financial Impact</th>
                                <th style={{wordWrap: 'break-word', width: '2rem', fontSize: '0.7rem'}}>Estimated Monetary Value</th>
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
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => {linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); setIsUpdating(false)}
                                            }}
                                            checkDados={checkDados}
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
                                            <td style={{backgroundColor: calculaRPN(item) >= 150 ? '#f7b2b2' : (calculaRPN(item) >= 50 ? '#f7dcb2' : '')
                                                }}>{calculaRPN(item)}</td>
                                            <td>{item.impactoFinanceiro != 0 ? `R$${(Number(item.impactoFinanceiro)).toFixed(2)}` : '-'}</td>
                                            <td>{item.impactoFinanceiro != 0 ? `R$${(item.impactoFinanceiro * (item.ocorrencia/5)).toFixed(2)}`: '-'}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(item)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(item._id); handleUpdateClick(item); setIsUpdating(item.risco)
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
                                funcao={enviar}
                                checkDados={checkDados}
                            />
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.tabelaRisco_container} style={{marginTop: '3rem'}}>
                <h2>Risk Assessment Matrix</h2>
                <div className={styles.tabelaRisco_wrapper}>
            <table className={styles.tabelaAnalise} style={{ width:'75rem'}}>
                <thead>
                    <tr>
                        <th style={{borderTop: 'transparent', borderLeft: 'transparent', backgroundColor: 'transparent'}}></th>
                        <th>1</th>
                        <th>2</th>
                        <th>3</th>
                        <th>4</th>
                        <th>5</th>
                    </tr>
                </thead>
                <tbody >
                    <tr>
                        <th>5</th>
                        <td style={{backgroundColor: '#a5d68f'}}>{getRiscos(5, 1) || '-'}</td>
                        <td style={{backgroundColor: '#ffe990'}}>{getRiscos(5, 2) || '-'}</td>
                        <td style={{backgroundColor: '#ffb486'}}>{getRiscos(5, 3) || '-'}</td>
                        <td style={{backgroundColor: '#ff9595'}}>{getRiscos(5, 4) || '-'}</td>
                        <td style={{backgroundColor: '#ff9595'}}>{getRiscos(5, 5) || '-'}</td>
                    </tr>
                    <tr>
                        <th>4</th>
                        <td style={{backgroundColor: '#78bf9d'}}>{getRiscos(4, 1) || '-'}</td>
                        <td style={{backgroundColor: '#a5d68f'}}>{getRiscos(4, 2) || '-'}</td>
                        <td style={{backgroundColor: '#ffe990'}}>{getRiscos(4, 3) || '-'}</td>
                        <td style={{backgroundColor: '#ffb486'}}>{getRiscos(4, 4) || '-'}</td>
                        <td style={{backgroundColor: '#ff9595'}}>{getRiscos(4, 5) || '-'}</td>
                    </tr>
                    <tr>
                        <th>3</th>
                        <td style={{backgroundColor: '#78bf9d'}}>{getRiscos(3, 1) || '-'}</td>
                        <td style={{backgroundColor: '#a5d68f'}}>{getRiscos(3, 2) || '-'}</td>
                        <td style={{backgroundColor: '#ffe990'}}>{getRiscos(3, 3) || '-'}</td>
                        <td style={{backgroundColor: '#ffb486'}}>{getRiscos(3, 4) || '-'}</td>
                        <td style={{backgroundColor: '#ff9595'}}>{getRiscos(3, 5) || '-'}</td>
                    </tr>
                    <tr>
                        <th>2</th>
                        <td style={{backgroundColor: '#78bf9d'}}>{getRiscos(2, 1) || '-'}</td>
                        <td style={{backgroundColor: '#a5d68f'}}>{getRiscos(2, 2) || '-'}</td>
                        <td style={{backgroundColor: '#a5d68f'}}>{getRiscos(2, 3) || '-'}</td>
                        <td style={{backgroundColor: '#ffe990'}}>{getRiscos(2, 4) || '-'}</td>
                        <td style={{backgroundColor: '#ffb486'}}>{getRiscos(2, 5) || '-'}</td>
                    </tr>
                    <tr>
                        <th>1</th>
                        <td style={{backgroundColor: '#78bf9d'}}>{getRiscos(1, 1) || '-'}</td>
                        <td style={{backgroundColor: '#78bf9d'}}>{getRiscos(1, 2) || '-'}</td>
                        <td style={{backgroundColor: '#a5d68f'}}>{getRiscos(1, 3) || '-'}</td>
                        <td style={{backgroundColor: '#ffe990'}}>{getRiscos(1, 4) || '-'}</td>
                        <td style={{backgroundColor: '#ffe990'}}>{getRiscos(1, 5) || '-'}</td>
                    </tr>
                </tbody>
            </table>
            </div>
            </div>
        </div>
    )
};

export default TabelaAnalise;