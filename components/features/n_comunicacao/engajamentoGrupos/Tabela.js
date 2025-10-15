import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/comunicacao.module.css'
import Inputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import { cleanForm } from "../../../../functions/general";

const Tabela = () => {
    const { token } = useAuth();
    const { isEditor } = usePerm();
    const camposVazios = {
        grupo_id: "",
        dependency: "",
        influence: "",
        control: "",
        impact: "",
        engagement: "",
        alignment: "",
        eng_level: "",
        eng_target_level: ""
    }
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [engajamentos, setEngajamentos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);

    const handleUpdateClick = (item) => {
        const obj = {
            id: item.id,
            group_id: item?.stakeholder_group?.id,
            dependency: item.dependency || "",
            influence: item.influence || "",
            control: item.control || "",
            impact: item.impact || "",
            engagement: item.engagement || "",
            alignment: item.alignment || "",
            eng_level: item.eng_level || "",
            eng_target_level: item.eng_target_level || ""
        }
        setNovosDados(obj);
        setLinhaVisivel(item.id);
    }

    //funcao que trata e envia o objeto de atualizacao para o backend
    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'stakeholder_group_engagement',
                route: 'update',
                token,
                data: novosDados,
                fetchData: fetchStakeholders
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLinhaVisivel();
        setLoading(false);
        cleanForm(novosDados, setNovosDados, camposVazios);
    };

    const generateMapping = (engajamento) => {
        if (!engajamento.control || !engajamento.impact) {
            return "-";
        }
        const poder = ((engajamento.control + engajamento.influence + engajamento.dependency) / 3).toFixed(2);
        const interesse = ((engajamento.impact + engajamento.engagement + engajamento.alignment) / 3).toFixed(2);

        if (poder < 2.5) {
            if (interesse < 2.5) {
                return "Monitor";
            } else {
                return "Keep informed"
            }
        } else {
            if (interesse < 2.5) {
                return "Keep satisfied";
            } else {
                return "Close Management"
            }
        }
    }

    //funcao que busca stakeholders
    const fetchStakeholders = async () => {
        try {
            const data = await handleFetch({
                table: 'stakeholder_group_engagement',
                query: 'all',
                token
            });
            setEngajamentos(data.data);
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

    function capitalizeFirstLetter(str) {
        if (typeof str !== 'string' || str.length === 0) {
            return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

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
                                    <td>{engajamento.stakeholder_group.group}</td>
                                    {linhaVisivel === engajamento.id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { setLinhaVisivel() }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <React.Fragment>
                                            <td>{engajamento.dependency}</td>
                                            <td>{engajamento.influence}</td>
                                            <td>{engajamento.control}</td>
                                            <td>{engajamento.control ? ((engajamento.control + engajamento.influence + engajamento.dependency) / 3).toFixed(2) : "-"}</td>
                                            <td>{engajamento.impact}</td>
                                            <td>{engajamento.engagement}</td>
                                            <td>{engajamento.alignment}</td>
                                            <td>{engajamento.impact ? ((engajamento.impact + engajamento.engagement + engajamento.alignment) / 3).toFixed(2) : "-"}</td>
                                            <td>{generateMapping(engajamento)}</td>
                                            <td>{capitalizeFirstLetter(engajamento.eng_level)}</td>
                                            <td>{capitalizeFirstLetter(engajamento.eng_target_level)}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => {
                                                    handleUpdateClick(engajamento)
                                                }
                                                } disabled={!isEditor}>⚙️</button>
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