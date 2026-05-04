import { useState, useEffect } from "react"
import { useInformacao } from "../data/InformacaoContext";
import { handleReq } from "../../../../../functions/crud_s";
import usePerm from "../../../../../hooks/usePerm";
import useAuth from "../../../../../hooks/useAuth";
import styles from '../../../../../styles/modules/comunicacao.module.css'
import Link from "next/link";
import CadastroInputs from "../forms/Inputs";
import { calculateRowSpan } from "../../../../../functions/general";

const camposVazios = {
    stakeholder_id: "",
    information: "",
    method: "",
    frequency: "",
    channel: "",
    responsible_id: "",
    register: "",
    feedback: "",
    action: ""
}

const InformacaoBlock = (
    { informacao, index, 
    updatingLine, setUpdatingLine, 
    setConfirmDeleteItem, setExibirModal }
) => {
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [isBeingUpdated, setIsBeingUpdated] = useState(false);
    const { informacoes, fetchData, setIsLoading } = useInformacao();
    const { isEditor } = usePerm();
    const { token } = useAuth();

    useEffect(() => {
        setNovosDados({
            id: informacao.id,
            stakeholder_id: informacao?.stakeholder?.id,
            information: informacao.information,
            method: informacao.method,
            frequency: informacao.frequency,
            channel: informacao.channel,
            responsible_id: informacao?.member?.id != null ? informacao?.member?.id : -1,
            register: informacao.register,
            feedback: informacao.feedback,
            action: informacao.action
        });
    }, [])

    //funcao que trata os dados e envia o conteudo para o backend para update
    const enviar = async () => {
        setIsLoading(true);
        try {
            await handleReq({
                table: 'information',
                route: 'update',
                token,
                data: { ...novosDados, responsible_id: novosDados.responsible_id != -1 ? novosDados.responsible_id : null },
                fetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setIsLoading(false);
        setIsBeingUpdated(false);
    };

    const { stakeholder } = informacao;
    const { stakeholder_group } = stakeholder;
    
    const shouldMergeGroup = stakeholder_group?.id === informacoes[index - 1]?.stakeholder?.stakeholder_group?.id;

    const shouldMergeStakeholder = stakeholder?.id === informacoes[index - 1]?.stakeholder?.id;

    const register = informacao?.register ?
        (
            <Link href={informacao?.register}>{informacao?.register}</Link>
        ) : (
            '-'
        );

    return (
        <>
            {isBeingUpdated ? (
                <CadastroInputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar,
                        cancelar: () => { setIsBeingUpdated(false); setUpdatingLine(null); }
                    }}
                    setExibirModal={setExibirModal}
                />
            ) : (
                <tr>
                    {!updatingLine || updatingLine[0] !== stakeholder_group?.id ? (
                        <>
                            {!shouldMergeGroup ? (
                                <td rowSpan={calculateRowSpan(informacoes, stakeholder_group?.id, index, 'stakeholder.stakeholder_group.id')}
                                >{stakeholder_group?.group}</td>
                            ) : null}
                        </>
                    ) : (
                        <td>{stakeholder_group?.group}</td>
                    )}
                    {!updatingLine || updatingLine[1] !== stakeholder?.id ? (
                        <>
                            {!shouldMergeStakeholder ? (
                                <td rowSpan={calculateRowSpan(informacoes, stakeholder?.id, index, 'stakeholder.id')}
                                >{stakeholder?.stakeholder}</td>
                            ) : null}
                        </>
                    ) : (
                        <td>{stakeholder?.stakeholder}</td>
                    )}
                    <td className={styles.infoTdInfo}>{informacao.information}</td>
                    <td>{informacao.method}</td>
                    <td>{informacao.frequency}</td>
                    <td>{informacao.channel}</td>
                    <td>{informacao?.member?.name || 'Circunstancial'}</td>
                    <td>{register}</td>
                    <td>{informacao.feedback || '-'}</td>
                    <td>{informacao.action || '-'}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(informacao)} disabled={!isEditor}>❌</button>
                        <button onClick={() => {
                            setIsBeingUpdated(true); setUpdatingLine([stakeholder_group?.id, stakeholder?.id])
                        }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
}

export default InformacaoBlock;