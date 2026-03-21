import { useState } from "react";
import InputContainer from "./InputContainer";
import useAuth from "../../../../../hooks/useAuth";
import styles from "../../../../../styles/modules/wbs.module.css"
import { handleReq } from "../../../../../functions/crud_s";

const NewAreaCreator = ({ areas, refetchData, setExibirModal }) => {
    const { token } = useAuth();
    const [newArea, setNewArea] = useState({ name: '', color: '#FFFFFF' });

    const submitNewArea = async () => {
        if (areas.some(area => area.name.toLowerCase() == newArea.name.toLowerCase())) {
            setExibirModal('areaDup');
            return false;
        }
        await handleReq({
            table: 'wbs_area',
            route: 'create',
            token,
            data: newArea,
            fetchData: refetchData
        });
        setNewArea({ name: '', color: '#FFFFFF' });
        return true;
    }

    return (
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
            />
        </div>
    )
}

export default NewAreaCreator;