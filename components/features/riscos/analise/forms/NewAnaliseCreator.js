import { useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import CadastroInputs from "./Inputs";
import { handleReq } from "../../../../../functions/crud_s";
import { useAnalise } from "../data/AnaliseContext";

const camposVazios = {
    risk_id: "",
    occurrence: "",
    action: "",
    urgency: "",
    impact: "",
    financial_impact: "",
    schedule_impact: ""
}

const NewAnaliseCreator = ({setExibirModal, seeArea}) => {
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const { user, token } = useAuth();
    const { setIsLoading, fetchData } = useAnalise();

    const enviar = async () => {
        setIsLoading(true);
        await handleReq({
            table: 'risk_analysis',
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
        <CadastroInputs
            obj={novoSubmit}
            objSetter={setNovoSubmit}
            funcoes={{ enviar }}
            setExibirModal={setExibirModal}
            seeArea={seeArea}
        />
    )
};

export default NewAnaliseCreator;