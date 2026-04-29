import { useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { useInformacao } from "../data/InformacaoContext";
import { handleReq } from "../../../../../functions/crud_s";
import CadastroInputs from "./Inputs";

const camposVazios = {
    stakeholder_id: "",
    information: "",
    method: "",
    frequency: "",
    channel: "",
    responsible_id: "",
    register: "",
    feedback: "",
    action: ""
}

const NewInformacaoCreator = ({setExibirModal}) => {
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const {user, token} = useAuth();
    const {fetchData} = useInformacao();

    const enviar = async () => {
        await handleReq({
            table: 'information',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                responsible_id: novoSubmit.responsible_id != -1 ? novoSubmit.responsible_id : null,
                user_id: user.id
            },
            fetchData
        });
        setNovoSubmit(camposVazios);
    };

    return (
        <CadastroInputs
            obj={novoSubmit}
            objSetter={setNovoSubmit}
            funcoes={{ enviar }}
            setExibirModal={setExibirModal}
        />
    )
};

export default NewInformacaoCreator;