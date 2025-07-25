import React, { useEffect, useState, useContext } from "react"
import styles from '../../../../styles/modules/wbs.module.css'
import CadastroInputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../../functions/crud";
import { cleanForm } from "../../../../functions/general";
import { AuthContext } from "../../../../contexts/AuthContext";

const TabelaAnalise = () => {
    const camposVazios = {
        area: '',
        item: '',
        descricao: '',
        criterio: '',
        verificacao: '',
        timing: '',
        responsavel: '',
        proposito: '',
        responsavel_aprovacao: '',
        premissas: '',
        restricoes: '',
        recursos: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [dicionarios, setDicionarios] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [cores, setCores] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const { isAdmin } = useContext(AuthContext)


    //essa funcao chama handleSubmit() e envia os dados para cadastro
    const enviar = async () => {
        await handleSubmit({
            route: 'wbsDictionary',
            dados: novoSubmit,
            fetchDados: fetchDicionarios
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const isItemCadastrado = (item) => {
        return dicionarios.some((e) => e.item.trim() === item.trim());
    }

    //essa funcao busca as cores para cada area
    const fetchCores = async () => {
        const data = await fetchData('wbs/get/cores');
        var cores = {};
        data.areasECores.forEach((area) => {
            cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
        })
        setCores(cores);
    }

    //essa funcao chama realiza um tratamento de dados de confirmUpdateItem para garantir que
    //os dados enviados sejam condizentes com o modelo, e depois chama handleUpdate() para
    //cadastrar as mudancas no banco
    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleUpdate({
                route: 'wbsDictionary/update?id',
                dados: novosDados,
                fetchDados: fetchDicionarios
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLoading(false);
        setIsUpdating(false);
        setNovosDados(camposVazios);
        setLinhaVisivel();
    };


    //essa funcao chama handleDelete e deleta o que estiver em confirmDeleteItem
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleDelete({
                    route: 'wbsDictionary',
                    item: confirmDeleteItem,
                    fetchDados: fetchDicionarios
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
        setReload(true);
    };


    //essa funcao busca todos os itens do dicionario
    const fetchDicionarios = async () => {
        try {
            const data = await fetchData('wbsDictionary/get/all');
            setDicionarios(data.dicionarios);
        } finally {
            setLoading(false);
        }
    };


    //esse useEffect so executa quando reload é true
    useEffect(() => {
        if (reload) {
            setReload(false);
            fetchDicionarios();
            fetchCores();
        }
    }, [reload]);

    //esse useEffect so executa na primeira render
    useEffect(() => {
        fetchDicionarios();
        fetchCores();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!',
        'itemRepetido': 'You have already register the dictionary for this WBS item!'
    };

    //essa funcao calcula a quantidade de tds que o td de cada area deve ocupar
    const calculateRowSpan = (itens, currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < itens.length; i++) {
            if (itens[i].area === currentArea) {
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
            <h2 className="smallTitle">WBS Dictionary</h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.item}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabelaDicionario_container}>
                <div className={styles.tabelaDicionario_wrapper}>
                    <table className={`${styles.tabelaDicionario} tabela`}>
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Item</th>
                                <th>Description</th>
                                <th>Purpose</th>
                                <th>Premises</th>
                                <th>Restrictions</th>
                                <th>Expected Resources and Costs</th>
                                <th>Acceptance Criteria</th>
                                <th>Verification</th>
                                <th>Timing</th>
                                <th>Responsible for Criteria</th>
                                <th>Responsible for Approval</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dicionarios.map((item, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === item._id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); setIsUpdating(false) }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr style={{ backgroundColor: cores[item.area] }}>
                                            {!isUpdating || isUpdating !== item.area ? (
                                                <React.Fragment>
                                                    {index === 0 || dicionarios[index - 1].area !== item.area ? (
                                                        <td rowSpan={calculateRowSpan(dicionarios, item.area, index)}
                                                            className={styles.td_area}>{item.area}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td className={styles.td_area}>{item.area}</td>
                                            )}
                                            <td className={styles.td_item}>{item.item}</td>
                                            <td className={styles.td_descricao}>{item.descricao}</td>
                                            <td className={styles.td_proposito}>{item.proposito}</td>
                                            <td className={styles.td_premissas}>{item.premissas}</td>
                                            <td className={styles.td_restricoes}>{item.restricoes}</td>
                                            <td className={styles.td_recursos}>{item.recursos}</td>
                                            <td className={styles.td_criterio}>{item.criterio}</td>
                                            <td className={styles.td_verificacao}>{item.verificacao}</td>
                                            <td className={styles.td_timing}>{item.timing}</td>
                                            <td className={styles.td_responsavel}>{item.responsavel}</td>
                                            <td className={styles.td_responsavel_aprovacao}>{item.responsavel_aprovacao}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(item)} disabled={!isAdmin}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(item._id); setNovosDados(item); setIsUpdating(item.area)
                                                }
                                                } disabled={!isAdmin}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{enviar, isItemCadastrado}}
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default TabelaAnalise;