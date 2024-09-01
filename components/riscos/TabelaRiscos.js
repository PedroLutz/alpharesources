import React, { useEffect, useState } from "react"
import styles from '../../styles/modules/risco.module.css'
import CadastroInputs from "./InputRiscos";
import Modal from "../Modal";
import Loading from "../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../functions/crud";
import { cleanForm } from "../../functions/general";

const TabelaRiscos = () => {
    const camposVazios = {
        area: '',
        item: '',
        risco: '',
        efeito: '',
        ehNegativo: '',
        causas: '',
        gatilho: '',
        ocorrencia: '',
        impacto: '',
        urgencia: '',
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [riscos, setRiscos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);

    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'riscos/riscos',
            dados: novoSubmit
        });
        cleanForm(novoSubmit, setNovoSubmit);
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

            const updatedRiscos = riscos.map(item =>
                item._id === updatedItem._id ? { ...updatedItem } : item
            );
            setRiscos(updatedRiscos);
            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'riscos/riscos/update?id',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
                setRiscos(riscos);
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
                    route: 'riscos/riscos',
                    item: confirmDeleteItem,
                    fetchDados: fetchRiscos
                });
            } finally {
                setExibirModal(`deleteSuccess-${getDeleteSuccess}`)
            }
        }
        if(getDeleteSuccess){
            setExibirModal(`deleteSuccess`)
        } else {
            setExibirModal(`deleteFail`)
        }
        setConfirmDeleteItem(null);
    };

    const fetchRiscos = async () => {
        try{
            const data = await fetchData('riscos/riscos/get/all');
            setRiscos(data.riscos);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setReload(false);
        fetchRiscos();
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

    const calculateRowSpan = (itensArea, currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < itensArea.length; i++) {
            if (itensArea[i].area === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    return (
        <div className="centered-container">
            {loading && <Loading/>}
            <h2>Risk Identification</h2>
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
                                <th>Area</th>
                                <th>Item</th>
                                <th>Risk</th>
                                <th>Effect</th>
                                <th>Category</th>
                                <th>Causes</th>
                                <th>Trigger</th>
                                <th>Occurence</th>
                                <th>Impact</th>
                                <th>Urgency</th>
                                <th>RPN</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            
                            {riscos.map((item, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === item._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id)
                                            }}
                                            checkDados={checkDados}
                                        />
                                    ) : (
                                        <tr> 
                                            {index === 0 || riscos[index - 1].area !== item.area? (
                                                <td rowSpan={calculateRowSpan(riscos, item.area, index)}
                                                >{item.area}</td>
                                            ) : null}
                                            <td>{item.item}</td>
                                            <td>{item.risco}</td>
                                            <td>{item.efeito}</td>
                                            <td>{item.ehNegativo ? 'Threat' : 'Opportunity'}</td>
                                            <td>{item.causas}</td>
                                            <td>{item.gatilho}</td>
                                            <td>{item.ocorrencia}</td>
                                            <td>{item.impacto}</td>
                                            <td>{item.urgencia}</td>
                                            <td>{(item.ocorrencia * item.impacto * item.urgencia)}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(item)}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(item._id); handleUpdateClick(item)
                                                }
                                                }>⚙️</button>
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

export default TabelaRiscos;