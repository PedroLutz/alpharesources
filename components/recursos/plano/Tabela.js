import React, { useEffect, useState } from "react"
import CadastroInputs from "./CadastroInputs";
import styles from '../../../styles/modules/planoAquisicao.module.css'
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm, jsDateToEuDate, euDateToIsoDate } from "../../../functions/general";
import { update } from "lodash";


const PlanoAquisicao = () => {
    const camposVazios = {
        area: "",
        ehEssencial: '',
        recurso: "",
        plano_a: "",
        valor_a: "",
        data_esperada: "",
        data_limite: "",
        plano_b: "",
        valor_b: "",
        plano_real: "",
        data_real: "",
        valor_real: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [planos, setPlanos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);

    const enviar = async (e) => {
        e.preventDefault();
        console.log(novoSubmit)
        handleSubmit({
            route: 'recursos/planoAquisicao',
            dados: novoSubmit
        });
        cleanForm(novoSubmit, setNovoSubmit);
        setReload(true);
    };

    const handleUpdateClick = (item) => {
        setConfirmUpdateItem(item)
        setNovosDados({
            ...item,
            data_esperada: euDateToIsoDate(item.data_esperada),
            data_limite: euDateToIsoDate(item.data_limite),
            data_real: euDateToIsoDate(item.data_real)

        });
    };

    const fetchPlanos = async () => {
        try {
            const data = await fetchData('recursos/planoAquisicao/get/all');
            data.planos.forEach((item) => {
                item.data_esperada = jsDateToEuDate(item.data_esperada);
                item.data_limite = jsDateToEuDate(item.data_limite);
                item.data_real = jsDateToEuDate(item.data_real);
              });
            setPlanos(data.planos);
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
                    route: 'recursos/planoAquisicao/update?id',
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
                    route: 'recursos/planoAquisicao',
                    item: confirmDeleteItem,
                    fetchDados: fetchPlanos
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
        fetchPlanos();
    }, [reload]);

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
            <h2>Resource Acquisition Planning</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete the acquisition plan for "${confirmDeleteItem.recurso}"?`,
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
                                <th rowSpan="2">Resource</th>
                                <th colSpan="2">Plan A</th>
                                <th colSpan="2">Milestones</th>
                                <th colSpan="2">Plan B</th>
                                <th colSpan="3">Results</th>
                                <th rowSpan="2">Actions</th>
                            </tr>
                            <tr>
                                <th>Plan</th>
                                <th>Value</th>
                                <th>Expected date</th>
                                <th>Critical date</th>
                                <th>Plan</th>
                                <th>Value</th>
                                <th>Actual strategy</th>
                                <th>Date</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {planos.map((plano, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === plano._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => linhaVisivel === plano._id ? setLinhaVisivel() : setLinhaVisivel(plano._id)
                                            }}
                                            checkDados={checkDados}
                                        />
                                    ) : (
                                        <tr>
                                            <td>{plano.recurso}</td>
                                            <td>{plano.plano_a}</td>
                                            <td>{plano.valor_a}</td>
                                            <td>{plano.data_esperada}</td>
                                            <td>{plano.data_limite}</td>
                                            <td>{plano.plano_b}</td>
                                            <td>{plano.valor_b}</td>
                                            <td>{plano.plano_real || '-'}</td>
                                            <td>{plano.data_real != 'NaN/NaN/NaN' ? plano.data_real : '-'}</td>
                                            <td>{plano.valor_real || '-'}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(plano)}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(plano._id); handleUpdateClick(plano)
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
}

export default PlanoAquisicao;