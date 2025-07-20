import React, { useEffect, useState, useContext } from "react"
import styles from '../../../../styles/modules/responsabilidades.module.css'
import Inputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../../functions/crud";
import { cleanForm } from "../../../../functions/general";
import { AuthContext } from "../../../../contexts/AuthContext";

const Tabela = () => {
    const camposVazios = {
        funcao: '',
        area: '',
        habilidade: '',
        nivel_atual: '',
        nivel_min: '',
        acao: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [habilidades, setHabilidades] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const { isAdmin } = useContext(AuthContext);

    const enviar = async () => {
        await handleSubmit({
            route: 'responsabilidades/habilidades',
            dados: novoSubmit,
            fetchDados: fetchHabilidades
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
        setReload(true);
    };

    const handleUpdateItem = async () => {
        setLoading(true);
        delete novosDados.responsavel;
        try {
            await handleUpdate({
                route: 'responsabilidades/habilidades/update?id',
                dados: novosDados,
                fetchDados: fetchHabilidades
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLoading(false);
        setIsUpdating(false);
        setLinhaVisivel();
        setNovosDados(camposVazios);
    };

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleDelete({
                    route: 'responsabilidades/habilidades',
                    item: confirmDeleteItem,
                    fetchDados: fetchHabilidades
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

    const fetchHabilidades = async () => {
        try {
            const data = await fetchData('responsabilidades/habilidades/get/all');
            const data2 = await fetchData('responsabilidades/funcoes/get/funcoesEMembros');

            data.habilidades.forEach((habilidade) => {
                if (data2.funcoes.length > 0) {
                    const responsavelPelaFuncao = data2.funcoes.find((funcao) => habilidade.funcao === funcao.funcao).responsavel;
                    habilidade.responsavel = responsavelPelaFuncao;
                } else {
                    habilidade.responsavel = ''
                }

            })
            setHabilidades(data.habilidades);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchHabilidades();
        }
    }, [reload]);

    useEffect(() => {
        fetchHabilidades();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!',
        'habilidadeRepetida': 'You have already registered this skill!'
    };

    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < habilidades.length; i++) {
            if (habilidades[i][parametro] === currentArea) {
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
            <h2 className="smallTitle">Skill evaluation</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.habilidade}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabelaRaci_container}>
                <div className={styles.tabelaRaci_wrapper}>
                    <table className={`tabela ${styles.tabelaHabilidade}`}>
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Role</th>
                                <th>Responsible</th>
                                <th>Skill</th>
                                <th className={styles.habilidadeThSkill}>Current skill level</th>
                                <th className={styles.habilidadeThSkill}>Desired skill level</th>
                                <th>Development action</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {habilidades.map((habilidade, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === habilidade._id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { linhaVisivel === habilidade._id ? setLinhaVisivel() : setLinhaVisivel(item._id); setIsUpdating(false) }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr>
                                            {!isUpdating || isUpdating[0] !== habilidade.area ? (
                                                <React.Fragment>
                                                    {index === 0 || habilidades[index - 1].area !== habilidade.area ? (
                                                        <td rowSpan={calculateRowSpan(habilidade.area, index, 'area')}
                                                        >{habilidade.area}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{habilidade.area}</td>
                                            )}
                                            {!isUpdating || isUpdating[1] !== habilidade.funcao ? (
                                                <React.Fragment>
                                                    {index === 0 || habilidades[index - 1].funcao !== habilidade.funcao ? (
                                                        <td rowSpan={calculateRowSpan(habilidade.funcao, index, 'funcao')}
                                                        >{habilidade.funcao}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{habilidade.funcao}</td>
                                            )}
                                            {!isUpdating || isUpdating[2] !== habilidade.responsavel ? (
                                                <React.Fragment>
                                                    {index === 0 || habilidades[index - 1].responsavel !== habilidade.responsavel ? (
                                                        <td rowSpan={calculateRowSpan(habilidade.responsavel, index, 'responsavel')}
                                                        >{habilidade.responsavel}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{habilidade.responsavel}</td>
                                            )}
                                            
                                            <td>{habilidade.habilidade}</td>
                                            <td>{habilidade.nivel_atual}</td>
                                            <td>{habilidade.nivel_min}</td>
                                            <td className={styles.habilidadeTdAcao}>{habilidade.acao}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(habilidade)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(habilidade._id); setNovosDados(habilidade);
                                                    setIsUpdating([habilidade.area, habilidade.funcao, habilidade.responsavel])
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
                                funcoes={{
                                    enviar
                                }}
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
