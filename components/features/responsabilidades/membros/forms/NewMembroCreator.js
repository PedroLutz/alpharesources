import CadastroInputs from "./CadastroInputs";
import { useState } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";
import { useMembro } from "../data/MembroContext";

const NewMembroCreator = ({ setExibirModal }) => {
    const {setIsLoading, fetchData} = useMembro();
    const camposVazios = {
        name: '',
        softskills: '',
        hardskills: '',
    };
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const {user, token} = useAuth();

    const enviar = async () => {
        setIsLoading(true);
        await handleReq({
            table: 'member',
            route: 'create',
            token,
            data: { ...novoSubmit, user_id: user.id },
            fetchData
        });
        setNovoSubmit(camposVazios);
        setIsLoading(false);
    };

    return (
        <CadastroInputs
            tipo='cadastro'
            obj={novoSubmit}
            objSetter={setNovoSubmit}
            funcoes={{
                enviar
            }}
            setExibirModal={setExibirModal}
        />
    )
};

export default NewMembroCreator;