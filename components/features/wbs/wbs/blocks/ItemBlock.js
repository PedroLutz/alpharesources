import { useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import styles from "../../../../../styles/modules/wbs.module.css"
import InputContainer from "../forms/InputContainer";
import { getTextColor } from "../../../../../functions/colors";
import { handleReq } from "../../../../../functions/crud_s";
import { useWbs } from "../WbsContext";

const ItemBlock = ({ area, item, setExibirModal, setDeleteItemConfirm }) => {
    const { setIsLoading, refetchData} = useWbs();
    const { token } = useAuth();
    const { isEditor } = usePerm();

    const [isEditing, setIsEditing] = useState(false);
    const [updateItem, setUpdateItem] = useState(item);

    const submitUpdate = async () => {
        setIsLoading(true);
        await handleReq({
            table: "wbs_item",
            route: 'update',
            token,
            data: updateItem,
            fetchData: refetchData
        });
        setIsLoading(false);
        setIsEditing(false);
    }

    return (
        <>
            {isEditing ? (
                <div key={item.id} className={styles.item_outer_block}>
                    <div className={styles.item_connective_line} />
                    <InputContainer
                        style={{ backgroundColor: area.color }}
                        op={'item'}
                        isNew={false}
                        area_id={area.id}
                        functions={{
                            submit: submitUpdate,
                            hide: () => setIsEditing(false)
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
                        <span className={styles.item_label} style={{ color: getTextColor(area.color) }}>{item.name}</span>
                        <div className={styles.action_buttons}>
                            <button disabled={!isEditor} onClick={() => setIsEditing(true)}>⚙️</button>
                            <button disabled={!isEditor} onClick={() => setDeleteItemConfirm(item)}>❌</button>
                        </div>
                    </div>
                </div>
            )
            }
        </>
    )

};

export default ItemBlock;