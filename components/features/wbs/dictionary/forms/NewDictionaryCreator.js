import { useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import CadastroInputs from "./InputsContainer"
import { handleReq } from "../../../../../functions/crud_s";
import { useDictionary } from "../data/DictionaryContext";

const NewDictionaryCreator = ({setExibirModal}) => {
    const {refetchData} = useDictionary();
    const {user, token} = useAuth();
    const camposVazios = {
        item_id: '',
        description: '',
        purpose: '',
        criteria: '',
        inspection: '',
        timing: '',
        responsible: '',
        approval_responsible: '',
        premises: '',
        restrictions: '',
        resources: '',
        user_id: user?.id
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);

    const enviar = async () => {
        const objSent = {
            ...novoSubmit,
            user_id: user?.id
        }
        await handleReq({
            table: 'wbs_dictionary',
            route: 'create',
            token,
            data: objSent,
            fetchData: refetchData
        });
        setNovoSubmit(camposVazios);
    };


    return (
        <CadastroInputs
            tipo="submit"
            obj={novoSubmit}
            objSetter={setNovoSubmit}
            funcoes={{ enviar }}
            setExibirModal={setExibirModal}
        />
    )
}

export default NewDictionaryCreator;