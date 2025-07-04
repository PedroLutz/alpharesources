import React, { useEffect, useState, useContext } from "react"
import styles from '../../../styles/modules/risco.module.css'
import CadastroInputs from "./Inputs";
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext";

const TabelaRiscos = () => {
    const camposVazios = {
        area: '',
        item: '',
        risco: '',
        classificacao: '',
        ehNegativo: '',
        efeito: '',
        causa: '',
        gatilho: '',
        dono: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [riscos, setRiscos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUptading] = useState(false);
    const [cores, setCores] = useState({});
    const { isAdmin } = useContext(AuthContext);

    const enviar = async () => {
        await handleSubmit({
            route: 'riscos/risco',
            dados: novoSubmit,
            fetchDados: fetchRiscos
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const isRiscoCadastrado = (risco) => {
        return riscos.some((r) => r.risco.trim().toLowerCase() === risco.trim().toLowerCase());
    }

    const fetchCores = async () => {
        const data = await fetchData('wbs/get/cores');
        var cores = {};
        data.areasECores.forEach((area) => {
            cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
        })
        setCores(cores);
    }

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleUpdate({
                route: 'riscos/risco/update?id',
                dados: novosDados,
                fetchDados: fetchRiscos
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setIsUptading(false);
        setLinhaVisivel();
        setLoading(false);
        setNovosDados(camposVazios);
    };

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleDelete({
                    route: 'riscos/risco',
                    item: confirmDeleteItem,
                    fetchDados: fetchRiscos
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

    const fetchRiscos = async () => {
        setLoading(true);
        try {
            const data = await fetchData('riscos/risco/get/all');
            setRiscos(data.riscos);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRiscos();
        fetchCores();
    }, [])

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!',
        'riscoRepetido': 'You have already registered this risk!'
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
                                <th>Classification</th>
                                <th>Category</th>
                                <th>Effect</th>
                                <th>Cause</th>
                                <th>Trigger</th>
                                <th>Owner</th>
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
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => {
                                                    linhaVisivel === item._id ?
                                                        setLinhaVisivel() :
                                                        setLinhaVisivel(item._id); setIsUptading(false);
                                                },
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr style={{ backgroundColor: cores[item.area] }}>
                                            {!isUpdating || isUpdating[0] !== item.area ? (
                                                <React.Fragment>
                                                    {index === 0 || riscos[index - 1].area !== item.area ? (
                                                        <td rowSpan={calculateRowSpan(riscos, item.area, index, 'area')}
                                                        >{item.area}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{item.area}</td>
                                            )}
                                            {!isUpdating || isUpdating[1] !== item.item ? (
                                                <React.Fragment>
                                                    {index === 0 || riscos[index - 1].item !== item.item ? (
                                                        <td rowSpan={calculateRowSpan(riscos, item.item, index, 'item')}
                                                        >{item.item}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{item.item}</td>
                                            )}
                                            <td>{item.risco}</td>
                                            <td>{item.classificacao}</td>
                                            <td>{item.ehNegativo ? 'Threat' : 'Opportunity'}</td>
                                            <td>{item.efeito}</td>
                                            <td>{item.causa}</td>
                                            <td>{item.gatilho}</td>
                                            <td>{item.dono}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(item)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(item._id); setNovosDados(item); setIsUptading([item.area, item.item, index])
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
                                funcoes={{ enviar, isRiscoCadastrado }}
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default TabelaRiscos;