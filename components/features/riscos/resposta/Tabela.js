import React, { useEffect, useState, useContext } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import CadastroInputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../../functions/crud";
import { cleanForm } from "../../../../functions/general";
import { AuthContext } from "../../../../contexts/AuthContext";

const TabelaPlanos = () => {
    const camposVazios = {
        risco: "",
        estrategia: "",
        detalhamento: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [respostas, setRespostas] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const { isAdmin } = useContext(AuthContext)

    const enviar = async () => {
        await handleSubmit({
            route: 'riscos/resposta',
            dados: novoSubmit,
            fetchDados: fetchRespostas
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleUpdate({
                route: 'riscos/resposta/update?id',
                dados: novosDados,
                fetchDados: fetchRespostas
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLoading(false);
        setIsUpdating(false);
        setNovosDados(camposVazios);
        setLinhaVisivel();
    };

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleDelete({
                    route: 'riscos/resposta',
                    item: confirmDeleteItem,
                    fetchDados: fetchRespostas
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

    const fetchRespostas = async () => {
        try {
            const data = await fetchData('riscos/resposta/get/all');
            setRespostas(data.riscoRespostas);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRespostas();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

    const calculateRowSpan = (itens, currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < itens.length; i++) {
            if (itens[i].risco === currentArea) {
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
            <h2 className="smallTitle">Risk Response Planning</h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete the response for "${confirmDeleteItem.risk}"?`,
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
                    <table className={`${styles.tabelaPlano} tabela`}>
                        <thead>
                            <tr>
                                <th>Risk</th>
                                <th>Strategy</th>
                                <th>Response</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{enviar}}
                                setExibirModal={setExibirModal}
                            />
                            {respostas.map((item, index) => (
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
                                                    setLinhaVisivel(item._id); setIsUpdating(false) 
                                                }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            {!isUpdating || isUpdating !== item.risco ? (
                                                <React.Fragment>
                                                    {index === 0 || respostas[index - 1].risco !== item.risco ? (
                                                        <td rowSpan={calculateRowSpan(respostas, item.risco, index)}
                                                        >{item.risco}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{item.risco}</td>
                                            )}
                                            <td>{item.estrategia}</td>
                                            <td>{item.detalhamento}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(item)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(item._id); setNovosDados(item); setIsUpdating(item.risco)
                                                }
                                                } disabled={!isAdmin}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default TabelaPlanos;