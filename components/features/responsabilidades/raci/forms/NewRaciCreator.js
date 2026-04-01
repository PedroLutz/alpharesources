import { useState, useEffect } from "react";
import CadastroTabela from "./CadastroInputs";
import { useRaci } from "../data/RaciContext";
import { handleReq } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";

const NewRaciCreator = ({ setExibirModal }) => {
    const { fetchData, setIsLoading, inputToMember, memberInputData } = useRaci();
    const camposVazios = {
        item_id: "",
    }
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const {user, token} = useAuth();

    const isValid = () => {
        if (!Object.values(novoSubmit).some(v => v == "accountable")) {
            setExibirModal('semAprovador');
            return false;
        }
        if (!Object.values(novoSubmit).some(v => v == "responsible")) {
            setExibirModal('semResponsavel');
            return false;
        }
        if (Object.values(novoSubmit).reduce((acc, cur) => {
            if (cur == 'accountable') acc++;
            return acc;
        }, 0) > 1) {
            setExibirModal('muitoAprovador');
            return false;
        }
        return true;
    }

    useEffect(() => {
        setNovoSubmit({ ...memberInputData, ...camposVazios });
    }, [memberInputData])

    const enviar = async () => {
        setIsLoading(true);
        if (!isValid()) {
            setIsLoading(false);
            return false;
        }
        
        try {
            for (const key in novoSubmit) {
                if (key != 'item_id') {
                    const responsibility = novoSubmit[key];
                    const member_id = inputToMember[key];
                    await handleReq({
                        table: 'raci_item',
                        route: 'create',
                        token,
                        data: { item_id: novoSubmit.item_id, member_id, responsibility, user_id: user.id },
                    });
                }
            }
        } finally {
            setNovoSubmit({ ...memberInputData, ...camposVazios });
            await fetchData();
            setIsLoading(false);
            return true;
        }
    };

    return (
        <tr className="linha-cadastro">
            <CadastroTabela
                obj={novoSubmit}
                objSetter={setNovoSubmit}
                funcoes={{
                    enviar
                }}
                setExibirModal={setExibirModal}
                tipo='cadastro' />
        </tr>
    )
}

export default NewRaciCreator;