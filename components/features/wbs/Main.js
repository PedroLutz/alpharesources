import { useState, useEffect } from "react";
import React from "react";
import Loading from '../../ui/Loading';
import Modal from "../../ui/Modal";
import { handleReq, handleFetch } from "../../../functions/crud_s";
import { cleanForm } from '../../../functions/general';
import styles from "../../../styles/modules/wbs.module.css"
import InputContainer from "./InputContainer";
import useAuth from "../../../hooks/useAuth";
import usePerm from "../../../hooks/usePerm";

const Main = () => {
    const { user, token} = useAuth();
    const {isEditor} = usePerm();

    const [areas, setAreas] = useState([]);
    const [items, setItems] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [exibirModal, setExibirModal] = useState(null);
    const modalLabels = {
        'inputsVazios': 'Fill out all fields before adding new data!',
        'areaDup': 'This area is already registered!',
        'itemDup': 'This item is already registered in another area!'
    };

    const camposAreaVazios = {
        id: '',
        name: '',
        color: '#FFFFFF'
    };
    const [newArea, setNewArea] = useState(camposAreaVazios);
    const [updateArea, setUpdateArea] = useState(camposAreaVazios);

    const camposItemVazios = {
        id: '',
        area_id: '',
        name: ''
    };
    const [updateItem, setUpdateItem] = useState(camposItemVazios);

    const [editId, setEditId] = useState();
    const [deleteAreaConfirm, setDeleteAreaConfirm] = useState(null);
    const [deleteItemConfirm, setDeleteItemConfirm] = useState(null);

    const fetchAreas = async () => {
        const data = await handleFetch({
            table: 'wbs_area',
            query: 'all',
            token
        })
        setAreas(data.data);
    }

    const fetchItems = async () => {
        const data = await handleFetch({
            table: 'wbs_item',
            query: 'all',
            token
        })
        setItems(data.data);
    }

    const fetchData = async () => {
        try {
            await fetchAreas();
            await fetchItems();
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    const submitNewArea = async () => {
        if (areas.some(area => area.name.toLowerCase() == newArea.name.toLowerCase())) {
            setExibirModal('areaDup');
            return false;
        }
        delete newArea.id;
        await handleReq({
            table: 'wbs_area',
            route: 'create',
            token,
            data: newArea,
            fetchData
        });
        cleanForm(newArea, setNewArea, camposAreaVazios);
        return true;
    }

    const submitNewItem = async (newItem) => {
        if (items.some(items => items.name.toLowerCase() == newItem.name.toLowerCase())) {
            setExibirModal('itemDup');
            return false;
        }
        const objSent = {
            ...newItem,
            user_id: user.id
        }
        delete objSent.id;
        await handleReq({
            table: 'wbs_item',
            route: 'create',
            token,
            data: objSent,
            fetchData
        });
        return true;
    }

    const submitUpdate = async (table) => {
        setIsLoading(true);
        await handleReq({
            table: table,
            route: 'update',
            token,
            data: table == 'wbs_area' ? updateArea : updateItem,
            fetchData
        });
        setIsLoading(false);
    }

    const submitDelete = async (table, id) => {
        setIsLoading(true);
        if (deleteAreaConfirm) setDeleteAreaConfirm(null);
        if (deleteItemConfirm) setDeleteItemConfirm(null);
        await handleReq({
            table: table,
            route: 'delete',
            token,
            data: { id },
            fetchData
        });
        setIsLoading(false);
    }

    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            <h2 className="smallTitle">Work Breakdown Structure</h2>
            <div className={styles.main_container}>
                <div className={styles.main_wrapper}>
                    <div className={styles.wbs_container}>
                        <InputContainer
                            op={'area'}
                            isNew={true}
                            obj={newArea}
                            objSetter={setNewArea}
                            functions={{
                                submit: submitNewArea
                            }}
                            setExibirModal={setExibirModal}
                            disabled={!isEditor}
                        />
                    </div>

                    {areas.map((area, index) => (
                        <div key={index} className={styles.wbs_container}>
                            {editId == area.id ? (
                                <InputContainer
                                    style={{ backgroundColor: area.color }}
                                    op={'area'}
                                    isNew={false}
                                    obj={updateArea}
                                    objSetter={setUpdateArea}
                                    functions={{
                                        submit: () => submitUpdate('wbs_area'),
                                        hide: setEditId
                                    }}
                                    setExibirModal={setExibirModal}
                                />
                            ) : (
                                <div key={area.id} className={styles.block} style={{ backgroundColor: area.color }}>
                                    <span className={styles.area_label}>
                                        {area.name}
                                    </span>
                                    <div className={styles.action_buttons}>
                                        <button onClick={() => {
                                            setEditId(area.id);
                                            setUpdateArea(area)
                                        }} disabled={!isEditor}>⚙️</button>
                                        <button onClick={() => {
                                            setDeleteAreaConfirm(area)
                                        }} disabled={!isEditor}>❌</button>
                                    </div>
                                </div>
                            )}

                            {items.filter((item => item.area_id == area.id)).map((item, index) => (
                                <React.Fragment key={index}>
                                    {editId == item.id ? (
                                        <div key={item.id} className={styles.item_outer_block}>
                                            <div className={styles.item_connective_line} />
                                            <InputContainer
                                                style={{ backgroundColor: area.color }}
                                                op={'item'}
                                                isNew={false}
                                                area_id={area.id}
                                                functions={{
                                                    submit: () => submitUpdate('wbs_item'),
                                                    hide: setEditId
                                                }}
                                                obj={updateItem}
                                                objSetter={setUpdateItem}
                                                setExibirModal={setExibirModal}
                                            />
                                        </div>
                                    ) : (
                                        <div key={item.id} className={styles.item_outer_block}>
                                            <div className={styles.item_connective_line} />
                                            <div className={styles.block} style={{ backgroundColor: area.color }}>
                                                <span className={styles.item_label}>{item.name}</span>
                                                <div className={styles.action_buttons}>
                                                    <button onClick={() => {
                                                        setEditId(item.id);
                                                        setUpdateItem(item);
                                                    }}>⚙️</button>
                                                    <button onClick={() => {
                                                        setDeleteItemConfirm(item)
                                                    }}>❌</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    }
                                </React.Fragment>
                            ))}

                            <div key={index} className={styles.item_outer_block}>
                                <InputContainer
                                    style={{ backgroundColor: area.color }}
                                    op={'item'}
                                    isNew={true}
                                    area_id={area.id}
                                    functions={{
                                        submit: submitNewItem
                                    }}
                                    disabled={!isEditor}
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