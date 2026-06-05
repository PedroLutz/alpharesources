import { useState } from 'react';
import styles from '../../../../styles/modules/responsabilidades.module.css'
import Loading from '../../../ui/Loading';
import Modal from '../../../ui/Modal';
import useAuth from '../../../../hooks/useAuth';
import { handleReq } from '../../../../functions/crud_s';
import HelpBubble from "../../../ui/HelpBubble/responsabilidades/Membros";
import { MembroProvider, useMembro } from './data/MembroContext';
import NewMembroCreator from './forms/NewMembroCreator';
import MembroBlock from './blocks/MembroBlock';
import exportCSV from '../../../../functions/exportCSV';
import { useEffect } from 'react';
import { useToolbar } from '../../../../hooks/useToolbar';
import { useCallback } from 'react';

const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
    'membroRepetido': 'You have already registered that member!'
};

const Tabela = () => {
    const { token } = useAuth();
    const { membros, isLoading, fetchData } = useMembro();
    
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();
    
    const exportToCSV = useCallback(() => {
        const headers = ["Name", "Softskills", "Hardskills"];
        const lines = membros.map(m => [ 
                m.name,
                `"${m.softskills}"`,
                `"${m.hardskills}"`
            ]
        )
        exportCSV(headers, lines, "members");
    }, [membros, exportCSV]);
    
    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [membros, exportToCSV]);


    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "member",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className='smallTitle'>
                Team members 
            </h2>

            <div id="report" className={styles.membrosContainerPai}>
                <NewMembroCreator
                    setExibirModal={setExibirModal}
                />
                {membros.map((membro, _) => (
                    <MembroBlock
                        key={membro.id}
                        membro={membro}
                        setExibirModal={setExibirModal}
                        setConfirmDeleteItem={setConfirmDeleteItem}
                    />
                ))}
            </div>

            {confirmDeleteItem && (
                <Modal objeto={{
                    titulo: `Are you sure you want to delete "${confirmDeleteItem.name}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
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
        <MembroProvider>
            <Tabela />
        </MembroProvider>
    )
};

export default Main;