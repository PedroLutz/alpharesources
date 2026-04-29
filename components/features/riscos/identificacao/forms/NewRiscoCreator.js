import React, { useState } from "react";
import { useIdentificacao } from "../data/IdentificacaoContext";
import { handleReq } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";
import CadastroInputs from "./Inputs";

const camposVazios = {
    item_id: '',
    owner_id: '',
    risk: '',
    classification: '',
    is_negative: '',
    effect: '',
    cause: '',
    trigger: '',
}

const NewRiscoCreator = ({ setExibirModal }) => {
    const { fetchData } = useIdentificacao();
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const { user, token } = useAuth();

    const enviar = async () => {
        await handleReq({
            table: 'risk',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                item_id: novoSubmit.item_id != -1 ? novoSubmit.item_id : null,
                owner_id: novoSubmit.owner_id != -1 ? novoSubmit.owner_id : null,
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

export default NewRiscoCreator;