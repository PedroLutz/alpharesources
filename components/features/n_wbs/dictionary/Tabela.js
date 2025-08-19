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
    const { user, token } = useAuth();
    const camposVazios = {
        id: '',
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
        resources: '',
        user_id: user.id
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [dicionarios, setDicionarios] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);


    //essa funcao chama handleSubmit() e envia os dados para cadastro
    const enviar = async () => {
        const objSent = {
            ...novoSubmit,
            user_id: user.id
        }
        delete objSent.id;
        await handleReq({
            table: 'wbs_dictionary',
            route: 'create',
            token,
            data: objSent,
            fetchData: fetchDicionarios
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
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
        await handleReq({
            table: 'wbs_dictionary',
            route: 'update',
            token,
            data: novosDados,
            fetchData: fetchDicionarios
        });
        setLoading(false);
        setIsUpdating(false);
        cleanForm(novosDados, setNovosDados, camposVazios);
        setLinhaVisivel();
    };

    const handleClickUpdate = (item) => {
        setNovosDados({
            ...novosDados,
            id: item.id,
            item_id: item.wbs_item.id,
            description: item.description,
            purpose: item.purpose,
            criteria: item.criteria,
            inspection: item.inspection,
            timing: item.timing,
            responsible: item.responsible,
            approval_responsible: item.approval_responsible,
            premises: item.premises,
            restrictions: item.restrictions,
            resources: item.resources
        })
        setLinhaVisivel(item.id);
        setIsUpdating(item.wbs_item.wbs_area.name);
    }

    //essa funcao chama handleDelete e deleta o que estiver em confirmDeleteItem
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            var getDeleteSuccess = false;
            try {
                getDeleteSuccess = await handleReq({
                    table: 'wbs_dictionary',
                    route: 'delete',
                    token,
                    data: { id: confirmDeleteItem.id },
                    fetchData: fetchDicionarios
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
        try {
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.wbs_item.name}"?`,
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
                                            area_id={item.wbs_item.wbs_area.id}
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
                                                <button onClick={() => handleClickUpdate(item)}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{ enviar, isItemCadastrado }}
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