import React, { useEffect, useState, useContext } from "react"
import styles from '../../../../styles/modules/monitoramento.module.css'
import Inputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../../functions/crud";
import { cleanForm, jsDateToEuDate, euDateToIsoDate } from "../../../../functions/general";
import { AuthContext } from "../../../../contexts/AuthContext";

const Tabela = () => {
    const camposVazios = {
        data: '',
        tipo: '',
        situacao: '',
        aprendizado: '',
        acao: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [licoes, setLicoes] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useContext(AuthContext)


    //funcao que envia os dados de novoSubmit para cadastro
    const enviar = async (e) => {
        e.preventDefault();
        await handleSubmit({
            route: 'monitoramento/licoes',
            dados: novoSubmit,
            fetchDados: fetchLicoes
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
                route: 'monitoramento/licoes/update?id',
                dados: novosDados,
                fetchDados: fetchLicoes
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
                    route: 'monitoramento/licoes',
                    item: confirmDeleteItem,
                    fetchDados: fetchLicoes
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
    const fetchLicoes = async () => {
        try {
            const data = await fetchData('monitoramento/licoes/get/all');
            data.licoes.forEach((licao) => {
                licao.data = jsDateToEuDate(licao.data)
            })
            setLicoes(data.licoes);
        } finally {
            setLoading(false);
        }
    };

    //useEffect que so executa quando reload eh igual true
    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchLicoes();
        }
    }, [reload]);

    //useEffect que so executa no primeiro render
    useEffect(() => {
        fetchLicoes();
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
            <h2>Lessons learned</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.situacao}"?`,
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
                    <table className={styles.tabela_licoes}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Situation</th>
                                <th>Lesson learned</th>
                                <th>Action taken</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {licoes.map((licao, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === licao._id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => linhaVisivel === licao._id ? setLinhaVisivel() : setLinhaVisivel(licao._id)
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            <td id={styles.licoesData}>{licao.data}</td>
                                            <td id={styles.licoesTipo}>{licao.tipo}</td>
                                            <td id={styles.licoesSituacao}>{licao.situacao}</td>
                                            <td id={styles.licoesAprendizado}>{licao.aprendizado}</td>
                                            <td id={styles.licoesAcao}>{licao.acao}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(licao)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(licao._id); handleUpdateClick(licao)
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