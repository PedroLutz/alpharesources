import CadastroInputs from "./Inputs";
import { useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { useFuncoes } from "../data/FuncoesContext";

const camposVazios = {
    role: '',
    description: '',
    skills: '',
    member_id: '',
    areas: []
}

const NewFuncaoCreator = ({ setExibirModal }) => {
    const { setIsLoading, fetchData, funcoes } = useFuncoes();
    const [novoSubmit, setNovoSubmit] = useState(camposVazios);
    const { user, token } = useAuth();

    const enviar = async () => {
        setIsLoading(true);
        const success = await handleReq({
            table: 'role',
            route: 'createReturn',
            token,
            data: {
                role: novoSubmit.role,
                description: novoSubmit.description,
                skills: novoSubmit.skills,
                member_id: novoSubmit.member_id,
                user_id: user?.id
            },
        });

        for (let area in novoSubmit.areas) {
            await handleReq({
                table: 'rel_area_role',
                route: 'create',
                token,
                data: {
                    role_id: success?.data?.resultado[0].id,
                    area_id: novoSubmit.areas[area],
                    user_id
                },
            });
        }
        setIsLoading(false);
        await fetchData();
        setNovoSubmit(camposVazios);
    };

    const isFuncaoCadastrada = (funcao) => {
        return funcoes.some((f) => f.role.trim().toLowerCase() == funcao.trim().toLowerCase());
    }

    return (
        <CadastroInputs
            obj={novoSubmit}
            objSetter={setNovoSubmit}
            funcoes={{
                isFuncaoCadastrada,
                enviar
            }}
            setExibirModal={setExibirModal}
        />
    )
};

export default NewFuncaoCreator;