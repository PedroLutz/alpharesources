import { useFuncoes } from "../data/FuncoesContext";
import CadastroInputs from "../forms/Inputs";
import { useState, useEffect } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";

const FuncoesBlock = ({ funcao, setExibirModal, setConfirmDeleteItem}) => {
    const { token, user } = useAuth();
    const {isEditor} = usePerm();
    const { setIsLoading, fetchData } = useFuncoes();
    const [novosDados, setNovosDados] = useState({});
    const [velhosDados, setVelhosDados] = useState({});
    const [isBeingUpdated, setIsBeingUpdated] = useState(false);

    useEffect(() => {
        setVelhosDados(funcao);
        const { wbs_area, member, ...obj } = funcao;
        obj.areas = [];
        obj.member_id = funcao?.member?.id;
        funcao?.wbs_area?.forEach(a => {
            obj.areas.push(a.id);
        })
        setNovosDados(obj);
    }, [funcao]);

    const deleteRemovedAreas = async () => {
        for (const area of velhosDados?.wbs_area) {
            if (!novosDados?.areas?.some(a => a == area.id)) {
                await handleReq({
                    table: "rel_area_role",
                    route: 'delete',
                    token,
                    data: { role_id: velhosDados.id, area_id: area.id }
                })
            }
        }
    }

    const submitNewAreas = async () => {
        for (const area of novosDados?.areas) {
            if (!velhosDados?.wbs_area?.some(a => a.id == area)) {
                await handleReq({
                    table: "rel_area_role",
                    route: 'create',
                    token,
                    data: { role_id: velhosDados.id, area_id: area, user_id: user?.id }
                })
            }
        }
    }

    const enviar = async () => {
        setIsLoading(true);
        await Promise.all([
            deleteRemovedAreas(),
            submitNewAreas(),
            handleReq({
                table: 'role',
                route: 'update',
                token,
                data: {
                    id: funcao.id,
                    role: novosDados.role,
                    description: novosDados.description,
                    skills: novosDados.skills,
                    member_id: novosDados.member_id,
                },
            })
        ])
        setIsLoading(false);
        await fetchData();
        setIsBeingUpdated(false);
    };

    return (
        <>
            {isBeingUpdated ? (
                <CadastroInputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar,
                        cancelar: () => setIsBeingUpdated(false)
                    }}
                    setExibirModal={setExibirModal}
                />
            ) : (
                <tr>
                    <td name="role">{funcao.role}</td>
                    <td name="description">{funcao.description}</td>
                    <td name="skills">{funcao.skills}</td>
                    <td name="member_id">{funcao.member.name}</td>
                    <td>{funcao.wbs_area.map(a => a.name).join(", ")}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(funcao)} disabled={!isEditor}>❌</button>
                        <button onClick={() => { setIsBeingUpdated(true) }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default FuncoesBlock;