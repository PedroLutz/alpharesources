import { useState } from "react"
import { handleReq } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";
import { useStakeholder } from "../data/StakeholderContext";
import CadastroInputs from "./Inputs";

const camposVazios = {
    group_id: "",
    stakeholder: "",
    influence: "",
    power: "",
    interest: "",
    expectations: "",
    requisites: "",
    positive_eng: "",
    negative_eng: ""
}

const NewStakeholderCreator = ({setExibirModal}) => {
    const { fetchData } = useStakeholder();
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const { token, user } = useAuth();

    const enviar = async () => {
        const data = await handleReq({
            table: 'stakeholder',
            route: 'createReturn',
            token,
            data: {
                ...novoSubmit,
                user_id: user.id
            },
            fetchData
        });

        const objEngajamento = {
            stakeholder_id: data.data.resultado[0].id,
            eng_level: null,
            eng_target_level: null
        }

        await handleReq({
            table: 'engagement',
            route: 'create',
            token,
            data: {
                ...objEngajamento,
                user_id: user.id
            },
        });
        setNovoSubmit(camposVazios);
    };

    return (
        <CadastroInputs
            tipo="cadastro"
            obj={novoSubmit}
            objSetter={setNovoSubmit}
            funcoes={{ enviar }}
            setExibirModal={setExibirModal}
        />
    )
}

export default NewStakeholderCreator;