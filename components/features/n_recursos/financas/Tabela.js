import React, { useEffect, useState } from 'react';
import Loading from '../../../ui/Loading';
import Modal from '../../../ui/Modal';
import CadastroInputs from './CadastroInputs';
import styles from '../../../../styles/modules/financas.module.css'
import { jsDateToEuDate, euDateToIsoDate, cleanForm } from '../../../../functions/general';
import useAuth from '../../../../hooks/useAuth';
import usePerm from '../../../../hooks/usePerm';
import { handleFetch, handleReq, handlePostFetch } from '../../../../functions/crud_s';

const labelsTipo = {
    income: 'Income',
    cost: 'Cost',
    exchange: 'Exchange'
};

const Tabela = () => {
    const { user, token } = useAuth();
    const { isEditor } = usePerm();

    const [lancamentos, setLancamentos] = useState([]);
    const [deleteItem, setDeleteItem] = useState();
    const [confirmItemAction, setConfirmItemAction] = useState({ action: '', item: null });
    const [exibirModal, setExibirModal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [linhaVisivel, setLinhaVisivel] = useState({});
    const camposVazios = {
        type: '',
        description: '',
        value: '',
        date: '',
        area_id: '',
        origin: '',
        destination: '',
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);


    //funcao que busca os dados de lancamentos e cria as arrays lancamentos e lancamentosDeletados,
    //alem de calcular e organizar o balance
    const fetchLancamentos = async () => {
        try {
            const data = await handleFetch({
                table: 'financial_release',
                query: 'all',
                token
            })

            const monthly_summary = await handlePostFetch({
                table: "financial_release",
                query: 'monthly_summary',
                token,
                data: { uid: user.id },
            });

            const area_summary = await handlePostFetch({
                table: "financial_release",
                query: 'area_summary',
                token,
                data: { uid: user.id },
            });

            const total_summary = await handlePostFetch({
                table: "financial_release",
                query: 'total_summary',
                token,
                data: { uid: user.id },
            });

            const min_max = await handlePostFetch({
                table: "financial_release",
                query: 'min_max',
                token,
                data: { uid: user.id },
            })

            const plan_monthly_summary = await handlePostFetch({
                table: "resource_acquisition_plan",
                query: 'monthly_summary',
                token,
                data: { uid: user.id },
            })

            console.log(monthly_summary, area_summary, total_summary, min_max, plan_monthly_summary);

            var balance = 0;
            const lancamentos = data.data;
            lancamentos.forEach((item) => {
                item.date = jsDateToEuDate(item.date);
                if (item.type != "exchange") balance = balance + item.value;
                item.balance = balance.toFixed(2);
            });

            let lancamentosReversed = [];
            for (let i = lancamentos.length; i > 0; i--) {
                lancamentosReversed.push(lancamentos[i - 1]);
            }
            setLancamentos(lancamentosReversed);
        } finally {
            setLoading(false);
        }
    };

    //useEffect que so roda na primeira execucao
    useEffect(() => {
        fetchLancamentos();
    }, []);

    //funcao que envia o id para deletar os itens
    const handleConfirmDelete = async () => {
        if (deleteItem) {
            await handleReq({
                table: "financial_release",
                route: 'delete',
                token,
                data: { id: deleteItem.id },
                fetchData: fetchLancamentos
            });
        }
        setExibirModal("deleteSuccess");
        setDeleteItem(null)
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'valorNegativo': 'The value cannot be negative!',
        'deleteSuccess': 'Deletion successfull!'
    };


    //funcao que trata os dados dependendo do tipo e envia para o banco
    const enviar = async () => {
        const isExpense = novoSubmit.type === 'cost';
        const value = isExpense ? -parseFloat(novoSubmit.value) : parseFloat(novoSubmit.value);
        const updatedNovoSubmit = {
            ...novoSubmit,
            value: value,
            user_id: user.id
        };
        await handleReq({
            table: 'financial_release',
            route: 'create',
            token,
            data: updatedNovoSubmit,
            fetchData: fetchLancamentos
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    //funcao que trata o item e o insere em novosDados
    const handleUpdateClick = (item) => {
        let valorCorrigido = 0;
        if (Number(item.valor) < 0) {
            valorCorrigido = item.value * -1;
        } else {
            valorCorrigido = item.value;
        }

        setConfirmItemAction({ action: 'update', item: item })
        setNovosDados({
            id: item.id,
            type: item.type,
            description: item.description,
            value: valorCorrigido,
            date: euDateToIsoDate(item.date),
            area_id: item.wbs_area.id,
            origin: item.origin,
            destination: item.destination,
        });
    };

    //funcao que trata os dados e envia para update
    const handleUpdateItem = async () => {
        if (confirmItemAction.action === 'update' && confirmItemAction.item) {
            setLoading(true);
            const isExpense = confirmItemAction.item.type === 'Expense';
            const valorInverso = isExpense ? novosDados.value * -1 : novosDados.value;
            const updatedItem = { ...novosDados, value: valorInverso };
            delete updatedItem.balance;
            setConfirmItemAction({ action: '', item: null })
            try {
                await handleReq({
                    table: 'financial_release',
                    route: 'update',
                    token,
                    data: updatedItem,
                    fetchData: fetchLancamentos
                });
            } catch (error) {
                setConfirmItemAction({ action: 'update', item: confirmItemAction.item })
                console.error("Update failed:", error);
            }
            setLoading(false);
            setLinhaVisivel();
            setNovosDados(camposVazios);
        }
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2 className='smallTitle'>Financial Releases Data</h2>
            <div id="report" className={styles.tabela_financas_container}>
                <div className={styles.tabela_financas_wrapper}>
                    <table className={`tabela ${styles.tabela_financas}`}>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Value</th>
                                <th>Date</th>
                                <th>Area</th>
                                <th>Origin</th>
                                <th>Destination</th>
                                <th>Balance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <CadastroInputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{
                                    enviar
                                }}
                                setExibirModal={setExibirModal}
                                tipo='cadastro'
                                isEditor={isEditor}
                            />
                            {lancamentos.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    {linhaVisivel === item.id ? (
                                        <React.Fragment>
                                            <CadastroInputs
                                                obj={novosDados}
                                                objSetter={setNovosDados}
                                                funcoes={{
                                                    enviar: handleUpdateItem,
                                                    cancelar: () => setLinhaVisivel()
                                                }}
                                                setExibirModal={setExibirModal}
                                                tipo='update'
                                                isEditor={isEditor} />
                                        </React.Fragment>
                                    ) : (
                                        <React.Fragment>
                                            <tr key={index}>
                                                <td style={{ color: item.type === 'income' ? 'green' : item.type === 'exchange' ? '#335EFF' : 'red' }}>{labelsTipo[item.type]}</td>
                                                <td className={styles.tdDescricao} style={{ color: item.type === 'income' ? 'green' : item.type === 'exchange' ? '#335EFF' : 'red' }}>
                                                    {item.description}
                                                </td>
                                                <td className={styles.tdValor} style={{ color: item.type === 'income' ? 'green' : item.type === 'exchange' ? '#335EFF' : 'red' }}>
                                                    <b>R${Math.abs(item.value).toFixed(2)}</b>
                                                </td>
                                                <td className={styles.tdData}>{item.date}</td>
                                                <td className={styles.tdArea}>{item.wbs_area.name}</td>
                                                <td className={styles.tdOrigem}>{item.origin}</td>
                                                <td className={styles.tdDestino}>{item.destination}</td>
                                                <td className={styles.tdBalanco}>
                                                    <a style={{ color: item.type === 'income' ? 'green' : 'red', fontSize: '1.2rem' }}>
                                                        {item.type === 'income' ? "▲" : item.type === 'exchange' ? "" : '▼'}
                                                    </a>
                                                    <b>R${item.balance}</b>
                                                </td>
                                                <td className="botoes_acoes">
                                                    <button onClick={() => setDeleteItem(item)}
                                                        disabled={!isEditor}>❌</button>
                                                    <button onClick={() => {
                                                        setLinhaVisivel(item.id); handleUpdateClick(item)
                                                    }}
                                                        disabled={!isEditor}>⚙️</button>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteItem && (
                <Modal objeto={{
                    titulo: `Are you sure you want to PERMANENTLY delete "${deleteItem.description}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            {exibirModal != null && (
                <Modal objeto={{
                    titulo: modalLabels[exibirModal],
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}
        </div>
    );
};

export default Tabela;