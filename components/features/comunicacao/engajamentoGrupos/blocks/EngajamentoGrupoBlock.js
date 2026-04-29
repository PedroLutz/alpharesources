import { useState } from "react";
import { useEngajamentoGrupos } from "../data/EngajamentoGruposContext";
import { useEffect } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import CadastroInputs from "../forms/Inputs";

function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const generateMapping = (engajamento) => {
    if (!engajamento.control || !engajamento.impact) {
        return "-";
    }
    const poder = ((engajamento.control + engajamento.influence + engajamento.dependency) / 3).toFixed(2);
    const interesse = ((engajamento.impact + engajamento.engagement + engajamento.alignment) / 3).toFixed(2);

    if (poder < 2.5) {
        if (interesse < 2.5) {
            return "Monitor";
        } else {
            return "Keep informed"
        }
    } else {
        if (interesse < 2.5) {
            return "Keep satisfied";
        } else {
            return "Close Management"
        }
    }
}

const EngajamentoGrupoBlock = ({ engajamento, setExibirModal }) => {
    const { setIsLoading, fetchData } = useEngajamentoGrupos();
    const [novosDados, setNovosDados] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const { isEditor } = usePerm();
    const { token } = useAuth();

    useEffect(() => {
        setNovosDados({
            id: engajamento.id,
            group_id: engajamento?.stakeholder_group?.id,
            dependency: engajamento.dependency ?? "",
            influence: engajamento.influence ?? "",
            control: engajamento.control ?? "",
            impact: engajamento.impact ?? "",
            engagement: engajamento.engagement ?? "",
            alignment: engajamento.alignment ?? "",
            eng_level: engajamento.eng_level ?? "",
            eng_target_level: engajamento.eng_target_level ?? ""
        })
    }, [])

    const handleUpdateItem = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'stakeholder_group_engagement',
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

    let powerAvg;
    if (engajamento?.control == null || engajamento?.influence == null || engajamento?.dependency == null) {
        powerAvg = "-";
    } else {
        powerAvg = ((
            (engajamento?.control ?? 0) +
            (engajamento?.influence ?? 0) +
            (engajamento?.dependency ?? 0)
        ) / 3).toFixed(2);
    }

    let influenceAvg;
    if (engajamento?.impact == null || engajamento?.engagement == null || engajamento?.alignment == null) {
        influenceAvg = "-";
    } else {
        influenceAvg = ((
            (engajamento?.impact ?? 0) +
            (engajamento?.engagement ?? 0) +
            (engajamento?.alignment ?? 0)
        ) / 3).toFixed(2);
    }

    return (
        <tr>
            <td>{engajamento.stakeholder_group.group}</td>
            {isUpdating ? (
                <CadastroInputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar: handleUpdateItem,
                        cancelar: () => { setIsUpdating(false) }
                    }}
                    setExibirModal={setExibirModal}
                />
            ) : (
                <>
                    <td>{engajamento.dependency}</td>
                    <td>{engajamento.influence}</td>
                    <td>{engajamento.control}</td>
                    <td>{powerAvg}</td>
                    <td>{engajamento.impact}</td>
                    <td>{engajamento.engagement}</td>
                    <td>{engajamento.alignment}</td>
                    <td>{influenceAvg}</td>
                    <td>{generateMapping(engajamento)}</td>
                    <td>{capitalizeFirstLetter(engajamento.eng_level)}</td>
                    <td>{capitalizeFirstLetter(engajamento.eng_target_level)}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => {
                            setIsUpdating(true)
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </>
            )}
        </tr>
    )
};

export default EngajamentoGrupoBlock;