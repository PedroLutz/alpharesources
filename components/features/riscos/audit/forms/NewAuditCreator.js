import { useState } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";
import { useAudit } from "../data/AuditContext";
import Inputs from "./Inputs";

const camposVazios = {
    risk_id: '',
    response: '',
    impact: '',
    action: '',
    urgency: '',
    financial_impact: '',
    schedule_impact: '',
    impact_description: '',
    evaluation_description: ''
}

const NewAuditCreator = ({setExibirModal, seeArea}) => {
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const { setIsLoading, fetchData } = useAudit();
    const { user, token } = useAuth();

    const enviar = async () => {
        await handleReq({
            table: 'risk_audit',
            route: 'create',
            token,
            data: {
                ...novoSubmit,
                user_id: user.id
            },
            fetchData
        });
        setNovoSubmit(camposVazios);
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

export default NewAuditCreator;