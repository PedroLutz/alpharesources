import React, { useEffect, useState, useContext } from "react"
import CadastroInputs from "./CadastroInputs";
import styles from '../../../../styles/modules/planoAquisicao.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleFetch, handleReq } from '../../../../functions/crud_s';
import { cleanForm, isoDateToEuDate } from "../../../../functions/general";
import useAuth from '../../../../hooks/useAuth';
import usePerm from '../../../../hooks/usePerm';

const PlanoAquisicao = () => {
    const camposVazios = {
        resource_id: '',
        method_a: '',
        plan_a: '',
        details_a: '',
        value_a: '',
        expected_date: '',
        critical_date: '',
        plan_b: '',
        method_b: '',
        value_b: '',
        details_b: '',
        plan_real: '',
        date_real: '',
        value_real: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [planos, setPlanos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const { user, token } = useAuth();
    const { isEditor } = usePerm();


    //funcao que envia os dados do novoSubmit para cadastro no banco
    const enviar = async (obj) => {
        await handleReq({
            table: 'resource_acquisition_plan',
            route: 'create',
            token,
            data: {
                ...obj,
                date_real: obj.date_real || null,
                value_real: obj.value_real || null,
                user_id: user.id,
            },
            fetchData: fetchPlanos
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };


    //funcao que recebe o item, insere em confirmUpdateItem e insere os dados corretamente em novosDados
    const handleUpdateClick = (item) => {
        setNovosDados({
            ...item
        });
    };


    //dado que busca e trata os dados dos planos
    const fetchPlanos = async () => {
        try {
            const data = await handleFetch({
                table: 'resource_acquisition_plan',
                query: 'all',
                token
            })
            data.data.forEach((item) => {
                const dataEsperada = new Date(item.expected_date);
                const dataLimite = new Date(item.critical_date);
                const dataReal = new Date(item.date_real);
                if (item.date_real) {
                    item.date_diference = `Expected: ${(dataReal - dataEsperada) / (1000 * 60 * 60 * 24)} days,\n
                    Critical: ${(dataReal - dataLimite) / (1000 * 60 * 60 * 24)} days`
                } else {
                    item.date_diference = `-`   
                }
                if (item.value_real) {
                    item.value_diference = `Plan A: R$${Number(item.value_real - item.value_a).toFixed(2)},\n
                    Plan B: R$${Number(item.value_real - item.value_b).toFixed(2)}`
                } else {
                    item.value_diference = `-`
                }

            });
            setPlanos(data.data);
        } finally {
            setLoading(false);
        }
    };


    //funcao que trata e envia os dados para atualizacao no banco
    const handleUpdateItem = async (obj) => {
        setLoading(true);
        delete obj.date_diference;
        delete obj.value_diference;
        delete obj.resource;
        try {
            await handleReq({
                table: 'resource_acquisition_plan',
                route: 'update',
                token,
                data: obj,
                fetchData: fetchPlanos
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setLoading(false);
        setIsUpdating(false);
        setLinhaVisivel();
        setNovosDados(camposVazios);
    };


    //funcao que envia os dados do item para delecao do banco
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: 'resource_acquisition_plan',
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchPlanos
            });
            setExibirModal(`deleteSuccess`);
        }
        setConfirmDeleteItem(null);
    };

    //useEffect que so roda no primeiro render
    useEffect(() => {
        fetchPlanos();
    }, []);


    //textos dos modais 
    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'datasSemSentido': 'The critical date must be after the expected date!'
    };


    //funcao que calcula o rowSpan dos tds de area de acordo com a quantidade de itens q a area possui
    const calculateRowSpan = (itens, currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < itens.length; i++) {
            if (itens[i].resource.resource === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    const methodLabels = {
        purchase: 'Purchase',
        rental: 'Rental',
        borrowing: "Borrowing",
        outsorcing: "Outsorcing",
    }

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2 className="smallTitle">Resource Acquisition Planning</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete the acquisition plan for "${confirmDeleteItem.resource.resource}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabela_financas_container}>
                <div className={styles.tabela_financas_wrapper}>
                    <table className={`tabela ${styles.tabela_financas}`}>
                        <thead>
                            <tr>
                                <th rowSpan="2">Resource</th>
                                <th colSpan="4">Procurement Strategies (Plan A)</th>
                                <th colSpan="2">Milestones</th>
                                <th colSpan="4">Procurement Strategies (Plan B)</th>
                                <th colSpan="5">Results</th>
                                <th rowSpan="2">Actions</th>
                            </tr>
                            <tr>
                                <th>Method</th>
                                <th>Where to Acquire (Supplier)</th>
                                <th>Details</th>
                                <th>Value</th>
                                <th>Expected date</th>
                                <th>Critical date</th>
                                <th>How to Acquire (Method)</th>
                                <th>Where to Acquire (Supplier)</th>
                                <th>Details</th>
                                <th>Value</th>
                                <th>Actual strategy</th>
                                <th>Date</th>
                                <th>Value</th>
                                <th style={{ minWidth: '8rem' }}>Date difference</th>
                                <th style={{ minWidth: '8rem' }}>Value difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {planos.map((plano, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === plano.id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { linhaVisivel === plano._id ? setLinhaVisivel() : setLinhaVisivel(plano._id); setIsUpdating(false) }
                                            }}
                                            setExibirModal={setExibirModal}
                                            isEditor={isEditor}
                                        />
                                    ) : (
                                        <tr style={{backgroundColor: plano.resource.wbs_item.wbs_area.color || 'white'}}>
                                            {!isUpdating || isUpdating !== plano.resource.resource ? (
                                                <React.Fragment>
                                                    {index === 0 || planos[index - 1].recurso !== plano.resource.resource ? (
                                                        <td rowSpan={calculateRowSpan(planos, plano.resource.resource, index)}
                                                        >{plano.resource.resource}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{plano.resource.resource}</td>
                                            )}
                                            <td>{methodLabels[plano.method_a]}</td>
                                            <td>{plano.plan_a}</td>
                                            <td>{plano.details_a}</td>
                                            <td>R${Number(plano.value_a).toFixed(2)}</td>
                                            <td>{isoDateToEuDate(plano.expected_date)}</td>
                                            <td id={styles.tdCriticalDate}>{isoDateToEuDate(plano.critical_date)}</td>
                                            <td>{methodLabels[plano.method_b]}</td>
                                            <td>{plano.plan_b}</td>
                                            <td>{plano.details_b}</td>
                                            <td>R${Number(plano.value_b).toFixed(2)}</td>
                                            <td>{plano.plan_real || '-'}</td>
                                            <td>{plano.date_real != 'NaN/NaN/NaN' && plano.date_real != null ? isoDateToEuDate(plano.date_real) : '-'}</td>
                                            <td>{plano.value_real != null ? `R$${Number(plano.value_real).toFixed(2)}` : '-'}</td>
                                            <td>{plano.date_diference}</td>
                                            <td>{plano.value_diference}
                                            </td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(plano)}
                                                    disabled={!isEditor}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(plano.id); handleUpdateClick(plano); setIsUpdating(plano.resource.resource)
                                                }
                                                }
                                                    disabled={!isEditor}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{
                                    enviar
                                }}
                                setExibirModal={setExibirModal}
                                isEditor={isEditor}
                            />
                        </tbody>
                    </table>
                </div>

            </div>
        </div>

    )
}

export default PlanoAquisicao;