import { useState, useEffect } from "react";
import { useStakeholder } from "../data/StakeholderContext";
import { handleReq } from "../../../../../functions/crud_s";
import usePerm from "../../../../../hooks/usePerm";
import useAuth from "../../../../../hooks/useAuth";
import CadastroInputs from "../forms/Inputs";

const StakeholderBlock = ({ stakeholder, index, updatingGroup, setUpdatingGroup, setExibirModal, setConfirmDeleteItem }) => {
    const { setIsLoading, fetchData, stakeholders } = useStakeholder();
    const [novosDados, setNovosDados] = useState(stakeholder);
    const [isUpdating, setIsUpdating] = useState(false);
    const {isEditor} = usePerm();
    const {token} = useAuth();

    useEffect(() => {
        setNovosDados({
            id: stakeholder.id,
            group_id: stakeholder?.stakeholder_group?.id,
            stakeholder: stakeholder.stakeholder,
            influence: stakeholder.influence,
            power: stakeholder.power,
            interest: stakeholder.interest,
            expectations: stakeholder.expectations,
            requisites: stakeholder.requisites,
            positive_eng: stakeholder.positive_eng,
            negative_eng: stakeholder.negative_eng
        });
    }, [])

    const handleUpdateItem = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'stakeholder',
                route: 'update',
                token,
                data: novosDados,
                fetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setIsUpdating(false);
        setUpdatingGroup(null);
        setIsLoading(false);
    };

    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < stakeholders.length; i++) {
            let comparedData = stakeholders[i][parametro];
            if (parametro.includes(".")) {
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], stakeholders[i]);
            }
            if (comparedData === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    return (
        <>
            {isUpdating ? (
                <CadastroInputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar: handleUpdateItem,
                        cancelar: () => { setIsUpdating(false); setUpdatingGroup(null); }
                    }}
                    setExibirModal={setExibirModal}
                />
            ) : (
                <tr>
                    {!updatingGroup || updatingGroup !== stakeholder?.stakeholder_group?.id ? (
                        <>
                            {index === 0 || stakeholders[index - 1].stakeholder_group?.id !== stakeholder.stakeholder_group?.id ? (
                                <td rowSpan={calculateRowSpan(stakeholder.stakeholder_group?.id, index, 'stakeholder_group.id')}
                                >{stakeholder.stakeholder_group?.group}</td>
                            ) : null}
                        </>
                    ) : (
                        <td>{stakeholder?.stakeholder_group?.group}</td>
                    )}
                    <td>{stakeholder.stakeholder}</td>
                    <td>{stakeholder.influence ? 'High' : 'Low'}</td>
                    <td>{stakeholder.impact ? 'High' : 'Low'}</td>
                    <td>{stakeholder.power ? 'High' : 'Low'}</td>
                    <td>{stakeholder.interest ? 'High' : 'Low'}</td>
                    <td>{stakeholder.expectations}</td>
                    <td>{stakeholder.requisites}</td>
                    <td>{stakeholder.positive_eng}</td>
                    <td>{stakeholder.negative_eng}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(stakeholder)} disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsUpdating(true); setUpdatingGroup(stakeholder?.stakeholder_group?.id)
                        }} disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default StakeholderBlock;