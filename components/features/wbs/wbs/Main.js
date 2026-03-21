import { useState } from "react";
import Loading from '../../../ui/Loading';
import Modal from "../../../ui/Modal";
import { handleReq } from "../../../../functions/crud_s";
import styles from "../../../../styles/modules/wbs.module.css"
import useAuth from "../../../../hooks/useAuth";
import HelpBubble from "../../../ui/HelpBubble/wbs/wbs";
import { useWbsData } from "./useWbsData";
import NewAreaCreator from "./forms/NewAreaCreator";
import AreaBlock from "./blocks/AreaBlock";
import NewItemCreator from "./forms/NewItemCreator";
import ItemBlock from "./blocks/ItemBlock";

const Main = () => {
    const { token } = useAuth();

    const {
        areas,
        items,
        isLoading,
        setIsLoading,
        refetchData
    } = useWbsData();

    const [exibirModal, setExibirModal] = useState(null);
    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'areaDup': 'This area is already registered!',
        'itemDup': 'This item is already registered in another area!'
    };

    const [deleteAreaConfirm, setDeleteAreaConfirm] = useState(null);
    const [deleteItemConfirm, setDeleteItemConfirm] = useState(null);

    const [showHelp, setShowHelp] = useState(false);

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
                        areas={areas}
                        refetchData={refetchData}
                        setExibirModal={setExibirModal}
                    />

                    {areas.map((area, index) => (
                        <div key={index} className={styles.wbs_container}>
                            <AreaBlock
                                area={area}
                                refetchData={refetchData}
                                setExibirModal={setExibirModal}
                                setIsLoading={setIsLoading}
                                setDeleteAreaConfirm={setDeleteAreaConfirm}
                            />

                            {items.filter((item => item.area_id == area.id)).map((item, index) => (
                                <ItemBlock
                                    key={item.id}
                                    area={area}
                                    item={item}
                                    setIsLoading={setIsLoading}
                                    setExibirModal={setExibirModal}
                                    refetchData={refetchData}
                                    setDeleteItemConfirm={setDeleteItemConfirm}
                                />
                            ))}

                            <div key={index} className={styles.item_outer_block}>
                                <NewItemCreator
                                    items={items}
                                    area={area}
                                    refetchData={refetchData}
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

export default Main;