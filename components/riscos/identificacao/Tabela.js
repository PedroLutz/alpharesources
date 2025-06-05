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
    const [dadosUpdateTudo, setDadosUpdateTudo] = useState({
        oldRisco: '',
        newRisco: ''
    })
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [riscos, setRiscos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUptading] = useState(false);
    const [cores, setCores] = useState({});
    const {isAdmin} = useContext(AuthContext);

    const enviar = async (e) => {
        e.preventDefault();
        await handleSubmit({
            route: 'riscos/risco',
            dados: novoSubmit
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
        setReload(true);
    };

    const handleUpdateClick = (item) => {
        setDadosUpdateTudo({
            oldRisco: item.risco,
            newRisco: ''
        });
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
            const dadosUpdate = {
                ...dadosUpdateTudo,
                newRisco: novosDados.risco
            }

            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            
            try {
                await handleUpdate({
                    route: 'riscos/risco/update/update?id',
                    dados: updatedItem,
                    item: confirmUpdateItem
                });
            } catch (error) {
                setRiscos(riscos);
                setConfirmUpdateItem(confirmUpdateItem)
                console.error("Update failed:", error);
            }
            try {
                const response = await fetch(`/api/riscos/risco/update/tudoRiscos`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(dadosUpdate),
                });
      
                if (response.status === 200) {
                  return;
                } else {
                  console.error(`Erro ao atualizar outras áreas de riscos`);
                }
              } catch (error) {
                console.error(`Erro ao atualizar outros áreas de riscos, ${error}`);
              }
            setDadosUpdateTudo({oldRisco: '',
                newRisco: ''});
            setLoading(false);
            setReload(true);
        }
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
        if(reload == true){
            setReload(false);
            fetchRiscos();
            fetchCores();
        }
    }, [reload]);

    useEffect(() => {
        fetchRiscos();
        fetchCores();
    }, [])

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!'
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
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => { linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); setIsUptading(false); }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr style={{backgroundColor: cores[item.area]}}>
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
                                                    setLinhaVisivel(item._id); handleUpdateClick(item); setIsUptading([item.area, item.item])
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