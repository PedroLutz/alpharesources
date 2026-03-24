import { useState } from "react";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import Inputs from "../forms/InputsContainer";
import styles from '../../../../../styles/modules/wbs.module.css'
import { getTextColor } from "../../../../../functions/colors";
import { handleReq } from "../../../../../functions/crud_s";
import { useDictionary } from "../DictionaryContext";
import { useEffect } from "react";

const DictionaryBlock = ({item, index, setExibirModal, setConfirmDeleteItem }) => {
    const {dicionarios, setIsLoading, refetchData} = useDictionary(); 

    const { user, token } = useAuth();
    const {isEditor} = usePerm();
    const camposVazios = {
        id: item.id,
            item_id: item.wbs_item.id,
            description: item.description,
            purpose: item.purpose,
            criteria: item.criteria,
            inspection: item.inspection,
            timing: item.timing,
            responsible: item.responsible,
            approval_responsible: item.approval_responsible,
            premises: item.premises,
            restrictions: item.restrictions,
            resources: item.resources,
            user_id: user?.id
    }
    const [novosDados, setNovosDados] = useState(camposVazios);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        setNovosDados(camposVazios);
    }, [])

    const handleUpdateItem = async () => {
        setIsLoading(true);
        await handleReq({
            table: 'wbs_dictionary',
            route: 'update',
            token,
            data: novosDados,
            fetchData: refetchData
        });
        setIsLoading(false);
        setIsUpdating(false);
    };

    const calculateRowSpan = (currentArea, currentIndex) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < dicionarios.length; i++) {
            if (dicionarios[i].wbs_item.wbs_area.name === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    return (
        <tr style={{backgroundColor: item.wbs_item.wbs_area.color, color: getTextColor(item.wbs_item.wbs_area.color)}}>
            {index === 0 || dicionarios[index - 1].wbs_item.wbs_area.name !== item.wbs_item.wbs_area.name ? (
                <td rowSpan={calculateRowSpan(item.wbs_item.wbs_area.name, index)}
                    className={styles.td_area}>{item.wbs_item.wbs_area.name}</td>
            ) : null}
            <td className={styles.td_item}>{item.wbs_item.name}</td>

            {isUpdating ? (
                <Inputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar: handleUpdateItem,
                        cancelar: () => setIsUpdating(false)
                    }}
                    area_id={item.wbs_item.wbs_area.id}
                    setExibirModal={setExibirModal}
                    backgroundColor={item.wbs_item.wbs_area.color}
                />
            ) : (
                <>
                    <td className={styles.td_descricao}>{item.description}</td>
                    <td className={styles.td_proposito}>{item.purpose}</td>
                    <td className={styles.td_premissas}>{item.premises}</td>
                    <td className={styles.td_restricoes}>{item.restrictions}</td>
                    <td className={styles.td_recursos}>{item.resources}</td>
                    <td className={styles.td_criterio}>{item.criteria}</td>
                    <td className={styles.td_verificacao}>{item.inspection}</td>
                    <td className={styles.td_timing}>{item.timing}</td>
                    <td className={styles.td_responsavel}>{item.responsible}</td>
                    <td className={styles.td_responsavel_aprovacao}>{item.approval_responsible}</td>
                    <td className='botoes_acoes' style={{backgroundColor: item.wbs_item.wbs_area.color}}>
                        <button onClick={() => setConfirmDeleteItem(item)} disabled={!isEditor}>❌</button>
                        <button onClick={() => setIsUpdating(true)} disabled={!isEditor}>⚙️</button>
                    </td>
                </>
            )}
        </tr>
    )
}

export default DictionaryBlock;