import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/responsabilidades.module.css'
import Inputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleFetch, handleReq } from '../../../../functions/crud_s';
import { cleanForm } from "../../../../functions/general";
import useAuth from '../../../../hooks/useAuth';
import usePerm from '../../../../hooks/usePerm';
import HelpBubble from "../../../ui/HelpBubble/responsabilidades/Funcoes";

const Tabela = () => {
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
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [oldDados, setOldDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [funcoes, setFuncoes] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);

    const enviar = async () => {
        const success = await handleReq({
            table: 'role',
            route: 'createReturn',
            token,
            data: { role: novoSubmit.role, 
                    description: novoSubmit.description, 
                    skills: novoSubmit.skills, 
                    member_id: novoSubmit.member_id,
                    user_id },
        });
        
        for(let area in novoSubmit.areas){
            await handleReq({
            table: 'rel_area_role',
            route: 'create',
            token,
            data: { role_id: success?.data?.resultado[0].id, 
                    area_id: novoSubmit.areas[area],
                    user_id },
            });
        }
        setReload(true);
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const handleUpdateClick = (item) => {
        setLinhaVisivel(item.id)
        setOldDados(item);
        const obj = {...item, areas: []};
        delete obj.wbs_area;
        delete obj.member;
        obj.member_id = item?.member?.id;
        item?.wbs_area?.forEach(a => {
            obj.areas.push(a.id);
        })
        setNovosDados(obj);
    }

    const handleUpdateItem = async () => {
        setLoading(true);
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
        setReload(true);
        setLoading(false);
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
                fetchData: fetchFuncoes
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    const fetchFuncoes = async () => {
        try {
            const data = await handleFetch({
                table: "role",
                query: 'all',
                token,
                })
            data.data.forEach((d) => d.wbs_area.sort((a, b) => a.name > b.name))
            setFuncoes(data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchFuncoes();
        }
    }, [reload]);

    useEffect(() => {
        fetchFuncoes();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'funcaoRepetida': 'You have already registered that role!'
    };

    const isFuncaoCadastrada = (funcao) => {
        return funcoes.some((f) => f.role.trim().toLowerCase() == funcao.trim().toLowerCase());
    }

    return (
        <div className="centered-container">
            {loading && <Loading />}
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
                            {funcoes.map((funcao, index) => (
                                <React.Fragment key={index}>
                                    {linhaVisivel === funcao.id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => setLinhaVisivel()
                                            }}
                                            setExibirModal={setExibirModal}
                                            isEditor={isEditor}
                                        />
                                    ) : (
                                        <tr>
                                            <td name="role">{funcao.role}</td>
                                            <td name="description">{funcao.description}</td>
                                            <td name="skills">{funcao.skills}</td>
                                            <td name="member_id">{funcao.member.name}</td>
                                            <td>{funcao.wbs_area.map(a => a.name).join(", ")}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(funcao)} disabled={!isEditor}>❌</button>
                                                <button onClick={() => {handleUpdateClick(funcao)}
                                                } disabled={!isEditor}>⚙️</button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            <Inputs
                                obj={novoSubmit}
                                objSetter={setNovoSubmit}
                                funcoes={{
                                    isFuncaoCadastrada,
                                    enviar: enviar
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
};

export default Tabela;