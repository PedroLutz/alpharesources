import { useState } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import Inputs from "./Inputs";
import { useMudanca } from "../data/MudancaContext";
import useAuth from "../../../../../hooks/useAuth";

const camposVazios = {
    date: '',
    area_id: '',
    type: '',
    item: '',
    change: '',
    reasoning: '',
    impact: '',
    is_approved: '',
    status: '',
    responsible_request: '',
    responsible_approval: ''
}

const NewMudancaCreator = ({ setExibirModal }) => {
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const {fetchData, setIsLoading} = useMudanca();
    const {user, token} = useAuth();

    const enviar = async () => {
        setIsLoading(true);
        await handleReq({
            table: 'change',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                area_id: novoSubmit.area_id == -1 ? null : novoSubmit.area_id,
                user_id: user.id
            },
            fetchData
        });
        setNovoSubmit(camposVazios);
        setIsLoading(false);
    };

    return (
        <Inputs
            obj={novoSubmit}
            objSetter={setNovoSubmit}
            funcoes={{ enviar }}
            setExibirModal={setExibirModal}
        />
    )
};

export default NewMudancaCreator;