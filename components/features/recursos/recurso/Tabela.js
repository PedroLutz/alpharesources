import React, { useEffect, useState } from "react"
import CadastroInputs from "./CadastroInputs";
import styles from '../../../../styles/modules/recursos.module.css'
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import useAuth from '../../../../hooks/useAuth';
import usePerm from '../../../../hooks/usePerm';
import { cleanForm, isoDateToEuDate } from "../../../../functions/general";
import { handleFetch, handleReq } from '../../../../functions/crud_s';
import HelpBubble from "../../../ui/HelpBubble/recursos/Recurso";
import { getTextColor } from "../../../../functions/colors";

const Tabela = () => {
    const camposVazios = {
        item_id: "",
        resource: "",
        usage: "",
        type: "",
        is_essential: ""
    }
    const { user, token } = useAuth();
    const { isEditor } = usePerm();
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [recursos, setRecursos] = useState([]);
    const [datasPlanos, setDatasPlanos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const labelsTypes = {
        physical: "Physical",
        financial: 'Financial',
        human: "Human"
    }

    //funcao que busca as datas de inicio e termino dos planos
    const fetchDatasPlanos = async () => {
        const data = await handleFetch({
            table: 'gantt',
            query: 'plansStartsPerItem',
            token
        })
        data.data.forEach(item => {
            item.gantt_data[0].start = isoDateToEuDate(item.gantt_data[0]?.start);
        })
        setDatasPlanos(data.data);
    }


    //funcao que envia os dados de novoSubmit para submit no banco
    const enviar = async () => {
        await handleReq({
            table: 'resource',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                user_id: user.id,
                item_id: novoSubmit.item_id != -1 ? novoSubmit.item_id : null
            },
            fetchData: fetchRecursos
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
        setReload(true);
    };

    //fuuncao que busca os recursos
    const fetchRecursos = async () => {
        try {
            const data = await handleFetch({
                table: 'resource',
                query: 'all',
                token
            })
            setRecursos(data.data);
        } finally {
            setLoading(false);
        }
    };


    //funcao que trata os dados e envia para update
    const handleUpdateItem = async () => {
        setLoading(true);
        const {wbs_item, ...dadosUsados} = novosDados;
        try {
            await handleReq({
                table: 'resource',
                route: 'update',
                token,
                data: {...dadosUsados, item_id: dadosUsados.item_id != -1 ? dadosUsados.item_id : null},
                fetchData: fetchRecursos
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setReload(true);
        setLoading(false);
        setIsUpdating(false);
        setLinhaVisivel();
        setNovosDados(camposVazios);
    };


    //funcao que envia o id para delecao
    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "resource",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchRecursos
            });
            setExibirModal(`deleteSuccess`);
            setConfirmDeleteItem(null);
        }
    };

    //useEffect que so roda quando reload atualiza
    useEffect(() => {
        if (reload == true) {
            setReload(false);
            fetchRecursos();
            fetchDatasPlanos();
        }
    }, [reload]);

    const handleUpdateClick = (item) => {
        setNovosDados({
            id: item.id,
            resource: item.resource,
            is_essential: item.is_essential,
            type: item.type,
            item_id: item.wbs_item?.id,
            usage: item.usage
        })
    }

    //useEffect que so roda no primeiro render
    useEffect(() => {
        fetchRecursos();
        fetchDatasPlanos();
    }, []);

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
    };


    //funcao que calcula o rowSpan dos td de area de acordo com a quantidade de itens q ela tem
    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < recursos.length; i++) {
            const parameter = parametro == 'area' ? recursos[i].wbs_item?.wbs_area?.name : recursos[i].wbs_item?.name
            if (parameter === currentArea) {
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
            
            <h2 className="smallTitle">
                Resource Identification 
                <button onClick={()=> setShowHelp(true)}>❔</button>
            </h2>

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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.resource}"?`,
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
                                <th colSpan={2}>Resource Allocation</th>
                                <th rowSpan={2}>Resource</th>
                                <th rowSpan={2}>Usage</th>
                                <th rowSpan={2}>Type</th>
                                <th rowSpan={2}>Utilization Forecast</th>
                                <th rowSpan={2}>Essential?</th>
                                <th rowSpan={2}>Actions</th>
                            </tr>
                            <tr>
                                <th>Area</th>
                                <th>Item</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recursos.map((recurso, index) => { 
                                const backgroundColor = recurso?.wbs_item?.wbs_area?.color;

                                const isEditingThisArea = !isUpdating || isUpdating[0] !== recurso.wbs_item?.wbs_area.id;

                                const prevAreaName = recursos[index - 1]?.wbs_item?.wbs_area.name;
                                const curAreaName = recurso.wbs_item?.wbs_area.name;

                                const isEditingThisItem = !isUpdating || isUpdating[1] !== recurso.wbs_item?.id;

                                const prevItemName = recursos[index - 1]?.wbs_item?.name;
                                const curItemName = recurso.wbs_item?.name;
                                
                                const usageDate = datasPlanos.find(obj => obj?.wbs_item?.id === recurso?.wbs_item?.id)?.gantt_data[0]?.start || "-";

                                return (
                                <React.Fragment key={index}>
                                    {linhaVisivel === recurso.id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: () => handleUpdateItem(),
                                                cancelar: () => { setLinhaVisivel(); setIsUpdating(false) }
                                            }}
                                            setExibirModal={setExibirModal}
                                            backgroundColor={backgroundColor}
                                        />
                                    ) : (
                                        <tr style={{ backgroundColor, color: getTextColor(backgroundColor) }}>
                                            {isEditingThisArea ? (
                                                <React.Fragment>
                                                    {index === 0 || prevAreaName !== curAreaName ? (
                                                        <td rowSpan={calculateRowSpan(curAreaName, index, 'area')}
                                                        >{curAreaName || "Others"}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{curAreaName || "Others"}</td>
                                            )} 
                                            {isEditingThisItem ? (
                                                <React.Fragment>
                                                    {index === 0 || prevItemName !== curItemName ? (
                                                        <td rowSpan={calculateRowSpan(curItemName, index, 'item')}
                                                        >{curItemName || "Others"}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td>{curItemName || "Others"}</td>
                                            )}
                                            <td>{recurso.resource}</td>
                                            <td>{recurso.usage}</td>
                                            <td>{labelsTypes[recurso.type]}</td>
                                            <td>{usageDate}</td>
                                            <td>{recurso.is_essential ? 'Yes' : 'No'}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(recurso)}
                                                    disabled={!isEditor}>❌</button>
                                                <button onClick={() => {
                                                    setLinhaVisivel(recurso.id);
                                                    handleUpdateClick(recurso);
                                                    setIsUpdating([recurso.wbs_item?.wbs_area.id, recurso.wbs_item?.id])
                                                }
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
                                    enviar: () => enviar()
                                }}
                                setExibirModal={setExibirModal}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Tabela;