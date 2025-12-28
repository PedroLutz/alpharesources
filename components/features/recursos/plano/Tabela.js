import React, { useEffect, useState, useMemo } from "react"
import CadastroInputs from "./CadastroInputs";
import styles from '../../../../styles/modules/planoAquisicao.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleFetch, handleReq, handlePostFetch } from '../../../../functions/crud_s';
import { cleanForm, isoDateToEuDate } from "../../../../functions/general";
import stylesResumo from '../../../../styles/modules/resumo.module.css'
import useAuth from '../../../../hooks/useAuth';
import usePerm from '../../../../hooks/usePerm';
import { Chart } from 'react-google-charts';
import HelpBubble from "../../../ui/HelpBubble/recursos/Plano";
import { getTextColor } from "../../../../functions/colors";

const { pie_direita, pie_esquerda, pie_container, custom_span } = stylesResumo;

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
    const [resumo, setResumo] = useState([]);
    const [contingencia, setContingencia] = useState([]);
    const [totalContingencia, setTotalContingencia] = useState(0);
    const { user, token } = useAuth();
    const { isEditor } = usePerm();
    const [planosSoma_essencial, setPlanosSoma_essencial] = useState([]);
    const [planosSoma_all, setPlanosSoma_all] = useState([]);
    const [verReserves, setVerReserves] = useState(false);
    const [cores, setCores] = useState([]);
    const [showHelp, setShowHelp] = useState(false);

    //funcao que envia os dados do novoSubmit para cadastro no banco
    const enviar = async (obj) => {
        await handleReq({
            table: 'resource_acquisition_plan',
            route: 'create',
            token,
            data: {
                ...obj,
                date_real: obj.date_real ?? null,
                value_real: obj.value_real ?? null,
                user_id: user.id,
            },
            fetchData: fetchPlanos
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };


    //funcao que recebe o item, insere em confirmUpdateItem e insere os dados corretamente em novosDados
    const handleUpdateClick = (item) => {
        setLinhaVisivel(item.id); 
        setIsUpdating(item.resource.resource)
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
            const dataResumo = await handlePostFetch({
                table: 'resource_acquisition_plan',
                query: 'area_summary',
                data: { uid: user.id },
                token
            })

            const dataContingencia = await handleFetch({
                table: 'risk_analysis',
                query: 'emvs_per_item',
                token
            })

            

            const totalContin = dataContingencia.data.reduce((acc, cur) => acc += (cur.financial_impact * (cur.occurrence / 5)), 0);

            setPlanos(data.data);
            setResumo(dataResumo.data);
            setContingencia(dataContingencia.data);
            setTotalContingencia(totalContin);
        } finally {
            setLoading(false);
        }
    };

    const fetchCores = async () => {
        const data = await handleFetch({
            table: "wbs_area",
            query: 'colors',
            token
        });
        var cores = {};
        data.data.forEach((area) => {
            cores[area.name] = area.color ?? '';
        })
        cores.Others = '#cccccc';
        setCores(cores);
    }

    const [planosPorArea_Essencial_graph, planosPorArea_all_graph, planosPorArea_reserve_graph] = useMemo(() => {
        const essentialGraph = [['Area', 'Value']];
        const allGraph = [['Area', 'Value']];
        const reserveGraph = [['Area', 'Value']];
        if (resumo == 0) return [essentialGraph, allGraph, reserveGraph];
        var objEssential = {};
        var objAll = {}
        var objReserve = {};
        var somaTotalEssential = 0;
        var somaTotalAll = 0;
        resumo.forEach((item) => {
            var somaAtual;
            const areaName = item.area_name || "Others";
            if (item.is_essential) {
                if (objEssential[areaName]) {
                    somaAtual = objEssential[areaName];
                } else {
                    somaAtual = 0;
                }
                somaAtual += (item.total_a * 2 + item.total_b) / 3;
                objEssential = {
                    ...objEssential,
                    [item.area_name]: somaAtual
                }
                somaTotalEssential += (item.total_a * 2 + item.total_b) / 3;
            }
            if (objAll[areaName]) {
                somaAtual = objAll[areaName];
            } else {
                somaAtual = 0;
            }
            somaAtual += (item.total_a * 2 + item.total_b) / 3;
            objAll = {
                ...objAll,
                [item.area_name]: somaAtual
            }
            objReserve = {
                ...objReserve,
                [item.area_name]: somaAtual
            }
            somaTotalAll += (item.total_a * 2 + item.total_b) / 3;

        })
        Object.keys(objEssential).forEach((key) => {
            essentialGraph.push([key, parseFloat(objEssential[key].toFixed(2))])
        })
        Object.keys(objAll).forEach((key) => {
            allGraph.push([key, parseFloat(objAll[key].toFixed(2))]);
        })

        contingencia.forEach(c => {
            const areaName = c.risk?.wbs_item?.wbs_area.name || 'Reserves';
            if (!objReserve[areaName]) objReserve[areaName] = 0;
            objReserve[areaName] += (c.financial_impact * (c.occurrence / 5));
        });

        Object.keys(objReserve).forEach((key) => {
            reserveGraph.push([key, parseFloat(objReserve[key].toFixed(2))]);
        })
        setPlanosSoma_essencial(somaTotalEssential);
        setPlanosSoma_all(somaTotalAll);
        return [essentialGraph, allGraph, reserveGraph];
    }, [resumo, contingencia]);

    const estiloGraph = {
        backgroundColor: 'transparent',
        titleTextStyle: {
            color: "black"
        },
        legend: {
            textStyle: { color: 'black' }
        },
        hAxis: {
            textStyle: { color: 'black' },
            gridlines: { color: 'black' }
        },
        vAxis: {
            textStyle: { color: 'black' },
        },
    }


    //funcao que trata e envia os dados para atualizacao no banco
    const handleUpdateItem = async (obj) => {
        setLoading(true);
        const {date_difference, value_difference, resource, ...usedObj} = obj;
        try {
            await handleReq({
                table: 'resource_acquisition_plan',
                route: 'update',
                token,
                data: usedObj,
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
        fetchCores();
    }, []);


    //textos dos modais 
    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'datasSemSentido': 'The critical date must be after the expected date!'
    };


    //funcao que calcula o rowSpan dos tds de area de acordo com a quantidade de itens q a area possui
    const calculateRowSpan = (currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < planos.length; i++) {
            if (planos[i].resource.resource === currentArea) {
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
        outsourcing: "Outsourcing",
    }

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Resource Acquisition Planning <button onClick={()=> setShowHelp(true)}>❔</button></h2>

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
                                <th>Actual strategy <a>*</a></th>
                                <th>Date <a>*</a></th>
                                <th>Value <a>*</a></th>
                                <th style={{ minWidth: '8rem' }}>Date difference</th>
                                <th style={{ minWidth: '8rem' }}>Value difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {planos.map((plano, index) => {
                                const backgroundColor = plano?.resource?.wbs_item?.wbs_area?.color ?? 'white';

                                const date_real = plano.date_real != 'NaN/NaN/NaN' && plano.date_real != null ? isoDateToEuDate(plano.date_real) : '-';
                                const value_real = plano.value_real != null ? `R$${Number(plano.value_real).toFixed(2)}` : '-';

                                return (
                                <React.Fragment key={index}>
                                    {linhaVisivel === plano.id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => { setLinhaVisivel(); setIsUpdating(false) }
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <tr style={{ backgroundColor, color: getTextColor(backgroundColor) }}>
                                            {!isUpdating || isUpdating !== plano.resource.resource ? (
                                                <React.Fragment>
                                                    {index === 0 || planos[index - 1].recurso !== plano.resource.resource ? (
                                                        <td rowSpan={calculateRowSpan(plano.resource.resource, index)}
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
                                            <td>{date_real}</td>
                                            <td>{value_real}</td>
                                            <td>{plano.date_diference}</td>
                                            <td>{plano.value_diference}
                                            </td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(plano)}
                                                    disabled={!isEditor}>❌</button>
                                                <button onClick={() => { handleUpdateClick(plano) }
                                                } disabled={!isEditor}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )})}
                            <CadastroInputs
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
            <div className='centered-container' style={{ marginTop: '1rem' }}>
                <button className='botao-bonito' style={{ width: '10rem', marginTop: '0.1rem' }} onClick={() => setVerReserves(!verReserves)}>
                    {!verReserves ? `View reserves` : `View only resources`}
                </button>
            </div>

            <div style={{ display: 'flex' }} className={pie_container}>
                <div className={pie_esquerda}>
                    <Chart
                        width={'100%'}
                        height={'400px'}
                        chartType="PieChart"
                        loader={<div>Loading graph</div>}
                        data={planosPorArea_Essencial_graph}
                        options={{
                            ...estiloGraph,
                            title: 'Essencial Scenario',
                            slices: planosPorArea_Essencial_graph.slice(1).map((row, _) => ({
                                color: cores[row[0]] || '#ffffff',
                            })),
                            pieSliceTextStyle: {
                                color: 'black',
                            },
                        }}
                        rootProps={{ 'data-testid': '1' }}
                    />
                </div>

                <div className={pie_direita}>
                    <Chart
                        width={'100%'}
                        height={'400px'}
                        chartType="PieChart"
                        loader={<div>Loading graph</div>}
                        data={!verReserves ? planosPorArea_all_graph : planosPorArea_reserve_graph}
                        options={{
                            ...estiloGraph,
                            title: 'Ideal Scenario',
                            slices: planosPorArea_reserve_graph.slice(1).map((row, _) => ({
                                color: cores[row[0]] || '#ccc',
                            })),
                            pieSliceTextStyle: {
                                color: 'black',
                            },
                        }}
                        rootProps={{ 'data-testid': '1' }}
                    />
                </div>
            </div>

            <div className="centered-container" style={{ flexDirection: "row" }}>
                <span className={custom_span}>Essential Scenario: R${parseFloat(planosSoma_essencial.length > 0 ? planosSoma_essencial : 0).toFixed(2)}</span>
                {!verReserves ? (
                    <span className={custom_span}>Ideal Scenario: R${parseFloat(planosSoma_all.length > 0 ? planosSoma_all : 0).toFixed(2)}</span>
                ) : (
                    <span className={custom_span}>Ideal Scenario + Reserves: R${parseFloat(planosSoma_all * 1.05 + totalContingencia).toFixed(2)}</span>
                )}

            </div>
        </div>

    )
}

export default PlanoAquisicao;