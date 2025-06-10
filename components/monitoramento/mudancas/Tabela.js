import React, { useEffect, useState, useContext } from "react"
import styles from '../../../styles/modules/monitoramento.module.css'
import Inputs from "./Inputs";
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm, jsDateToEuDate, euDateToIsoDate } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext";

const Tabela = () => {
    const camposVazios = {
        data: '',
        area: '',
        tipo: '',
        item_config: '',
        mudanca: '',
        justificativa: '',
        impacto: '',
        aprovado: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [mudancas, setMudancas] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useContext(AuthContext)


    //funcao que envia os dados de novoSubmit para cadastro
    const enviar = async (e) => {
        e.preventDefault();
        await handleSubmit({
            route: 'monitoramento/mudancas',
            dados: novoSubmit,
            fetchDados: fetchMudancas
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };


    //funcao que recebe o item, o insere no estado confirmUpdateItem e como objeto de novosDados
    const handleUpdateClick = (item) => {
        setNovosDados({
            ...item,
            data: euDateToIsoDate(item.data),
        });
    };


    //funcao que trata os dados e os envia para atualizacao
    const handleUpdateItem = async () => {
        setLoading(true);
        delete novosDados.mediaBeneficios;
        try {
            await handleUpdate({
                route: 'monitoramento/mudancas/update?id',
                dados: novosDados,
                fetchDados: fetchMudancas
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLinhaVisivel();
        setLoading(false);
        setNovosDados(camposVazios);
    };

    //funcao que envia o id para ser deletado
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleDelete({
                    route: 'monitoramento/mudancas',
                    item: confirmDeleteItem,
                    fetchDados: fetchMudancas
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


    //funcao que busca os dados
    const fetchMudancas = async () => {
        try {
            const data = await fetchData('monitoramento/mudancas/get/all');
            data.mudancas.forEach((mudanca) => {
                mudanca.data = jsDateToEuDate(mudanca.data)
            })
            setMudancas(data.mudancas);
        } finally {
            setLoading(false);
        }
    };

    //useEffect que so executa quando reload eh igual true
    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchMudancas();
        }
    }, [reload]);

    //useEffect que so executa no primeiro render
    useEffect(() => {
        fetchMudancas();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!'
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2>Change Log</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.item_config}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.container}>
                <div className={styles.wrapper}>
                    <table className={styles.tabela_mudancas}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Area</th>
                                <th>Type of change</th>
                                <th>Configurated item</th>
                                <th>Change</th>
                                <th>Reasoning</th>
                                <th>Impact</th>
                                <th>Decision</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {mudancas.map((mudanca, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === mudanca._id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => linhaVisivel === mudanca._id ? setLinhaVisivel() : setLinhaVisivel(mudanca._id)
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            <td>{mudanca.data}</td>
                                            <td>{mudanca.area}</td>
                                            <td>{mudanca.tipo}</td>
                                            <td>{mudanca.item_config}</td>
                                            <td>{mudanca.mudanca}</td>
                                            <td>{mudanca.justificativa}</td>
                                            <td>{mudanca.impacto}</td>
                                            <td>{mudanca.aprovado ? 'Approved' : 'Rejected'}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(mudanca)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(mudanca._id); handleUpdateClick(mudanca)
                                                }
                                                } disabled={!isAdmin}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <Inputs
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

export default Tabela;