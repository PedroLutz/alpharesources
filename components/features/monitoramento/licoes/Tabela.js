import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/monitoramento.module.css'
import Inputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import { cleanForm, isoDateToEuDate } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";

const Tabela = () => {
    const { user, token } = useAuth();
    const user_id = user.id;
    const { isEditor } = usePerm();
    const camposVazios = {
        date: '',
        type: '',
        situation: '',
        learning: '',
        action: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [licoes, setLicoes] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);


    //funcao que envia os dados de novoSubmit para cadastro
    const enviar = async () => {
        await handleReq({
            table: 'lesson',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                user_id
            },
            fetchData: fetchLicoes
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };


    //funcao que trata os dados e os envia para atualizacao
    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'lesson',
                route: 'update',
                token,
                data: novosDados,
                fetchData: fetchLicoes
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setReload(true);
        setLoading(false);
        setLinhaVisivel();
        setNovosDados(camposVazios);
    };

    //funcao que envia o id para ser deletado
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "lesson",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchLicoes
            });
            setExibirModal(`deleteSuccess`);
            setConfirmDeleteItem(null);
        }
    };


    //funcao que busca os dados
    const fetchLicoes = async () => {
        try {
            const data = await handleFetch({
                table: 'lesson',
                query: 'all',
                token
            })
            setLicoes(data.data);
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
            <h2 className="smallTitle">Lessons learned</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete the lesson for "${confirmDeleteItem.situation}"?`,
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
                    <table className={`tabela ${styles.tabela_licoes}`}>
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
                                    {linhaVisivel === licao.id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => setLinhaVisivel()
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            <td className={styles.licoesData}>{isoDateToEuDate(licao.date)}</td>
                                            <td className={styles.licoesTipo}>{licao.type ? 'Explicit' : 'Tacit'}</td>
                                            <td className={styles.licoesSituacao}>{licao.situation}</td>
                                            <td className={styles.licoesAprendizado}>{licao.learning}</td>
                                            <td className={styles.licoesAcao}>{licao.action}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(licao)} disabled={!isEditor}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(licao.id); setNovosDados(licao)
                                                }
                                                } disabled={!isEditor}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <Inputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{ enviar }}
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