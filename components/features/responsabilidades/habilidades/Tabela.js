import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/responsabilidades.module.css'
import Inputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleFetch, handleReq } from '../../../../functions/crud_s';
import { cleanForm } from "../../../../functions/general";
import useAuth from '../../../../hooks/useAuth';
import usePerm from '../../../../hooks/usePerm';
import HelpBubble from "../../../ui/HelpBubble/responsabilidades/Habilidades";

const Tabela = () => {
    const { user, token } = useAuth();
    const user_id = user.id;
    const { isEditor } = usePerm();

    const camposVazios = {
        role_id: '',
        skill: '',
        cur_level: '',
        min_level: '',
        action: '',
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [habilidades, setHabilidades] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);

    const enviar = async () => {
        await handleReq({
            table: 'skill',
            route: 'create',
            token,
            data: { ...novoSubmit, user_id },
            fetchDados: fetchHabilidades
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
        setReload(true);
    };

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: "skill",
                route: 'update',
                token,
                data: { id: novosDados.id,
                        role_id: novosDados.role_id, 
                        skill: novosDados.skill,
                        cur_level: novosDados.cur_level,
                        min_level: novosDados.min_level,
                        action: novosDados.action
                    },
            })
        } catch (error) {
            console.error("Update failed:", error);
        }
        setReload(true);
        setLoading(false);
        setLinhaVisivel();
        setNovosDados(camposVazios);
    };

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "skill",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchDados: fetchHabilidades
            });
        }
        setReload(true);
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    const fetchHabilidades = async () => {
        try {
            const data = await handleFetch({
                table: 'skill',
                query: 'all',
                token
            })
            data.data.forEach((d) => d.role.wbs_area.sort((a, b) => a.name > b.name))
            setHabilidades(data.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchHabilidades();
        }
    }, [reload]);

    useEffect(() => {
        fetchHabilidades();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!',
        'habilidadeRepetida': 'You have already registered this skill!'
    };

    const compareArraysOfObjects = (arr1, arr2) => {
        function compareObjects(o1, o2){
                const keys1 = Object.keys(o1);
                const keys2 = Object.keys(o2);

                if(keys1.length != keys2.length) return false;

                return keys1.every(key => o1[key] === o2[key]);
            }

        if(arr1.length !== arr2.length) return false;
        return arr1.every((value, i) => compareObjects(value, arr2[i]));
    }

    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < habilidades.length; i++) {

            let comparedData = habilidades[i][parametro];
            if(parametro.includes(".")){
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], habilidades[i]);
            }

            let comparison = comparedData === currentArea;
            if(parametro === 'role.wbs_area') comparison = compareArraysOfObjects(comparedData, currentArea);
            if (comparison) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Skill evaluation <button onClick={()=> setShowHelp(true)}>❔</button></h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.skill}"?`,
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
                <div className={styles.tabelaRaci_wrapper}>
                    <table className={`tabela ${styles.tabelaHabilidade}`}>
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Role</th>
                                <th>Responsible</th>
                                <th>Skill</th>
                                <th className={styles.habilidadeThSkill}>Current skill level</th>
                                <th className={styles.habilidadeThSkill}>Desired skill level</th>
                                <th>Development action</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {habilidades.map((habilidade, index) => {
                                const shouldMergeArea = index === 0 || !compareArraysOfObjects(habilidades[index - 1].role?.wbs_area, habilidade.role?.wbs_area);
                                const shouldMergeRole = index === 0 || habilidades[index - 1].role?.role !== habilidade?.role?.role;
                                const shouldMergeMember = index === 0 || habilidades[index - 1]?.role?.member?.name !== habilidade?.role?.member?.name;

                                return (
                                <tr key={index}>

                                    {shouldMergeArea ? (
                                        <td rowSpan={calculateRowSpan(habilidade?.role?.wbs_area, index, 'role.wbs_area')}
                                        >{habilidade?.role?.wbs_area?.reduce((acc, cur) => {
                                            if (acc == "") return acc + cur.name;
                                            return acc + ", " + cur.name;
                                        }, "")}</td>
                                    ) : null}

                                    {shouldMergeRole ? (
                                        <td rowSpan={calculateRowSpan(habilidade?.role?.role, index, 'role.role')}
                                        >{habilidade?.role?.role}</td>
                                    ) : null}

                                    {shouldMergeMember ? (
                                        <td rowSpan={calculateRowSpan(habilidade?.role?.member?.name, index, 'role.member.name')}
                                        >{habilidade?.role?.member?.name}</td>
                                    ) : null}

                                    {linhaVisivel === habilidade.id ? (
                                        <Inputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => setLinhaVisivel()
                                            }}
                                            setExibirModal={setExibirModal}
                                        />
                                    ) : (
                                        <React.Fragment>
                                            <td>{habilidade.skill}</td>
                                            <td>{habilidade.cur_level}</td>
                                            <td>{habilidade.min_level}</td>
                                            <td className={styles.habilidadeTdAcao}>{habilidade.action}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(habilidade)} disabled={!isEditor}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(habilidade.id); setNovosDados(habilidade);
                                                }
                                                } disabled={!isEditor}>⚙️</button>
                                            </td>
                                        </React.Fragment>
                                    )}
                                </tr>
                            )})}
                            <tr>
                                <Inputs
                                    obj={novoSubmit}
                                    objSetter={setNovoSubmit}
                                    funcoes={{
                                        enviar
                                    }}
                                    setExibirModal={setExibirModal}
                                />
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default Tabela;