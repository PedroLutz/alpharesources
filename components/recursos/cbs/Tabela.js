import React, { useEffect, useState, useContext } from "react";
import Loading from '../../Loading';
import Modal from '../../Modal';
import { handleSubmit, fetchData, handleDelete, handleUpdate } from '../../../functions/crud';
import { jsDateToEuDate, euDateToIsoDate, cleanForm, euDateToJsDate } from '../../../functions/general';
import { AuthContext } from '../../../contexts/AuthContext';
import CadastroInputs from "./CadastroInputs";
import styles from '../../../styles/modules/cbs.module.css'

const Tabela = () => {
    const [dadosCbs, setDadosCbs] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [linhaVisivel, setLinhaVisivel] = useState({});
    const [reload, setReload] = useState(false);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [cores, setCores] = useState([]);
    const camposVazios = {
        codigo: "",
        area: "",
        item: "",
        custo_ideal: "",
        custo_essencial: "",
        custo_real: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const { isAdmin } = useContext(AuthContext);

    const fetchCbs = async () => {
        try {
            const data = await fetchData('recursos/cbs/get/all');
            const data_emvs = await fetchData('riscos/analise/get/emvs_per_item');
            data.cbs.forEach((item) => {
                item.contingencia = data_emvs.resultadosAgrupados[item.item];
            })
            setDadosCbs(data.cbs);
        } finally {
            setLoading(false);
        }
    }

    const fetchCores = async () => {
            const data = await fetchData('wbs/get/cores');
            var cores = {};
            data.areasECores.forEach((area) => {
              cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
            })
            setCores(cores);
          }

    useEffect(() => {
        setReload(false);
        fetchCbs();
        fetchCores();
    }, [reload]);

    const enviar = async (e) => {
        e.preventDefault();
        handleSubmit({
            route: 'recursos/cbs',
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
            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            setReload(true);
            try {
                await handleUpdate({
                    route: 'recursos/cbs/update?id',
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
                    route: 'recursos/cbs',
                    item: confirmDeleteItem,
                    fetchDados: fetchCbs
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

    const checkDados = (tipo) => {
        setExibirModal(tipo); return;
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2>Cost Breakdown Structure (CBS)</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete the CBS plan for "${confirmDeleteItem.area} - ${confirmDeleteItem.item}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabela_cbs_container}>
                <div className={styles.tabela_cbs_wrapper}>
                    <table className={styles.tabela_cbs}>
                        <thead>
                            <tr>
                                <th className={styles.td_code}>Code</th>
                                <th>Area</th>
                                <th>Item</th>
                                <th className={styles.td_custos}>Ideal cost</th>
                                <th className={styles.td_custos}>Essential cost</th>
                                <th style={{fontSize: '0.7rem'}} className={styles.td_custos}>Contingency</th>
                                <th className={styles.td_custos}>Actual cost</th>
                                <th>Comparison</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dadosCbs.map((cbs, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === cbs._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => { linhaVisivel === cbs._id ? setLinhaVisivel() : setLinhaVisivel(cbs._id) }
                                            }}
                                            checkDados={checkDados}
                                        />
                                    ) : (
                                        <tr style={{backgroundColor: cores[cbs.area]}}>
                                            <td className={styles.td_code}>{cbs.codigo}</td>
                                            <td>{cbs.area}</td>
                                            <td>{cbs.item}</td>
                                            <td className={styles.td_custos}>R${cbs.custo_ideal}</td>
                                            <td className={styles.td_custos}>R${cbs.custo_essencial}</td>
                                            <td className={styles.td_custos}>R${cbs.contingencia ? cbs.contingencia : 0}</td>
                                            <td className={styles.td_custos}>R${cbs.custo_real}</td>
                                            <td>In relation to: <br/>
                                                Ideal cost: R${cbs.custo_real - cbs.custo_ideal}<br/>
                                                Essencial cost: R${cbs.custo_essencial - cbs.custo_ideal}<br/>
                                                Ideal cost + contingency: R${cbs.custo_real + (cbs.contingencia ? cbs.contingencia : 0) - cbs.custo_ideal}<br/>
                                            </td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(cbs)}
                                                    disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(cbs._id); handleUpdateClick(cbs);
                                                }
                                                }
                                                disabled={!isAdmin}>⚙️</button>
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