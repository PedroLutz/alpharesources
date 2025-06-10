import React, { useEffect, useState, useContext } from "react"
import styles from '../../../styles/modules/comunicacao.module.css'
import Inputs from "./Inputs";
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../functions/crud";
import { cleanForm } from "../../../functions/general";
import { AuthContext } from "../../../contexts/AuthContext";
import Link from "next/link";

const Tabela = () => {
    const camposVazios = {
        grupo: "",
        stakeholder: "",
        informacao: "",
        metodo: "",
        frequencia: "",
        canal: "",
        responsavel: "",
        registro: "",
        feedback: "",
        acao: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [informacoes, setInformacoes] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useContext(AuthContext);
    const [isUpdating, setIsUptading] = useState(false);

    //funcao que envia os dados para registro no backend
    const enviar = async (e) => {
        e.preventDefault();
        await handleSubmit({
            route: 'comunicacao/informacao',
            dados: novoSubmit,
            fetchDados: fetchInformacoes
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    //funcao que trata os dados e envia o conteudo para o backend para update
    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleUpdate({
                route: 'comunicacao/informacao/update?id',
                dados: novosDados,
                fetchDados: fetchInformacoes
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLinhaVisivel();
        setLoading(false);
        setNovosDados(camposVazios);
    };

    //funcao que envia os dados para atualizacao no backend
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleDelete({
                    route: 'comunicacao/informacao',
                    item: confirmDeleteItem,
                    fetchDados: fetchInformacoes
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

    //funcao que busca as informacoes no backend
    const fetchInformacoes = async () => {
        try {
            const data = await fetchData('comunicacao/informacao/get/all');
            setInformacoes(data.informacoes);
        } finally {
            setLoading(false);
        }
    };

    //useEffect que so roda quando reload atualiza
    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchInformacoes();
        }
    }, [reload]);

    //useEffect que so roda no primeiro render
    useEffect(() => {
        fetchInformacoes();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

    //funcao que calcula o rowSpan de grupo de acordo com a quantidade de stakeholders nele
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
            <h2>Communicated Information</h2>

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
                    <table className={styles.tabelaInformacao}>
                        <thead>
                            <tr>
                                <th>Stakeholder Group</th>
                                <th>Stakeholder</th>
                                <th>Information</th>
                                <th>Method</th>
                                <th>Frequency</th>
                                <th>Channel</th>
                                <th>Responsible</th>
                                <th>Record</th>
                                <th>Feedback</th>
                                <th>Action taken</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {informacoes.map((informacao, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === informacao._id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcao={{
                                                funcao1: () => handleUpdateItem(),
                                                funcao2: () => { linhaVisivel === informacao._id ? setLinhaVisivel() : setLinhaVisivel(item._id); setIsUptading(false); }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            {!isUpdating || isUpdating[0] !== informacao.grupo ? (
                                                <React.Fragment>
                                                    {index === 0 || informacoes[index - 1].grupo !== informacao.grupo ? (
                                                        <td rowSpan={calculateRowSpan(informacoes, informacao.grupo, index, 'grupo')}
                                                        >{informacao.grupo}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{informacao.grupo}</td>
                                            )}
                                            {!isUpdating || isUpdating[1] !== informacao.stakeholder ? (
                                                <React.Fragment>
                                                    {index === 0 || informacoes[index - 1].stakeholder !== informacao.stakeholder ? (
                                                        <td rowSpan={calculateRowSpan(informacoes, informacao.stakeholder, index, 'stakeholder')}
                                                        >{informacao.stakeholder}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{informacao.stakeholder}</td>
                                            )}
                                            <td id={styles.infoTdInfo}>{informacao.informacao}</td>
                                            <td>{informacao.metodo}</td>
                                            <td>{informacao.frequencia}</td>
                                            <td>{informacao.canal}</td>
                                            <td>{informacao.responsavel}</td>
                                            <td>
                                                {informacao.registro ? (
                                                    <Link href={informacao.registro}>{informacao.registro}</Link>
                                                ) : (
                                                    '-'
                                                )}

                                            </td>
                                            <td>{informacao.feedback || '-'}</td>
                                            <td>{informacao.acao || '-'}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(informacao)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(informacao._id); setNovosDados(informacao); setIsUptading([informacao.grupo, informacao.stakeholder])
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
