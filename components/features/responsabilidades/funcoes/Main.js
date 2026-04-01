import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/responsabilidades.module.css'
import Inputs from "./forms/Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleFetch, handleReq } from '../../../../functions/crud_s';
import useAuth from '../../../../hooks/useAuth';
import usePerm from '../../../../hooks/usePerm';
import HelpBubble from "../../../ui/HelpBubble/responsabilidades/Funcoes";
import { FuncoesProvider, useFuncoes } from "./data/FuncoesContext";
import NewFuncaoCreator from "./forms/NewFuncaoCreator";
import FuncoesBlock from "./blocks/FuncoesBlock";

const Tabela = () => {
    const { funcoes, isLoading, setIsLoading, fetchData} = useFuncoes();
    const { user, token } = useAuth();
    const user_id = user.id;
    const { isEditor } = usePerm();

    const camposVazios = {
        role: '',
        description: '',
        skills: '',
        member_id: '',
        areas: []
    }
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [oldDados, setOldDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [showHelp, setShowHelp] = useState(false);

    const handleUpdateClick = (item) => {
        setLinhaVisivel(item.id)
        setOldDados(item);
        const {wbs_area, member, ...obj} = item;
        obj.areas = [];
        obj.member_id = item?.member?.id;
        item?.wbs_area?.forEach(a => {
            obj.areas.push(a.id);
        })
        setNovosDados(obj);
    }

    const handleUpdateItem = async () => {
        setIsLoading(true);
        for(const area of oldDados?.wbs_area){
            if(!novosDados?.areas?.some(a => a == area.id)){
                await handleReq({
                    table: "rel_area_role",
                    route: 'delete',
                    token,
                    data: { role_id: oldDados.id, area_id: area.id}
                })
            }
        }
        for(const area of novosDados?.areas){
            if(!oldDados?.wbs_area?.some(a => a.id == area)){
                await handleReq({
                    table: "rel_area_role",
                    route: 'create',
                    token,
                    data: { role_id: oldDados.id, area_id: area, user_id}
                })
            }
        }
        await fetchData();
        setIsLoading(false);
        setNovosDados(camposVazios);
        setLinhaVisivel();
    };

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
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Roles <button onClick={()=> setShowHelp(true)}>❔</button></h2>

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
            <Tabela/>
        </FuncoesProvider>
    )
}

export default Main;