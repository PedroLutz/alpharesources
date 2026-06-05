import { useState } from "react";
import Loading from '../../../ui/Loading';
import Modal from "../../../ui/Modal";
import { handleReq } from "../../../../functions/crud_s";
import styles from "../../../../styles/modules/wbs.module.css"
import useAuth from "../../../../hooks/useAuth";
import HelpBubble from "../../../ui/HelpBubble/wbs/wbs";
import NewAreaCreator from "./forms/NewAreaCreator";
import AreaBlock from "./blocks/AreaBlock";
import NewItemCreator from "./forms/NewItemCreator";
import ItemBlock from "./blocks/ItemBlock";
import { WbsProvider, useWbs } from "./WbsContext";
import exportCSV from "../../../../functions/exportCsv";
import { useToolbar } from "../../../../hooks/useToolbar";
import { useEffect } from "react";
import { useCallback } from "react";

const MainContent = () => {
    const { token } = useAuth();

    const {
        areas,
        items,
        isLoading,
        setIsLoading,
        refetchData
    } = useWbs();

    const [exibirModal, setExibirModal] = useState(null);
    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'areaDup': 'This area is already registered!',
        'itemDup': 'This item is already registered somewhere else!'
    };

    const [deleteAreaConfirm, setDeleteAreaConfirm] = useState(null);
    const [deleteItemConfirm, setDeleteItemConfirm] = useState(null);

    const [showHelp, setShowHelp] = useState(false);

    const { setExportCSVClick, setHelpClick } = useToolbar();

    const exportToCSV = useCallback(() => {
        const headers = ["Area", "Item"];
        const lines = [];
        areas.forEach(a => {
            const _items = items.filter(i => i.area_id == a.id);
            _items.forEach(i => lines.push([
                a.name,
                i.name
            ]));
        })
        exportCSV(headers, lines, "wbs");
    }, [areas, items, exportCSV]);

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));
        setExportCSVClick(() => exportToCSV);

        return (() => {
            setHelpClick(null);
            setExportCSVClick(null);
        })
    }, [areas, items, exportToCSV]);


    const submitDelete = async (table, id) => {
        setIsLoading(true);
        if (deleteAreaConfirm) setDeleteAreaConfirm(null);
        if (deleteItemConfirm) setDeleteItemConfirm(null);
        await handleReq({
            table: table,
            route: 'delete',
            token,
            data: { id },
            fetchData: refetchData
        });
        setIsLoading(false);
    }

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}

            <h2 className="smallTitle">
                Work Breakdown Structure
                <button onClick={() => setShowHelp(true)}>❔</button>
            </h2>

            <div className={styles.main_container}>
                <div className={styles.main_wrapper}>
                    <NewAreaCreator
                        setExibirModal={setExibirModal}
                    />

                    {areas.map((area, index) => (
                        <div key={index} className={styles.wbs_container}>
                            <AreaBlock
                                area={area}
                                setExibirModal={setExibirModal}
                                setDeleteAreaConfirm={setDeleteAreaConfirm}
                            />

                            {items.filter((item => item.area_id == area.id)).map((item, index) => (
                                <ItemBlock
                                    key={item.id}
                                    area={area}
                                    item={item}
                                    setExibirModal={setExibirModal}
                                    setDeleteItemConfirm={setDeleteItemConfirm}
                                />
                            ))}

                            <div key={index} className={styles.item_outer_block}>
                                <NewItemCreator
                                    area={area}
                                    setExibirModal={setExibirModal}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {deleteAreaConfirm && (
                <Modal objeto={{
                    titulo: `Are you sure you want to delete "${deleteAreaConfirm.name}"? This will delete ALL data related to this area.`,
                    alerta: true,
                    botao1: {
                        funcao: () => submitDelete('wbs_area', deleteAreaConfirm.id), texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setDeleteAreaConfirm(null), texto: 'Cancel'
                    },
                }} />
            )}

            {deleteItemConfirm && (
                <Modal objeto={{
                    titulo: `Are you sure you want to delete "${deleteItemConfirm.name}"? This will delete ALL data related to this item.`,
                    alerta: true,
                    botao1: {
                        funcao: () => submitDelete('wbs_item', deleteItemConfirm.id), texto: 'Confirm'
                    },
                    botao2: {
                        funcao: () => setDeleteItemConfirm(null), texto: 'Cancel'
                    },
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
    )
}

const Main = () => {
    return (
        <WbsProvider>
            <MainContent />
        </WbsProvider>
    )
}

export default Main;