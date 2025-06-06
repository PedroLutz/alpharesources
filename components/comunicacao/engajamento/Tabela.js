import React, { useEffect, useState, useContext } from "react"
import styles from '../../../styles/modules/comunicacao.module.css'
import Inputs from "./Inputs";
import Modal from "../../Modal";
import Loading from "../../Loading";
import { handleUpdate, fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";

const Tabela = () => {
    const camposVazios = {
        grupo: "",
        stakeholder: "",
        poder: "",
        interesse: "",
        nivel_engajamento: "",
        nivel_eng_desejado: ""
    }
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
    const [engajamentos, setEngajamentos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useContext(AuthContext);
    const [isUpdating, setIsUptading] = useState(false);

    //funcao que recebe o item, insere em confirmUpdateItem e em novosDados
    const handleUpdateClick = (item) => {
        setConfirmUpdateItem(item)
        setNovosDados({
            ...item
        });
    };

    //funcao que trata e envia o objeto de atualizacao para o backend
    const handleUpdateItem = async () => {
        if (confirmUpdateItem) {
            setLoading(true);
            const updatedItem = { ...confirmUpdateItem, ...novosDados };

            setConfirmUpdateItem(null)
            linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
            try {
                await handleUpdate({
                    route: 'comunicacao/engajamento/update?id',
                    dados: updatedItem,
                    item: confirmUpdateItem, 
                    fetchDados: fetchStakeholders
                });
            } catch (error) {
                setConfirmUpdateItem(confirmUpdateItem)
                console.error("Update failed:", error);
            }
            setLoading(false);
        }
    };

    //funcao que busca stakeholders
    const fetchStakeholders = async () => {
        try {
            const data = await fetchData('comunicacao/engajamento/get/all');
            setEngajamentos(data.engajamentos);
        } finally {
            setLoading(false);
        }
    };

    //funcao que gera o mapeamento de poder e interesse
    const generateMapping = (p, i) => {
        if (p && i) {
            return "Close Management"
        }
        if (!p && i) {
            return "Keep informed"
        }
        if (p && !i) {
            return "Keep satisfied"
        }
        if (!p && !p) {
            return "Monitor"
        }
    }

    //useEffect que só roda quando reload atualiza
    useEffect(() => {
        if(reload == true){
            setReload(false);
            fetchStakeholders();
        }
    }, [reload]);


    //useEffect que só roda no primeiro render
    useEffect(() => {
        fetchStakeholders();
    }, [])

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };

    //funcao que calcula o rowSpan do td do grupo de acordo com a quantidade de stakeholders
    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < engajamentos.length; i++) {
            if (engajamentos[i][parametro] === currentArea) {
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
            <h2>Stakeholder Engagement Matrix</h2>
            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}

            {engajamentos.length != 0 ? (


                <div className={styles.tabelaComunicacao_container}>
                    <div className={styles.tabelaComunicacao_wrapper}>
                        <table className={styles.tabelaEngajamento}>
                            <thead>
                                <tr>
                                    <th>Stakeholder Group</th>
                                    <th>Stakeholder</th>
                                    <th id={styles.poderId}>Power</th>
                                    <th id={styles.interesseId}>Interest</th>
                                    <th>Mapping</th>
                                    <th id={styles.engId}>Current Engagement Level</th>
                                    <th id={styles.engId}>Expected Engagement Level</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>

                                {engajamentos.map((engajamento, index) => (
                                    <tr key={index}>
                                        {!isUpdating || isUpdating[0] !== engajamento.grupo ? (
                                            <React.Fragment>
                                                {index === 0 || engajamentos[index - 1].grupo !== engajamento.grupo ? (
                                                    <td rowSpan={calculateRowSpan(engajamento.grupo, index, 'grupo')}
                                                    >{engajamento.grupo}</td>
                                                ) : null}
                                            </React.Fragment>
                                        ) : (
                                            <td>{engajamento.grupo}</td>
                                        )}
                                        <td>{engajamento.stakeholder}</td>
                                        <td id={styles.poderId}>{engajamento.poder ? 'High' : 'Low'}</td>
                                        <td id={styles.interesseId}>{engajamento.interesse ? 'High' : 'Low'}</td>
                                        <td>{generateMapping(engajamento.poder, engajamento.interesse)}</td>
                                        {linhaVisivel === engajamento._id ? (
                                            <Inputs tipo="update"
                                                obj={novosDados}
                                                objSetter={setNovosDados}
                                                funcao={{
                                                    funcao1: () => handleUpdateItem(),
                                                    funcao2: () => { linhaVisivel === engajamento._id ? setLinhaVisivel() : setLinhaVisivel(engajamento._id); setIsUptading(false); }
                                                }}
                                                setExibirModal={setExibirModal}
                                            />
                                        ) : (
                                            <React.Fragment>
                                                <td>{engajamento.nivel_engajamento}</td>
                                                <td>{engajamento.nivel_eng_desejado}</td>
                                                <td className='botoes_acoes'>
                                                    <button onClick={() => {
                                                        setLinhaVisivel(engajamento._id); handleUpdateClick(engajamento); setIsUptading([engajamento.grupo, engajamento.stakeholder])
                                                    }
                                                    } disabled={!isAdmin}>⚙️</button>
                                                </td>
                                            </React.Fragment>
                                        )}

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div>No Stakeholders registered! Please register a stakeholder first.</div>
            )}
        </div>
    )
};

export default Tabela;
