import { useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import { useGrupos } from "../data/GruposContext";
import { handleReq } from "../../../../../functions/crud_s";
import { useEffect } from "react";
import usePerm from "../../../../../hooks/usePerm";
import CadastroInputs from "../forms/Inputs";

const GroupBlock = ({group, setExibirModal, setConfirmDeleteItem}) => {
    const {isEditor} = usePerm();
    const [novosDados, setNovosDados] = useState(group);
    const {token} = useAuth();
    const {setIsLoading, fetchData} = useGrupos();
    const [isUpdating, setIsUpdating] = useState(false); 

    useEffect(() => {
        setNovosDados(group)
    }, [group])

    const handleUpdateItem = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'stakeholder_group',
                route: 'update',
                token,
                data: novosDados,
                fetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setIsUpdating(false);
        setIsLoading(false);
    };

    return (
        <>
            {isUpdating ? (
                <CadastroInputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar: handleUpdateItem,
                        cancelar: () => setIsUpdating(false)
                    }}
                    setExibirModal={setExibirModal}
                />
            ) : (
                <tr>
                    <td>{group.group}</td>
                    <td>{group.involvement}</td>
                    <td>{group.influence}</td>
                    <td>{group.impact}</td>
                    <td>{group.power}</td>
                    <td>{group.interest}</td>
                    <td>{group.expectations}</td>
                    <td>{group.requisites}</td>
                    <td>{group.positive_eng}</td>
                    <td>{group.negative_eng}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(group)} disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsUpdating(true)
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default GroupBlock;