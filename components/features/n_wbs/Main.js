import { useState, useEffect } from "react";
import React from "react";
import Loading from '../../ui/Loading';
import { handleReq, handleFetch } from "../../../functions/crud_s";
import { cleanForm } from '../../../functions/general';
import styles from "../../../styles/modules/wbs_n.module.css"
import InputContainer from "./InputContainer";
import useAuth from "../../../hooks/useAuth";

const Main = () => {
    const [view, setView] = useState(false);
    const { user, token } = useAuth();
    const [areas, setAreas] = useState([]);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAreas = async () => {
        const data = await handleFetch({
            route: 'get',
            table: 'wbs_area',
            token
        })
        setAreas(data.data);
    }

    const fetchItems = async () => {
        const data = await handleFetch({
            route: 'get',
            table: 'wbs_item',
            token
        })
        setItems(data.data);
    }

    const fetchData = async () => {
        try{
            await fetchAreas();
            await fetchItems();
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    const camposAreaVazios = {
        id: '',
        name: '',
        color: ''
    };
    const [newArea, setNewArea] = useState(camposAreaVazios);
    const [updateArea, setUpdateArea] = useState(camposAreaVazios);

    const camposItemVazios = {
        id: '',
        area_id: '',
        name: ''
    };
    const [newItem, setNewItem] = useState(camposItemVazios);
    const [updateItem, setUpdateItem] = useState(camposItemVazios);

    const submitNewArea = async () => {
        const objSent = {
            user_id: user.id,
            name: newArea.name,
            color: newArea.color
        }
        await handleReq({
            table: 'wbs_area',
            route: 'create',
            token,
            data: objSent,
            fetchData
        });
        cleanForm(newArea, setNewArea, camposAreaVazios);
    }

    const submitNewItem = async () => {
        delete newItem.id;
        const sentObj = {
            ...newItem,
            user_id: user.id
        }
        await handleReq({
            table: 'wbs_item',
            route: 'create',
            token,
            data: sentObj,
            fetchData
        });
        cleanForm(newItem, setNewItem, camposItemVazios);
    }

    return (
        <div className="centered-container">
            {isLoading && <Loading/>}
            <div className={styles.main_container}>

                <div className={styles.wbs_container}>
                    <InputContainer
                        op={'area'}
                        isNew={true}
                        obj={newArea}
                        objSetter={setNewArea}
                        functions={{
                            submit: submitNewArea
                        }}
                    />
                </div>

                {areas.map((area, index) => (
                    <div key={index} className={styles.wbs_container}>
                        {view ? (
                            <InputContainer
                                op={'area'}
                                isNew={false}
                                obj={updateArea}
                                objSetter={setUpdateArea}
                                functions={{
                                    cancel: () => setView(false)
                                }}
                            />
                        ) : (
                            <div className={styles.block} style={{ backgroundColor: area.color }}>
                                <span className={styles.area_label}>
                                    {area.name}
                                </span>
                                <div className={styles.action_buttons}>
                                    <button onClick={() => setView(true)}>⚙️</button>
                                    <button>❌</button>
                                </div>
                            </div>
                        )}

                        {items.filter((item => item.area_id == area.id)).map((item, index) => (
                            <React.Fragment>
                                {
                                    view ? (
                                        <div key={index} className={styles.item_outer_block}>
                                            <div className={styles.item_connective_line} />
                                            <InputContainer
                                                op={'item'}
                                                isNew={false}
                                                area_id={area.id}
                                                functions={{
                                                    cancel: () => setView(false)
                                                }}
                                                obj={updateItem}
                                                objSetter={setUpdateItem}
                                            />
                                        </div>
                                    ) : (
                                        <div key={index} className={styles.item_outer_block}>
                                            <div className={styles.item_connective_line} />
                                            <div className={styles.block}>
                                                <span className={styles.item_label}>{item.name}</span>
                                                <div className={styles.action_buttons}>
                                                    <button onClick={() => setView(true)}>⚙️</button>
                                                    <button>❌</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </React.Fragment>
                        ))}



                        <div className={styles.item_outer_block}>
                            <InputContainer
                                op={'item'}
                                isNew={true}
                                obj={newItem}
                                area_id={area.id}
                                objSetter={setNewItem}
                                functions={{
                                    submit: submitNewItem
                                }}
                            />
                        </div>
                    </div>))}
            </div>
        </div>
    )
}

export default Main;