import { useState } from "react"
import styles from '../../../../styles/modules/planoAquisicao.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq } from '../../../../functions/crud_s';
import stylesResumo from '../../../../styles/modules/resumo.module.css'
import useAuth from '../../../../hooks/useAuth';
import { Chart } from 'react-google-charts';
import HelpBubble from "../../../ui/HelpBubble/recursos/Plano";
import { PlanoProvider, usePlano } from "./data/PlanoProvider";
import NewPlanoCreator from "./forms/NewPlanoCreator";
import PlanoBlock, { methodLabels } from "./blocks/PlanoBlock";
import { useCallback } from "react";
import exportCSV from "../../../../functions/exportCsv";
import { isoDateToEuDate } from "../../../../functions/general";
import { useToolbar } from "../../../../hooks/useToolbar";
import { useEffect } from "react";

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
    'datasSemSentido': 'The critical date must be after the expected date!'
};

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

const { pie_direita, pie_esquerda, pie_container, custom_span } = stylesResumo;

const PlanoAquisicao = () => {
    const { isLoading, planos, refetchData, cores, graphData } = usePlano();
    const { token } = useAuth();
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [updatingLine, setUpdatingLine] = useState(false);
    const [verReserves, setVerReserves] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Resource", "Plan A - Method", "Plan A - Supplier",
            "Plan A - Details", "Plan A - Value", "Expected date", "Critical date",
            "Plan B - Method", "Plan B - Supplier", "Plan B - Details", "Plan B - Value",
            "Actual strategy", "Date", "Value", "Date difference", "Value difference"];
        const lines = planos.map(plano => {
            return [
                `"${plano.resource.resource}"`,
                `"${methodLabels[plano.method_a]}"`,
                `"${plano.plan_a}"`,
                `"${plano.details_a}"`,
                `"R$${Number(plano.value_a).toFixed(2)}"`,
                `"${isoDateToEuDate(plano.expected_date)}"`,
                `"${isoDateToEuDate(plano.critical_date)}"`,
                `"${methodLabels[plano.method_b]}"`,
                `"${plano.plan_b}"`,
                `"${plano.details_b}"`,
                `"R$${Number(plano.value_b).toFixed(2)}"`,
                `"${plano.plan_real || '-'}"`,
                `"${plano.date_real != 'NaN/NaN/NaN' && plano.date_real != null ? isoDateToEuDate(plano.date_real) : '-'}"`,
                `"${plano.value_real != null ? `R$${Number(plano.value_real).toFixed(2)}` : '-'}"`,
                `"${plano.date_diference}"`,
                `"${plano.value_diference}"`,
            ]
        });
        exportCSV(headers, lines, "resource_acquisition_planning");
    }, [planos, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [planos, exportToCSV]);

    //funcao que envia os dados do item para delecao do banco
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: 'resource_acquisition_plan',
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: refetchData
            });
            setExibirModal(`deleteSuccess`);
        }
        setConfirmDeleteItem(null);
    }

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">Resource Acquisition Planning <button onClick={() => setShowHelp(true)}>❔</button></h2>

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
                            {planos.map((plano, index) => (
                                <PlanoBlock
                                    key={plano.id}
                                    index={index}
                                    plano={plano}
                                    updatingLine={updatingLine}
                                    setUpdatingLine={setUpdatingLine}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewPlanoCreator
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
                        data={graphData.essentialGraph}
                        options={{
                            ...estiloGraph,
                            title: 'Essencial Scenario',
                            slices: graphData.essentialGraph?.slice(1).map((row, _) => ({
                                color: cores[row[0]] || '#ccc',
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
                        data={!verReserves ? graphData.allGraph : graphData.reserveGraph}
                        options={{
                            ...estiloGraph,
                            title: 'Ideal Scenario',
                            slices: graphData.reserveGraph?.slice(1).map((row, _) => ({
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
                <span className={custom_span}>Essential Scenario: R${parseFloat(graphData?.sumEssencial ?? 0).toFixed(2)}</span>
                {!verReserves ? (
                    <span className={custom_span}>Ideal Scenario: R${parseFloat(graphData?.sumAll ?? 0).toFixed(2)}</span>
                ) : (
                    <span className={custom_span}>Ideal Scenario + Reserves: R${parseFloat(graphData?.sumAll * 1.05 + graphData?.totalContingencia).toFixed(2)}</span>
                )}

            </div>
        </div>

    )
}

const Main = () => {
    return (
        <PlanoProvider>
            <PlanoAquisicao />
        </PlanoProvider>
    )
}

export default Main;