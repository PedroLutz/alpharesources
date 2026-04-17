import { useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { handleReq } from "../../../../../functions/crud_s";
import CadastroInputs from "./Inputs";
import { useGrupos } from "../data/GruposContext";

const camposVazios = {
    group: '',
    involvement: '',
    influence: '',
    impact: '',
    power: '',
    interest: '',
    expectations: '',
    requisites: '',
    positive_eng: '',
    negative_eng: ''
}

const NewGrupoCreator = ({setExibirModal}) => {
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const { user, token } = useAuth();
    const { setIsLoading, fetchData } = useGrupos();

    const enviar = async () => {
        setIsLoading(true);
        const data = await handleReq({
            table: 'stakeholder_group',
            route: 'createReturn',
            token,
            data: {
                ...novoSubmit,
                user_id: user?.id
            },
            fetchData
        });

        const objEngajamento = {
            group_id: data.data.resultado[0].id,
            eng_level: null,
            eng_target_level: null
        }

        await handleReq({
            table: 'stakeholder_group_engagement',
            route: 'create',
            token,
            data: {
                ...objEngajamento,
                user_id: user?.id
            },
        });
        setNovoSubmit(camposVazios);
        setIsLoading(false);
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

export default NewGrupoCreator;