import { useState, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import { useEngajamentos } from "../data/EngajamentosContext";
import { handleReq } from "../../../../../functions/crud_s";
import CadastroInputs from "../forms/Inputs";
import styles from '../../../../../styles/modules/comunicacao.module.css'

const generateMapping = (p, i) => {
    if (p) {
        if (i) {
            return "Close Management"
        } else {
            return "Keep satisfied"
        }
    } else {
        if (i) {
            return "Keep informed"
        } else {
            return "Monitor"
        }
    }
}

function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const EngajamentoBlock = ({ engajamento, index, updatingGroup, setUpdatingGroup, setExibirModal }) => {
    const [novosDados, setNovosDados] = useState(engajamento);
    const [isBeingUpdated, setIsBeingUpdated] = useState(false);
    const { engajamentos, setIsLoading, fetchData } = useEngajamentos();
    const { isEditor } = usePerm();
    const { token } = useAuth();

    const calculateRowSpan = (currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < engajamentos.length; i++) {
            let comparedData = engajamentos[i][parametro];
            if (parametro.includes(".")) {
                comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], engajamentos[i]);
            }
            if (comparedData === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    useEffect(() => {
        setNovosDados({
            id: engajamento.id,
            stakeholder_id: engajamento?.stakeholder?.id,
            eng_level: engajamento.eng_level || "",
            eng_target_level: engajamento.eng_target_level || ""
        });
    }, [])

    //funcao que trata e envia o objeto de atualizacao para o backend
    const handleUpdateItem = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'engagement',
                route: 'update',
                token,
                data: novosDados,
                fetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setIsBeingUpdated(false);
        setUpdatingGroup(null);
        setIsLoading(false);
    };

    return (
        <tr key={index}>
            {index === 0 || engajamentos[index - 1]?.stakeholder?.stakeholder_group?.id !== engajamento?.stakeholder?.stakeholder_group?.id ? (
                <td rowSpan={calculateRowSpan(engajamento?.stakeholder?.stakeholder_group?.id, index, 'stakeholder.stakeholder_group.id')}
                >{engajamento?.stakeholder?.stakeholder_group?.group}</td>
            ) : null}
            <td>{engajamento.stakeholder?.stakeholder}</td>
            <td id={styles.poderId}>{engajamento.stakeholder?.power ? 'High' : 'Low'}</td>
            <td id={styles.interesseId}>{engajamento.stakeholder?.interest ? 'High' : 'Low'}</td>
            <td>{generateMapping(engajamento.stakeholder?.power, engajamento.stakeholder?.interest)}</td>
            {isBeingUpdated ? (
                <CadastroInputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar: handleUpdateItem,
                        cancelar: () => { setIsBeingUpdated(false); setUpdatingGroup(null); }
                    }}
                    setExibirModal={setExibirModal}
                />
            ) : (
                <>
                    <td>{capitalizeFirstLetter(engajamento.eng_level)}</td>
                    <td>{capitalizeFirstLetter(engajamento.eng_target_level)}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => {
                            setIsBeingUpdated(true); setUpdatingGroup(engajamento?.stakeholder?.stakeholder_group?.id)
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </>
            )}
        </tr>
    )
};

export default EngajamentoBlock;