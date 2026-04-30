import { useState } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";
import { useImpacto } from "../data/ImpactoContext";
import Inputs from "./Inputs";

const camposVazios = {
    risk_id: '',
    impact_area: '',
    score: '',
    description: ''
}

const NewImpactoCreator = ({ setExibirModal, seeArea }) => {
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const { fetchData, setIsLoading } = useImpacto();
    const { user, token } = useAuth();

    const enviar = async () => {
        setIsLoading(true);
        await handleReq({
            table: 'risk_impact',
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

export default NewImpactoCreator;