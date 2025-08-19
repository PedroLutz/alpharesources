import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/wbs.module.css'
import CadastroInputs from "./InputsContainer";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleFetch, handleReq } from '../../../../functions/crud_s';
import { handleSubmit, handleDelete, handleUpdate, fetchData } from "../../../../functions/crud";
import { cleanForm } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";

const TabelaAnalise = () => {
    const camposVazios = {
        item_id: '',
        description: '',
        purpose: '',
        criteria: '',
        inspection: '',
        timing: '',
        responsible: '',
        approval_responsible: '',
        premises: '',
        restrictions: '',
        resources: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [dicionarios, setDicionarios] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const { user, token} = useAuth();


    //essa funcao chama handleSubmit() e envia os dados para cadastro
    const enviar = async () => {
        const obj = {...novoSubmit, user_id: user.id}
        await handleReq({
            table: 'wbs_dictionary',
            route: 'create',
            token,
            data: obj,
            fetchData
        });
        // cleanForm(novoSubmit, setNovoSubmit, camposVazios);
        return true;
        
    };

    const isItemCadastrado = (item_id) => {
        return dicionarios.some((e) => e.item_id == item_id);
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
    };


    //essa funcao busca todos os itens do dicionario
    const fetchDicionarios = async () => {
        try{
            const data = await handleFetch({
            table: 'wbs_dictionary',
            query: 'all',
            token
        })
        setDicionarios(data.data);
        } finally {
            setLoading(false);
        }
        
    };

    //esse useEffect so executa na primeira render
    useEffect(() => {
        fetchDicionarios();
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
            if (itens[i].wbs_item.wbs_area.name === currentArea) {
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
                                <th>Inspection</th>
                                <th>Timing</th>
                                <th>Responsible for Criteria</th>
                                <th>Responsible for Approval</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dicionarios.map((item, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === item.id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { linhaVisivel === item.id ? setLinhaVisivel(null) : setLinhaVisivel(item.id); setIsUpdating(false) }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr style={{ backgroundColor: item.wbs_item.wbs_area.color }}>
                                            {!isUpdating || isUpdating !== item.wbs_item.wbs_area.name ? (
                                                <React.Fragment>
                                                    {index === 0 || dicionarios[index - 1].wbs_item.wbs_area.name !== item.wbs_item.wbs_area.name ? (
                                                        <td rowSpan={calculateRowSpan(dicionarios, item.wbs_item.wbs_area.name, index)}
                                                            className={styles.td_area}>{item.wbs_item.wbs_area.name}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td className={styles.td_area}>{item.wbs_item.wbs_area.name}</td>
                                            )}
                                            <td className={styles.td_item}>{item.wbs_item.name}</td>
                                            <td className={styles.td_descricao}>{item.description}</td>
                                            <td className={styles.td_proposito}>{item.purpose}</td>
                                            <td className={styles.td_premissas}>{item.premises}</td>
                                            <td className={styles.td_restricoes}>{item.restrictions}</td>
                                            <td className={styles.td_recursos}>{item.resources}</td>
                                            <td className={styles.td_criterio}>{item.criteria}</td>
                                            <td className={styles.td_verificacao}>{item.inspection}</td>
                                            <td className={styles.td_timing}>{item.timing}</td>
                                            <td className={styles.td_responsavel}>{item.responsible}</td>
                                            <td className={styles.td_responsavel_aprovacao}>{item.approval_responsible}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(item)}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(item.id); setNovosDados(item); setIsUpdating(item.wbs_item.wbs_area.name)
                                                }
                                                }>⚙️</button>
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