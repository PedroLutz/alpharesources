import { useState } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import { useResposta } from "../data/RespostaContext";
import Inputs from "./Inputs";
import useAuth from "../../../../../hooks/useAuth";

const camposVazios = {
    risk_id: "",
    strategy: "",
    details: ""
}

const NewRespostaCreator = ({setExibirModal, seeArea}) => {
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const { setIsLoading, fetchData } = useResposta();
    const {user, token} = useAuth();

    const enviar = async () => {
        setIsLoading(true);
        await handleReq({
            table: 'risk_response',
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
            seeArea={seeArea}
        />
    )
};

export default NewRespostaCreator;