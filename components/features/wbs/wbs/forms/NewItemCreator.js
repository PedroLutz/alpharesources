import { useState } from "react";
import InputContainer from "./InputContainer";
import useAuth from "../../../../../hooks/useAuth";
import { handleReq } from "../../../../../functions/crud_s";
import { useWbs } from "../WbsContext";

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
        const res = await handleReq({
            table: 'wbs_item',
            route: 'createReturn',
            token,
            data: objSent,
            fetchData: refetchData
        });

        const resGantt = await handleReq({
            table: 'gantt',
            route: 'createReturn',
            token,
            data: {
                item_id: res.data.resultado[0].id,
                user_id: user.id
            },
        })

        const ganttData = {
            gantt_id: resGantt.data.resultado[0].id,
            status: "start",
            start: null,
            end: null,
            user_id: user.id
        }

        await Promise.all([
            handleReq({
                table: "gantt_data",
                route: "create",
                token,
                data: {...ganttData, is_plan: true}
            }),
            handleReq({
                table: "gantt_data",
                route: "create",
                token,
                data: {...ganttData, is_plan: false}
            })
        ])

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