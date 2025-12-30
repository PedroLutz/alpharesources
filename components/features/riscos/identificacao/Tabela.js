import React, { useEffect, useState } from "react"
import styles from '../../../../styles/modules/risco.module.css'
import CadastroInputs from "./Inputs";
import Modal from "../../../ui/Modal";
import Loading from "../../../ui/Loading";
import { handleReq, handleFetch } from "../../../../functions/crud_s";
import { cleanForm } from "../../../../functions/general";
import useAuth from "../../../../hooks/useAuth";
import usePerm from "../../../../hooks/usePerm";
import { getTextColor } from "../../../../functions/colors";
import HelpBubble from "../../../ui/HelpBubble/risco/Identificacao";

const TabelaRiscos = () => {
    const { user, token } = useAuth();
    const user_id = user.id;
    const { isEditor } = usePerm();

    const camposVazios = {
        item_id: '',
        owner_id: '',
        risk: '',
        classification: '',
        is_negative: '',
        effect: '',
        cause: '',
        trigger: '',
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
    const [riscos, setRiscos] = useState([]);
    const [exibirModal, setExibirModal] = useState(null);
    const [linhaVisivel, setLinhaVisivel] = useState();
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUptading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const enviar = async () => {
        await handleReq({
            table: 'risk',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                item_id: novoSubmit.item_id != -1 ? novoSubmit.item_id : null,
                owner_id: novoSubmit.owner_id != -1 ? novoSubmit.owner_id : null,
                user_id
            },
            fetchData: fetchRiscos
        });
        cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const isRiscoCadastrado = (risco) => {
        return riscos.some((r) => r.risk.trim().toLowerCase() === risco.trim().toLowerCase());
    }

    const handleUpdateClick = (item, index) => {
        const obj = {
            id: item.id,
            item_id: item?.wbs_item?.id || -1,
            owner_id: item?.member?.id,
            risk: item?.risk,
            classification: item?.classification,
            is_negative: item.is_negative,
            effect: item.effect,
            cause: item.cause,
            trigger: item.trigger
        }
        setNovosDados(obj);
        setLinhaVisivel(item.id);
        setIsUptading([item?.wbs_item?.wbs_area?.id, item?.wbs_item?.id, index]);
    }

    const handleUpdateItem = async () => {
        setLoading(true);
        try {
            await handleReq({
                table: 'risk',
                route: 'update',
                token,
                data: { ...novosDados, 
                    item_id: novosDados.item_id != -1 ? novosDados.item_id : null,
                    owner_id: novosDados.owner_id != -1 ? novosDados.owner_id : null,
                 },
                fetchData: fetchRiscos
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setIsUptading(false);
        setLinhaVisivel();
        setLoading(false);
        setNovosDados(camposVazios);
    };

    const handleConfirmDelete = async () => {
        if (confirmDeleteItem) {
            await handleReq({
                table: "risk",
                route: 'delete',
                token,
                data: { id: confirmDeleteItem.id },
                fetchData: fetchRiscos
            });
        }
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null)
    };

    const fetchRiscos = async () => {
        setLoaded(false);
        setLoading(true);
        try {
            const data = await handleFetch({
                table: 'risk',
                query: 'all',
                token
            });
            setRiscos(data.data);
        } finally {
            setLoading(false);
            setLoaded(true);
        }
    };

    useEffect(() => {
        fetchRiscos();
    }, [])

    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'deleteSuccess': 'Deletion Successful!',
        'deleteFail': 'Deletion Failed!',
        'valorNegativo': 'No fields can have negative values!',
        'maiorQueCinco': 'Classifications must be between 1 and 5!',
        'riscoRepetido': 'You have already registered this risk!'
    };

    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < riscos.length; i++) {
            let comparedData = riscos[i][parametro];
            if (parametro.includes(".")) {
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], riscos[i]);
            }
            if (comparedData === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    function capitalizeFirstLetter(str) {
        if (typeof str !== 'string' || str.length === 0) {
            return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    let lastAreaId = null, lastItemId = null;

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Risk Identification <button onClick={()=> setShowHelp(true)}>❔</button></h2>
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
                    titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.risk}"?`,
                    alerta: true,
                    botao1: {
                        funcao: handleConfirmDelete, texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
                    }
                }} />
            )}

            <div className={styles.tabelaRisco_container}>
                <div className={styles.tabelaRisco_wrapper}>
                    <table className={`${styles.tabelaRisco} tabela`}>
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Item</th>
                                <th>Risk</th>
                                <th>Classification</th>
                                <th>Category</th>
                                <th>Effect</th>
                                <th>Cause</th>
                                <th>Trigger</th>
                                <th>Owner</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riscos.map((item, index) => {
                                const { wbs_item } = item;
                                const { wbs_area } = wbs_item ?? {};
                                const shouldMergeArea = wbs_area?.id === lastAreaId;
                                const shouldMergeItem = wbs_item?.id === lastItemId;
                                
                                lastAreaId = wbs_area?.id;
                                lastItemId = wbs_item?.id;
                                
                                return (
                                <React.Fragment key={index}>
                                    {linhaVisivel === item.id ? (
                                        <CadastroInputs tipo="update"
                                            obj={novosDados}
                                            objSetter={setNovosDados}
                                            funcoes={{
                                                enviar: handleUpdateItem,
                                                cancelar: () => {
                                                    setLinhaVisivel(); setIsUptading(false);
                                                },
                                            }}
                                            setExibirModal={setExibirModal}
                                            loaded={loaded}
                                            backgroundColor={wbs_area?.color}
                                        />
                                    ) : (
                                        <tr style={{ backgroundColor: wbs_area?.color, color: getTextColor(wbs_area?.color ?? "#ffffff") }}>
                                            {!isUpdating || isUpdating[0] !== wbs_area.id ? (
                                                <React.Fragment>
                                                    {!shouldMergeArea ? (
                                                        <td className={styles.riscoTdArea}
                                                            rowSpan={calculateRowSpan(wbs_area?.id, index, 'wbs_item.wbs_area.id')}
                                                        >{wbs_area?.name ?? 'Others'}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td className={styles.riscoTdArea}>{wbs_area?.name ?? 'Others'}</td>
                                            )}
                                            {!isUpdating || isUpdating[1] !== wbs_item?.id ? (
                                                <React.Fragment>
                                                    {!shouldMergeItem ? (
                                                        <td className={styles.riscoTdItem}
                                                            rowSpan={calculateRowSpan(wbs_item?.id, index, 'wbs_item.id')}
                                                        >{wbs_item?.name || 'Others'}</td>
                                                    ) : null}
                                                </React.Fragment>
                                            ) : (
                                                <td className={styles.riscoTdItem}>{wbs_item?.name || 'Others'}</td>
                                            )}
                                            <td>{item.risk}</td>
                                            <td>{capitalizeFirstLetter(item.classification)}</td>
                                            <td>{item.is_negative ? 'Threat' : 'Opportunity'}</td>
                                            <td>{item.effect}</td>
                                            <td>{item.cause}</td>
                                            <td>{item.trigger}</td>
                                            <td>{item.member?.name || 'Circunstancial'}</td>
                                            <td className='botoes_acoes'>
                                                <button onClick={() => setConfirmDeleteItem(item)} disabled={!isEditor}>❌</button>
                                                <button onClick={() => {
                                                    handleUpdateClick(item, index)
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
                                funcoes={{ enviar, isRiscoCadastrado }}
                                setExibirModal={setExibirModal}
                                loaded={loaded}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
};

export default TabelaRiscos;