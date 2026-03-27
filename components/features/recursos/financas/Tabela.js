import React, { useEffect, useState } from 'react';
import Loading from '../../../ui/Loading';
import Modal from '../../../ui/Modal';
import CadastroInputs from './forms/CadastroInputs';
import styles from '../../../../styles/modules/financas.module.css'
import { jsDateToEuDate, euDateToIsoDate, cleanForm } from '../../../../functions/general';
import useAuth from '../../../../hooks/useAuth';
import usePerm from '../../../../hooks/usePerm';
import { handleFetch, handleReq } from '../../../../functions/crud_s';
import HelpBubble from '../../../ui/HelpBubble/recursos/Financas';
import { useFinances } from './FinancesContext';
import { FinancesProvider } from './FinancesContext';
import NewReleaseCreator from './forms/NewReleaseCreator';
import ReleaseBlock from './blocks/ReleaseBlock';

const Tabela = () => {
    const { token } = useAuth();

    const {
        lancamentos,
        isLoading,
        refetchData
    } = useFinances();

    const [deleteItem, setDeleteItem] = useState();
    const [exibirModal, setExibirModal] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    //funcao que envia o id para deletar os itens
    const handleConfirmDelete = async () => {
        if (deleteItem) {
            await handleReq({
                table: "financial_release",
                route: 'delete',
                token,
                data: { id: deleteItem.id },
                fetchData: refetchData
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

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className='smallTitle'>Financial Releases Data <button onClick={()=>setShowHelp(true)}>❔</button></h2>
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
                            <NewReleaseCreator
                                setExibirModal={setExibirModal}
                            />
                            {lancamentos.map((item, index) => (
                                <ReleaseBlock
                                    item={item}
                                    key={index}
                                    setExibirModal={setExibirModal}
                                    setDeleteItem={setDeleteItem}
                                />
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

const Main = () => {
    return (
        <FinancesProvider>
            <Tabela/>
        </FinancesProvider>
    )   
}

export default Main;