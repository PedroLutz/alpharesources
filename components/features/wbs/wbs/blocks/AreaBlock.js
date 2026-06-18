import { useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import styles from "../../../../../styles/modules/wbs.module.css"
import InputContainer from "../forms/InputContainer";
import { getTextColor } from "../../../../../functions/colors";
import { handleReq } from "../../../../../functions/crud_s";
import { useWbs } from "../data/WbsContext";

const AreaBlock = ({ area, setExibirModal, setDeleteAreaConfirm }) => {
    const {setIsLoading, refetchData} = useWbs();
    const { token } = useAuth();
    const { isEditor } = usePerm();

    const [isEditing, setIsEditing] = useState(false);
    const [updateArea, setUpdateArea] = useState(area);

    const submitUpdate = async () => {
        setIsLoading(true);
        await handleReq({
            table: "wbs_area",
            route: 'update',
            token,
            data: updateArea,
            fetchData: refetchData
        });
        setIsLoading(false);
        setIsEditing(false);
    }

    return (
        <>
            {isEditing ? (
                <InputContainer
                    style={{ backgroundColor: area.color }}
                    op={'area'}
                    isNew={false}
                    obj={updateArea}
                    objSetter={setUpdateArea}
                    functions={{
                        submit: submitUpdate,
                        hide: () => setIsEditing(false)
                    }}
                    setExibirModal={setExibirModal}
                />
            ) : (
                <div key={area.id} className={styles.block} style={{ backgroundColor: area.color }}>
                    <span className={styles.area_label} style={{ color: getTextColor(area.color) }}>
                        {area.name}
                    </span>
                    <div className={styles.action_buttons}>
                        <button onClick={() => setIsEditing(true)} disabled={!isEditor}>⚙️</button>
                        <button onClick={() => setDeleteAreaConfirm(area)} disabled={!isEditor}>❌</button>
                    </div>
                </div>
            )}
        </>
    )

};

export default AreaBlock;