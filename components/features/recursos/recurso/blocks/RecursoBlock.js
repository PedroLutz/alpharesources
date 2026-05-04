import CadastroInputs from "../forms/CadastroInputs";
import { useState } from "react";
import { useRecurso } from "../RecursoContext";
import { getTextColor } from "../../../../../functions/colors";
import { useEffect } from "react";
import usePerm from "../../../../../hooks/usePerm";
import useAuth from "../../../../../hooks/useAuth";
import { handleReq } from "../../../../../functions/crud_s";
import { calculateRowSpan } from "../../../../../functions/general";

const labelsTypes = {
    physical: "Physical",
    financial: 'Financial',
    human: "Human"
}

const RecursoBlock = ({ recurso, index, setExibirModal, updatingLine, setUpdatingLine, setConfirmDeleteItem }) => {
    const { recursos, datasPlanos, setIsLoading, refetchData } = useRecurso();
    const camposVazios = {
        id: recurso.id,
        resource: recurso.resource,
        is_essential: recurso.is_essential,
        type: recurso.type,
        item_id: recurso.wbs_item?.id,
        usage: recurso.usage
    }
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [isBeingEdited, setIsBeingEdited] = useState(false)
    const { isEditor } = usePerm();
    const { token } = useAuth();

    useEffect(() => {
        setNovosDados(camposVazios);
    }, [])

    const enviar = async () => {
        setIsLoading(true);
        const { wbs_item, ...dadosUsados } = novosDados;
        try {
            await handleReq({
                table: 'resource',
                route: 'update',
                token,
                data: { ...dadosUsados, item_id: dadosUsados.item_id != -1 ? dadosUsados.item_id : null },
                fetchData: refetchData
            });
        } catch (error) {
            throw new Error("Update failed:", error);
        }
        setIsLoading(false);
        setUpdatingLine(false);
        setIsBeingEdited(false);
    };

    const backgroundColor = recurso?.wbs_item?.wbs_area?.color;

    const isEditingThisArea = updatingLine && updatingLine[0] === recurso.wbs_item?.wbs_area.id;

    const prevAreaName = recursos[index - 1]?.wbs_item?.wbs_area.name;
    const curAreaName = recurso.wbs_item?.wbs_area.name;

    const isEditingThisItem = updatingLine && updatingLine[1] == recurso.wbs_item?.id;

    const prevItemName = recursos[index - 1]?.wbs_item?.name;
    const curItemName = recurso.wbs_item?.name;

    const usageDate = datasPlanos?.get(recurso?.wbs_item?.id) || "-";

    return (
        <>
            {isBeingEdited ? (
                <CadastroInputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar,
                        cancelar: () => { setUpdatingLine(null), setIsBeingEdited(false) }
                    }}
                    setExibirModal={setExibirModal}
                    backgroundColor={backgroundColor}
                />
            ) : (
                <tr style={{ backgroundColor, color: getTextColor(backgroundColor ?? "#ffffff") }}>
                    {!isEditingThisArea ? (
                        <>
                            {index === 0 || prevAreaName !== curAreaName ? (
                                <td rowSpan={calculateRowSpan(recursos, curAreaName, index, 'wbs_item.wbs_area.name')}
                                >{curAreaName || "Others"}</td>
                            ) : null}
                        </>
                    ) : (
                        <td>{curAreaName || "Others"}</td>
                    )}
                    {!isEditingThisItem ? (
                        <>
                            {index === 0 || prevItemName !== curItemName ? (
                                <td rowSpan={calculateRowSpan(recursos, curItemName, index, 'wbs_item.name')}
                                >{curItemName || "Others"}</td>
                            ) : null}
                        </>
                    ) : (
                        <td>{curItemName || "Others"}</td>
                    )}
                    <td>{recurso.resource}</td>
                    <td>{recurso.usage}</td>
                    <td>{labelsTypes[recurso.type]}</td>
                    <td>{usageDate}</td>
                    <td>{recurso.is_essential ? 'Yes' : 'No'}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(recurso)}
                            disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsBeingEdited(true);
                            setUpdatingLine([recurso.wbs_item?.wbs_area.id, recurso.wbs_item?.id])
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default RecursoBlock;