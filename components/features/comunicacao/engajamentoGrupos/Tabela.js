import React, { useEffect, useState, useContext } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import Inputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleUpdate, fetchData } from "../../../../functions/crud";
import { AuthContext } from "../../../../contexts/AuthContext";

const Tabela = () => {
    const camposVazios = {
        grupo: "",
        dependencia: "",
        influencia: "",
        controle: "",
        impacto: "",
        engajamento: "",
        alinhamento: "",
        nivel_engajamento: "",
        nivel_eng_desejado: ""
    }
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [engajamentos, setEngajamentos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useContext(AuthContext);

    //funcao que trata e envia o objeto de atualizacao para o backend
    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleUpdate({
                route: 'comunicacao/engajamentoGrupos/update?id',
                dados: novosDados,
                fetchDados: fetchStakeholders
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLinhaVisivel();
        setLoading(false);
        setNovosDados(camposVazios);
    };

    const generateMapping = (engajamento) => {
        if(!engajamento.controle || !engajamento.impacto){
            return "-";
        }
        const poder = ((engajamento.controle + engajamento.influencia + engajamento.dependencia)/3).toFixed(2);
        const interesse = ((engajamento.impacto + engajamento.engajamento + engajamento.alinhamento)/3).toFixed(2);

        if(poder < 3){
            if(interesse < 3){
                return "Monitor";
            } else {
                return "Keep informed"
            }
        } else {
            if(interesse < 3){
                return "Keep satisfied";
            } else {
                return "Close Management"
            }
        }
    }

    //funcao que busca stakeholders
    const fetchStakeholders = async () => {
        try {
            const data = await fetchData('comunicacao/engajamentoGrupos/get/all');
            setEngajamentos(data.engajamentos);
        } finally {
            setLoading(false);
        }
    };

    //useEffect que só roda no primeiro render
    useEffect(() => {
        fetchStakeholders();
    }, [])

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!',
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2 className="smallTitle">Stakeholder Group Engagement Matrix</h2>
            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}

            {/* {engajamentos.length != 0 ? ( */}


                <div className={styles.tabelaComunicacao_container}>
                    <div className={styles.tabelaComunicacao_wrapper}>
                        <table className={`${styles.tabelaEngajamento} tabela`}>
                            <thead>
                                <tr>
                                    <th rowSpan={2}>Stakeholder Group</th>
                                    <th colSpan={4}>Power</th>
                                    <th colSpan={4}>Interest</th>
                                    <th className={styles.eng_mapping} rowSpan={2}>Mapping</th>
                                    <th className={styles.eng_engajamentoId} rowSpan={2}>Current Engagement Level</th>
                                    <th className={styles.eng_engajamentoId} rowSpan={2}>Expected Engagement Level</th>
                                    <th rowSpan={2}>Actions</th>
                                </tr>
                                <tr>
                                    <th className={styles.eng_camposMenores}>Dependency</th>
                                    <th className={styles.eng_camposMenores}>Influence</th>
                                    <th className={styles.eng_camposMenores}>Resource Control</th>
                                    <th className={styles.eng_average}>Avg.</th>
                                    <th className={styles.eng_camposMenores}>Impact</th>
                                    <th className={styles.eng_camposMenores}>Engagement</th>
                                    <th className={styles.eng_camposMenores}>Alignment of Values</th>
                                    <th className={styles.eng_average}>Avg.</th>
                                </tr>
                            </thead>
                            <tbody>

                                {engajamentos.map((engajamento, index) => (
                                    <tr key={index}>
                                        <td>{engajamento.grupo}</td>
                                        {linhaVisivel === engajamento._id ? (
                                            <Inputs tipo="update"
                                                obj={novosDados}
                                                objSetter={setNovosDados}
                                                funcoes={{
                                                    enviar: handleUpdateItem,
                                                    cancelar: () => { linhaVisivel === engajamento._id ? setLinhaVisivel() : setLinhaVisivel(engajamento._id) }
                                                }}
                                                setExibirModal={setExibirModal}
                                            />
                                        ) : (
                                            <React.Fragment>
                                                <td>{engajamento.dependencia}</td>
                                                <td>{engajamento.influencia}</td>
                                                <td>{engajamento.controle}</td>
                                                <td>{engajamento.controle ? ((engajamento.controle + engajamento.influencia + engajamento.dependencia)/3).toFixed(2) : "-"}</td>
                                                <td>{engajamento.impacto}</td>
                                                <td>{engajamento.engajamento}</td>
                                                <td>{engajamento.alinhamento}</td>
                                                <td>{engajamento.impacto ? ((engajamento.impacto + engajamento.engajamento + engajamento.alinhamento)/3).toFixed(2) : "-"}</td>
                                                <td>{generateMapping(engajamento)}</td>
                                                <td>{engajamento.nivel_engajamento}</td>
                                                <td>{engajamento.nivel_eng_desejado}</td>
                                                <td className='botoes_acoes'>
                                                    <button onClick={() => {
                                                        setLinhaVisivel(engajamento._id);
                                                        setNovosDados(engajamento);
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
            {/* ) : (
                <div>No Stakeholders registered! Please register a stakeholder first.</div>
            )} */}
        </div>
    )
};

export default Tabela;
