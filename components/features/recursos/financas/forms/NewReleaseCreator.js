import { useState } from "react";
import InputContainer from "./CadastroInputs";
import { useFinances } from "../FinancesContext";
import { handleReq } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";

const NewReleaseCreator = ({setExibirModal}) => {
    const {
        refetchData
    } = useFinances();

    const {token, user} = useAuth();

    const camposVazios = {
        type: '',
        description: '',
        value: '',
        date: '',
        area_id: '',
        origin: '',
        destination: '',
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);

    const enviar = async () => {
        const isExpense = novoSubmit.type === 'cost';
        const value = isExpense ? -parseFloat(novoSubmit.value) : parseFloat(novoSubmit.value);
        const updatedNovoSubmit = {
            ...novoSubmit,
            area_id: novoSubmit.area_id != -1 ? novoSubmit.area_id : null,
            value: value,
            user_id: user.id
        };
        await handleReq({
            table: 'financial_release',
            route: 'create',
            token,
            data: updatedNovoSubmit,
            fetchData: refetchData
        });
        setNovoSubmit(camposVazios);
    };

    return (
        <InputContainer
            obj={novoSubmit}
            objSetter={setNovoSubmit}
            funcoes={{
                enviar
            }}
            setExibirModal={setExibirModal}
            tipo='cadastro'
        />
    )
};

export default NewReleaseCreator;