import CadastroInputs from "./CadastroInputs";
import { useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { useRecurso } from "../RecursoContext";
import { handleReq } from "../../../../../functions/crud_s";

const NewRecursoCreator = ({setExibirModal}) => {
    const {refetchData} = useRecurso();
    const {user, token} = useAuth();
    const camposVazios = {
        item_id: "",
        resource: "",
        usage: "",
        type: "",
        is_essential: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);

    const enviar = async () => {
        await handleReq({
            table: 'resource',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                user_id: user.id,
                item_id: novoSubmit.item_id != -1 ? novoSubmit.item_id : null
            },
            fetchData: refetchData
        });
        setNovoSubmit(camposVazios);
    };

    return (
        <CadastroInputs
            obj={novoSubmit}
            objSetter={setNovoSubmit}
            funcoes={{
                enviar
            }}
            setExibirModal={setExibirModal}
        />
    )
};

export default NewRecursoCreator;