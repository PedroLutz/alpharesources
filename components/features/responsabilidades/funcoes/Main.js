import { useState } from "react"
import styles from '../../../../styles/modules/responsabilidades.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq } from '../../../../functions/crud_s';
import useAuth from '../../../../hooks/useAuth';
import HelpBubble from "../../../ui/HelpBubble/responsabilidades/Funcoes";
import { FuncoesProvider, useFuncoes } from "./data/FuncoesContext";
import NewFuncaoCreator from "./forms/NewFuncaoCreator";
import FuncoesBlock from "./blocks/FuncoesBlock";
import { useToolbar } from "../../../../hooks/useToolbar";
import { useEffect } from "react";
import exportCSV from "../../../../functions/exportCSV";
import { useCallback } from "react";

const Tabela = () => {
    const { funcoes, isLoading, fetchData } = useFuncoes();
    const { token } = useAuth();
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Role", "Description", "Required Skills", "Responsible", "WBS Area"];
        const lines = funcoes.map(f => [
            f.role,
            `"${f.description}"`,
            `"${f.skills}"`,
            `"${f.member.name}"`,
            `"${f.wbs_area.map(a => a.name).join(", ")}"`
        ]
        )
        exportCSV(headers, lines, "roles");
    }, [funcoes, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [funcoes, exportToCSV]);

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "role",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'funcaoRepetida': 'You have already registered that role!'
    };

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <h2 className="smallTitle">Roles</h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.role}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabelaRaci_container}>
                <div className={styles.tabelaRaci_wrapper} >
                    <table className={`${styles.tabelaFuncoes} tabela`}>
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Description</th>
                                <th>Required skills</th>
                                <th>Responsible</th>
                                <th>WBS area</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {funcoes.map((funcao, _) => (
                                <FuncoesBlock
                                    key={funcao.id}
                                    funcao={funcao}
                                    setExibirModal={setExibirModal}
                                    setConfirmDeleteItem={setConfirmDeleteItem}
                                />
                            ))}
                            <NewFuncaoCreator
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

const Main = () => {
    return (
        <FuncoesProvider>
            <Tabela />
        </FuncoesProvider>
    )
}

export default Main;