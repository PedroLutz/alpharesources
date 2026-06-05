import { useState } from "react"
import styles from '../../../../styles/modules/custoBeneficio.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import {  handleReq } from '../../../../functions/crud_s';
import useAuth from '../../../../hooks/useAuth';
import HelpBubble from '../../../ui/HelpBubble/recursos/CustoBeneficio';
import { CBProvider } from "./CbDataContext";
import { useCostBenefit } from "./CbDataContext";
import NewCBCreator from "./forms/NewCBCreator";
import CbBlock from "./blocks/CbBlock";
import { useToolbar } from "../../../../hooks/useToolbar";
import { useCallback } from "react";
import exportCSV from "../../../../functions/exportCSV";
import { useEffect } from "react";

const Tabela = () => {
    const { custoBeneficios,
        isLoading,
        setIsLoading,
        refetchData
    } = useCostBenefit();

    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const { token } = useAuth();
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Identification", "Description",
            "Cost", "Cost Ranking", "Impact", 
            "Urgency", "Competitive Edge", "Affected Areas", "Benefit average", 
            "Cost-Benefit index", "Explanation"];
        const lines = custoBeneficios.map(custoBeneficio => {
            const benefitAverage = parseFloat((custoBeneficio.area_impact
                + custoBeneficio.impact
                + custoBeneficio.urgency
                + custoBeneficio.edge)
                / 4);
            const benefitIndex = parseFloat(benefitAverage / custoBeneficio.cost_ranking);

            return [
            `"${custoBeneficio.identification}"`,
            `"${custoBeneficio.description}"`,
            `"${parseFloat(custoBeneficio.cost).toFixed(2)}"`,
            `"${custoBeneficio.cost_ranking}"`,
            `"${custoBeneficio.impact}"`,
            `"${custoBeneficio.urgency}"`,
            `"${custoBeneficio.edge}"`,
            `"${custoBeneficio.area_impact}"`,
            `"${benefitAverage.toFixed(2)}"`,
            `"${benefitIndex.toFixed(2)}"`,
            `"${custoBeneficio.explanation}"`,
        ]});
        exportCSV(headers, lines, "cost_benefit");
    }, [custoBeneficios, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [custoBeneficios, exportToCSV]);

    //funcao que envia o id para ser deletado
    const handleConfirmDelete = async () => {
        setIsLoading(true);
        if (confirmDeleteItem) {
            await handleReq({
                table: 'cost_benefit',
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: refetchData
            });
            setExibirModal(`deleteSuccess`);
        }
        setConfirmDeleteItem(null);
        setIsLoading(false);
    };


    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!'
    };

    const getCustosBeneficios = (cus, ben) => {
        const custoBen = []
        if (custoBeneficios) {
            custoBeneficios.forEach((cb) => {
                if (cb.cost_ranking === cus && cb.mediaBeneficios > ben - 1 && cb.mediaBeneficios <= ben) {
                    custoBen.push(cb.identification)
                }
            })
        }
        return (
            <ul>
                {custoBen.map((identificacao, index) => (
                    <li key={index} style={{ fontSize: '0.65rem', textAlign: 'left' }}>{identificacao}</li>
                ))}
            </ul>
        );
    }

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className='smallTitle'>Cost-Benefit Analysis</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.identification}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabela_cb_container}>
                <div className={styles.tabela_cb_wrapper}>
                    <table className={`tabela ${styles.tabela_cb}`}>
                        <thead>
                            <tr>
                                <th>Identification</th>
                                <th>Description</th>
                                <th>Cost</th>
                                <th>Cost Ranking</th>
                                <th>Impact</th>
                                <th>Urgency</th>
                                <th>Competitive Edge</th>
                                <th>Affected Areas</th>
                                <th>Benefit average</th>
                                <th>Cost-Benefit index</th>
                                <th>Explanation</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {custoBeneficios.map((custoBeneficio, _) => (
                                <CbBlock key={custoBeneficio.id}
                                    custoBeneficio={custoBeneficio}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewCBCreator setExibirModal={setExibirModal}/>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.tabela_cb_container} style={{ marginTop: '3rem' }}>
                <h2 className='smallTitle'>Cost-Benefit Matrix</h2>
                <p>Benefit average</p>
                <div className={styles.tabela_cb_wrapper}>
                    <table className={`${styles.tabela_cb} tabela`} style={{ width: '75rem' }}>
                        <thead style={{ background: 'transparent' }}>
                            <tr>
                                <th style={{ borderColor: 'transparent', backgroundColor: 'transparent', width: '1rem', color: 'white' }}></th>
                                <th style={{ borderColor: 'transparent', borderBottomColor: 'black', borderRightColor: 'black', backgroundColor: 'transparent', width: '1rem', color: 'white' }}></th>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>4</th>
                                <th style={{fontSize: '0.8rem'}}>5</th>
                            </tr>
                        </thead>
                        <tbody >
                            <tr>
                                <td rowSpan={5}
                                    style={{ border: 'transparent', width: '0.2rem', fontSize: '1rem', margin: '0rem', padding: '0rem' }}
                                ><div style={{
                                    writingMode: 'sideways-lr',
                                    display: 'inline-block',
                                }}>
                                        Cost ranking
                                    </div></td>
                                <th>5</th>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(5, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(5, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getCustosBeneficios(5, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getCustosBeneficios(5, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getCustosBeneficios(5, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>4</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getCustosBeneficios(4, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(4, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(4, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getCustosBeneficios(4, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getCustosBeneficios(4, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>3</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getCustosBeneficios(3, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(3, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(3, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getCustosBeneficios(3, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getCustosBeneficios(3, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>2</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getCustosBeneficios(2, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(2, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(2, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(2, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getCustosBeneficios(2, 5) || '-'}</td>
                            </tr>
                            <tr>
                                <th>1</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getCustosBeneficios(1, 1) || '-'}</td>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getCustosBeneficios(1, 2) || '-'}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getCustosBeneficios(1, 3) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(1, 4) || '-'}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getCustosBeneficios(1, 5) || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

const Main = () => {
    return (
        <CBProvider>
            <Tabela/>
        </CBProvider>
    )
}

export default Main;