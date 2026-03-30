import CadastroInputs from "./Inputs";
import { useState } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";
import { useCostBenefit } from "../CbDataContext";

const NewCBCreator = ({setExibirModal}) => {
    const {user, token} = useAuth();
    const camposVazios = {
        identification: "",
        description: "",
        cost: "",
        cost_ranking: "",
        impact: "",
        urgency: "",
        area_impact: "",
        explanation: "",
        edge: ""
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const {refetchData, setIsLoading} = useCostBenefit();

    const enviar = async () => {
        setIsLoading(true);
        await handleReq({
            table: 'cost_benefit',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                user_id: user.id,
            },
            fetchData: refetchData
        });
        setNovoSubmit(camposVazios);
        setIsLoading(false);
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

export default NewCBCreator;