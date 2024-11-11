import React, { useEffect, useState, useContext } from "react"
import styles from '../../../styles/modules/infoComunicada.module.css'
import CadastroInputs from "./CadastroInputs";
import InputCheck from './InputCheck'
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext";

const Tabela = () => {
    const camposVazios = {
        stakeholder: "",
        informacao: "",
        timing: "",
        check: false
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [infoComunicada, setInfoComunicada] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const {isAdmin} = useContext(AuthContext);

    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'infoComunicada',
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

    const handleUpdateCheck = async (checked, item) => {
        if(item) {
            setLoading(true);
            const updatedItem = { _id: item._id, check: checked};
            try{
                await handleUpdate({
                    route: 'infoComunicada',
                    dados: updatedItem,
                    item: item
                })
            } catch (error){
                console.error('Update failed: ', error)
            }
            setLoading(false);
        }
    }

    const handleUpdateItem = async () => {
        if (confirmUpdateItem) {
            setLoading(true);
            const updatedItem = { ...confirmUpdateItem, ...novosDados };

            const updatedInfoComunicadas = infoComunicada.map(item =>
                item._id === updatedItem._id ? { ...updatedItem } : item
            );
            setInfoComunicada(updatedInfoComunicadas);
            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'infoComunicada',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
                setInfoComunicada(infoComunicada);
                setConfirmUpdateItem(confirmUpdateItem)
                console.error("Update failed:", error);
            }
            setLoading(false)
        }
    };

    const handleConfirmDelete = () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = handleDelete({
                    route: 'infoComunicada',
                    item: confirmDeleteItem,
                    fetchDados: fetchStakeholders
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

    const fetchStakeholders = async () => {
        try {
            const data = await fetchData('infoComunicada/get/all');
            setInfoComunicada(data.infoComunicada);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setReload(false);
        fetchStakeholders();
    }, [reload]);

    const checkDados = (tipo) => {
        setExibirModal(tipo); return;
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

    const calculateRowSpan = (infoComunicadas, currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < infoComunicadas.length; i++) {
            if (infoComunicadas[i].stakeholder === currentArea) {
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
            <h2>Communication Monitoring</h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.informacao}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabelaComunicacao_container}>
                <div className={styles.tabelaComunicacao_wrapper}>
                    <table className={styles.tabelaComunicacao}>
                        <thead>
                            <tr>
                                <th>Stakeholder</th>
                                <th>Information</th>
                                <th>Timing</th>
                                <th>Check</th>
                                <th>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {infoComunicada.map((info, index) => (
                                <tr key={index}>
                                    {index === 0 || infoComunicada[index - 1].stakeholder !== info.stakeholder ? (
                                                <td rowSpan={calculateRowSpan(infoComunicada, info.stakeholder, index)}
                                                >{info.stakeholder}</td>
                                            ) : null}
                                    {linhaVisivel === info._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => linhaVisivel === info._id ? setLinhaVisivel() : setLinhaVisivel(info._id)
                                            }}
                                            checkDados={checkDados}
                                        />
                                    ) : (
                                        
                                            <React.Fragment>
                                            
                                            <td>{info.informacao}</td>
                                            <td>{info.timing}</td>
                                            <td style={{width: '2rem'}}><InputCheck funcao={handleUpdateCheck} item={info}/></td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(info)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(info._id); handleUpdateClick(info)
                                                }
                                                } disabled={!isAdmin}>⚙️</button>
                                            </td>
                                            </React.Fragment>  
                                    )}
                                </tr>
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

export default Tabela;