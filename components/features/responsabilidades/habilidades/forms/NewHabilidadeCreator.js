import { useState } from "react";
import Inputs from "./Inputs";
import { handleReq } from "../../../../../functions/crud_s";
import { useHabilidade } from "../data/HabilidadeContext";
import useAuth from "../../../../../hooks/useAuth";

const camposVazios = {
    role_id: '',
    skill: '',
    cur_level: '',
    min_level: '',
    action: '',
}

const NewHabilidadeCreator = ({ setExibirModal }) => {
    const {setIsLoading, fetchData} = useHabilidade();
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const {user, token} = useAuth();

    const enviar = async () => {
        setIsLoading(true);
        await handleReq({
            table: 'skill',
            route: 'create',
            token,
            data: { ...novoSubmit, user_id: user?.id },
            fetchData
        });
        setNovoSubmit(camposVazios);
        setIsLoading(false);
    };

    return (
        <tr>
            <Inputs
                obj={novoSubmit}
                objSetter={setNovoSubmit}
                funcoes={{
                    enviar
                }}
                setExibirModal={setExibirModal}
            />
        </tr>
    )
};

export default NewHabilidadeCreator;