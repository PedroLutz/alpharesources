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
        risco: '',
        areaImpacto: '',
        valor: '',
        descricao: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [impactos, setImpactos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const {isAdmin} = useContext(AuthContext);

    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'riscos/impacto',
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

    const handleUpdateItem = async () => {
        if (confirmUpdateItem) {
            setLoading(true);
            const updatedItem = { ...confirmUpdateItem, ...novosDados };

            const updatedRiscos = impactos.map(item =>
                item._id === updatedItem._id ? { ...updatedItem } : item
            );
            setImpactos(updatedRiscos);
            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'riscos/impacto/update?id',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
                setImpactos(riscos);
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
                    route: 'riscos/impacto',
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
            const data = await fetchData('riscos/impacto/get/all');
            setImpactos(data.riscoImpactos);
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

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2>Risk Impact Analysis</h2>
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
                    <table className={styles.tabelaRisco}>
                        <thead>
                            <tr>
                                <th>Risk</th>
                                <th>Area of impact</th>
                                <th style={{fontSize: '0.7rem', width: '3rem'}}>Score</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {impactos.map((item, index) => (
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
                                                    {index === 0 || impactos[index - 1].risco !== item.risco ? (
                                                        <td rowSpan={calculateRowSpan(impactos, item.risco, index)}
                                                        >{item.risco}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{item.risco}</td>
                                            )}
                                            <td>{item.areaImpacto}</td>
                                            <td style={{width: '3rem', textAlign: 'center'}}>{item.valor}</td>
                                            <td style={{fontSize: '0.7rem'}}>{item.descricao}</td>
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
        </div>
    )
};

export default TabelaAnalise;