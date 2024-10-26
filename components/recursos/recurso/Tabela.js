import React, { useEffect, useState, useContext } from "react"
import CadastroInputs from "./CadastroInputs";
import styles from '../../../styles/modules/recursos.module.css'
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext";

const Tabela = () => {
    const camposVazios = {
        area: "",
        item: "",
        recurso: "",
        uso: "",
        status: "",
        ehEssencial: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [recursos, setRecursos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [cores, setCores] = useState([]);
    const {isAdmin} = useContext(AuthContext)

    const fetchCores = async () => {
        const data = await fetchData('wbs/get/cores');
        var cores = {};
        data.areasECores.forEach((area) => {
          cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
        })
        setCores(cores);
      }

    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'recursos/recurso',
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

    const fetchRecursos = async () => {
        try {
            const data = await fetchData('recursos/recurso/get/all');
            setRecursos(data.recursos);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateItem = async () => {
        if (confirmUpdateItem) {
            setLoading(true);
            const updatedItem = { ...confirmUpdateItem, ...novosDados };

            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'recursos/recurso/update?id',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
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
                    route: 'recursos/recurso',
                    item: confirmDeleteItem,
                    fetchDados: fetchRecursos
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

    useEffect(() => {
        setReload(false);
        fetchRecursos();
        fetchCores();
    }, [reload]);

    const checkDados = (tipo) => {
        setExibirModal(tipo); return;
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

    const calculateRowSpan = (itens, currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < itens.length; i++) {
            if (itens[i][parametro] === currentArea) {
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
            <h2>Resource Identification</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.recurso}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabela_financas_container}>
                <div className={styles.tabela_financas_wrapper}>
                    <table className={styles.tabela_financas}>
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Item</th>
                                <th>Resource</th>
                                <th>Use</th>
                                <th>Acquisition method</th>
                                <th>Essential</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recursos.map((recurso, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === recurso._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => { linhaVisivel === recurso._id ? setLinhaVisivel() : setLinhaVisivel(recurso._id); setIsUpdating(false) }
                                            }}
                                            checkDados={checkDados}
                                        />
                                    ) : (
                                        <tr style={{backgroundColor: cores[recurso.area]}}>
                                            {!isUpdating || isUpdating[0] !== recurso.area ? (
                                                <React.Fragment>
                                                    {index === 0 || recursos[index - 1].area !== recurso.area ? (
                                                        <td rowSpan={calculateRowSpan(recursos, recurso.area, index, 'area')}
                                                        >{recurso.area}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{recurso.area}</td>
                                            )}
                                            {!isUpdating || isUpdating[1] !== recurso.item ? (
                                                <React.Fragment>
                                                    {index === 0 || recursos[index - 1].item !== recurso.item ? (
                                                        <td rowSpan={calculateRowSpan(recursos, recurso.item, index, 'item')}
                                                        >{recurso.item}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{recurso.item}</td>
                                            )}
                                            <td>{recurso.recurso}</td>
                                            <td>{recurso.uso}</td>
                                            <td>{recurso.status}</td>
                                            <td>{recurso.ehEssencial ? 'Yes' : 'No'}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(recurso)}
                                                    disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(recurso._id); handleUpdateClick(recurso); setIsUpdating([recurso.area, recurso.item])
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
}

export default Tabela;