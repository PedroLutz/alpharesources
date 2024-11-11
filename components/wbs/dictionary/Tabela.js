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
        area: '',
        item: '',
        descricao: '',
        criterio: '',
        verificacao: '',
        timing: '',
        responsavel: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [dicionarios, setDicionarios] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cores, setCores] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const {isAdmin} = useContext(AuthContext)

    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'wbsDictionary',
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

    const fetchCores = async () => {
        const data = await fetchData('wbs/get/cores');
        var cores = {};
        data.areasECores.forEach((area) => {
          cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
        })
        setCores(cores);
      }

    const handleUpdateItem = async () => {
        if (confirmUpdateItem) {
            setLoading(true);
            const updatedItem = { ...confirmUpdateItem, ...novosDados };

            const updatedRiscos = dicionarios.map(item =>
                item._id === updatedItem._id ? { ...updatedItem } : item
            );
            setDicionarios(updatedRiscos);
            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'wbsDictionary/update?id',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
                setDicionarios(dicionarios);
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
                    route: 'wbsDictionary',
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
            const data = await fetchData('wbsDictionary/get/all');
            setDicionarios(data.dicionarios);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setReload(false);
        fetchAnalises();
        fetchCores();
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
            if (itens[i].area === currentArea) {
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
            <h2>WBS Dictionary</h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.item}"?`,
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
                                <th>Description + Purpose</th>
                                <th>Acceptance Criteria</th>
                                <th>Verification</th>
                                <th>Timing</th>
                                <th>Responsible</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {dicionarios.map((item, index) => (
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
                                        <tr style={{backgroundColor: cores[item.area]}}>
                                            {!isUpdating || isUpdating !== item.area ? (
                                                <React.Fragment>
                                                    {index === 0 || dicionarios[index - 1].area !== item.area ? (
                                                        <td rowSpan={calculateRowSpan(dicionarios, item.area, index)}
                                                        >{item.area}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{item.area}</td>
                                            )}
                                            <td>{item.item}</td>
                                            <td>{item.descricao}</td>
                                            <td>{item.criterio}</td>
                                            <td>{item.verificacao}</td>
                                            <td>{item.timing}</td>
                                            <td>{item.responsavel}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(item)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(item._id); handleUpdateClick(item); setIsUpdating(item.area)
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