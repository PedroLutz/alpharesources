import { useState } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import { useLicao } from "../data/LicaoContext";
import useAuth from "../../../../../hooks/useAuth";
import Inputs from "./Inputs";

const camposVazios = {
    date: '',
    type: '',
    situation: '',
    learning: '',
    action: ''
}

const NewLicaoCreator = ({setExibirModal}) => {
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const { setIsLoading, fetchData } = useLicao();
    const { user, token } = useAuth();

    //funcao que envia os dados de novoSubmit para cadastro
    const enviar = async () => {
        setIsLoading(true);
        await handleReq({
            table: 'lesson',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
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
}

export default NewLicaoCreator;