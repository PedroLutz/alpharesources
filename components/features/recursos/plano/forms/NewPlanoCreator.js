import { useState } from "react";
import CadastroInputs from "./CadastroInputs";
import useAuth from "../../../../../hooks/useAuth";
import { usePlano } from "../data/PlanoProvider";
import { handleReq } from "../../../../../functions/crud_s";

const NewPlanoCreator = ({ setExibirModal }) => {
    const {user, token} = useAuth();
    const {refetchData} = usePlano();
    const camposVazios = {
        resource_id: '',
        method_a: '',
        plan_a: '',
        details_a: '',
        value_a: '',
        expected_date: '',
        critical_date: '',
        plan_b: '',
        method_b: '',
        value_b: '',
        details_b: '',
        plan_real: '',
        date_real: '',
        value_real: ''
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);

    const enviar = async (obj) => {
        await handleReq({
            table: 'resource_acquisition_plan',
            route: 'create',
            token,
            data: {
                ...obj,
                date_real: obj.date_real !== "" ? obj.date_real : null,
                value_real: obj.value_real !== "" ? obj.value_real : null,
                user_id: user.id,
            },
            fetchData: refetchData
        });
        setNovoSubmit(camposVazios);
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

export default NewPlanoCreator;