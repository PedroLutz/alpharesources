import React, { useState } from "react";
import { useIdentificacao } from "../data/IdentificacaoContext";
import useAuth from "../../../../../hooks/useAuth";
import { handleReq } from "../../../../../functions/crud_s";
import { useEffect } from "react";
import CadastroInputs from "../forms/Inputs";
import { getTextColor } from "../../../../../functions/colors";
import usePerm from "../../../../../hooks/usePerm";
import styles from '../../../../../styles/modules/risco.module.css'
import { calculateRowSpan } from "../../../../../functions/general";

export function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const camposVazios = {
    item_id: '',
    owner_id: '',
    risk: '',
    classification: '',
    is_negative: '',
    effect: '',
    cause: '',
    trigger: '',
}

const IdentificacaoBlock = ({ risco, index, setExibirModal, updatingLine, setUpdatingLine, setConfirmDeleteItem }) => {
    const [novosDados, setNovosDados] = useState(camposVazios);
    const { riscos, fetchData, setIsLoading } = useIdentificacao();
    const { token } = useAuth();
    const { isEditor } = usePerm();
    const [isBeingUpdated, setIsBeingUpdated] = useState(false);

    useEffect(() => {
        setNovosDados({
            id: risco.id,
            item_id: risco?.wbs_item?.id || -1,
            owner_id: risco?.member?.id,
            risk: risco?.risk,
            classification: risco?.classification,
            is_negative: risco.is_negative,
            effect: risco.effect,
            cause: risco.cause,
            trigger: risco.trigger
        })
    }, [])

    const enviar = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'risk',
                route: 'update',
                token,
                data: {
                    ...novosDados,
                    item_id: novosDados.item_id != -1 ? novosDados.item_id : null,
                    owner_id: novosDados.owner_id != -1 ? novosDados.owner_id : null,
                },
                fetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setUpdatingLine(null);
        setIsBeingUpdated(false);
        setIsLoading(false);
    };

    const { wbs_item } = risco;
    const { wbs_area } = wbs_item ?? {};
    const shouldMergeArea = wbs_area?.id === riscos[index - 1]?.wbs_item?.wbs_area?.id;
    const shouldMergeItem = wbs_item?.id === riscos[index - 1]?.wbs_item?.id;

    return (
        <>
            {isBeingUpdated ? (
                <CadastroInputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar,
                        cancelar: () => {
                            setIsBeingUpdated(false); setUpdatingLine(null);
                        },
                    }}
                    setExibirModal={setExibirModal}
                    backgroundColor={wbs_area?.color}
                />
            ) : (
                <tr style={{ backgroundColor: wbs_area?.color, color: getTextColor(wbs_area?.color ?? "#ffffff") }}>
                    {!updatingLine || updatingLine[0] !== wbs_area.id ? (
                        <>
                            {!shouldMergeArea ? (
                                <td className={styles.riscoTdArea}
                                    rowSpan={calculateRowSpan(riscos, wbs_area?.id, index, 'wbs_item.wbs_area.id')}
                                >{wbs_area?.name ?? 'Others'}</td>
                            ) : null}
                        </>
                    ) : (
                        <td className={styles.riscoTdArea}>{wbs_area?.name ?? 'Others'}</td>
                    )}
                    {!updatingLine || updatingLine[1] !== wbs_item?.id ? (
                        <>
                            {!shouldMergeItem ? (
                                <td className={styles.riscoTdItem}
                                    rowSpan={calculateRowSpan(wbs_item?.id, index, 'wbs_item.id')}
                                >{wbs_item?.name || 'Others'}</td>
                            ) : null}
                        </>
                    ) : (
                        <td className={styles.riscoTdItem}>{wbs_item?.name || 'Others'}</td>
                    )}
                    <td>{risco.risk}</td>
                    <td>{capitalizeFirstLetter(risco.classification)}</td>
                    <td>{risco.is_negative ? 'Threat' : 'Opportunity'}</td>
                    <td>{risco.effect}</td>
                    <td>{risco.cause}</td>
                    <td>{risco.trigger}</td>
                    <td>{risco.member?.name || 'Circunstancial'}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(risco)} disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsBeingUpdated(true); setUpdatingLine([wbs_area?.id, wbs_item?.id])
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default IdentificacaoBlock;