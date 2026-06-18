import { useState } from "react";
import InputContainer from "./InputContainer";
import useAuth from "../../../../../hooks/useAuth";
import { handleReq } from "../../../../../functions/crud_s";
import { useWbs } from "../data/WbsContext";

const NewItemCreator = ({ area, setExibirModal }) => {
    const {items, refetchData} = useWbs();
    const { user, token } = useAuth();
    const [newItem, setNewItem] = useState({ area_id: area.id, name: '' });

    const submitNewItem = async () => {
        if (items.some(items => items.name.toLowerCase() == newItem.name.toLowerCase())) {
            setExibirModal('itemDup');
            return false;
        }
        const objSent = {
            ...newItem,
            user_id: user.id
        }
        await handleReq({
            table: 'wbs_item',
            route: 'create',
            token,
            data: objSent,
            fetchData: refetchData
        });
        setNewItem({ area_id: area.id, name: '' });
        return true;
    }

    return (
        <InputContainer
            style={{ backgroundColor: area.color }}
            op={'item'}
            isNew={true}
            obj={newItem}
            objSetter={setNewItem}
            functions={{
                submit: submitNewItem
            }}
            setExibirModal={setExibirModal}
        />

    )
}

export default NewItemCreator;