import { useState, useEffect } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import { useFinances } from "../FinancesContext";
import useAuth from "../../../../../hooks/useAuth";
import { euDateToIsoDate } from "../../../../../functions/general";
import styles from '../../../../../styles/modules/financas.module.css'
import usePerm from "../../../../../hooks/usePerm";
import InputContainer from "../forms/CadastroInputs";

export const labelsTipo = {
    income: 'Income',
    cost: 'Cost',
    exchange: 'Exchange'
};

const ReleaseBlock = ({ item, setExibirModal, setDeleteItem }) => {
    const [novosDados, setNovosDados] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const { token } = useAuth();
    const {isEditor} = usePerm();

    const {
        refetchData,
        setIsLoading
    } = useFinances();

    useEffect(() => {
        setCamposToNovosDados();
    }, [])

    const setCamposToNovosDados = () => {
        let valorCorrigido = 0;
        if (Number(item.value) < 0) {
            valorCorrigido = item.value * -1;
        } else {
            valorCorrigido = item.value;
        }

        setNovosDados({
            id: item.id,
            type: item.type,
            description: item.description,
            value: valorCorrigido,
            date: euDateToIsoDate(item.date),
            area_id: item.wbs_area?.id || null,
            origin: item.origin,
            destination: item.destination,
        });
    };

    const enviar = async () => {
        setIsLoading(true);
        const isExpense = novosDados.type === 'cost';
        const valorInverso = isExpense ? novosDados.value * -1 : novosDados.value;
        const { balance, ...updatedItem } = novosDados;
        updatedItem.value = valorInverso;
        try {
            await handleReq({
                table: 'financial_release',
                route: 'update',
                token,
                data: updatedItem,
                fetchData: refetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setIsLoading(false);
        setIsUpdating(false);
    };

    return (
        <>
            {isUpdating ? (
                <>
                    <InputContainer
                        obj={novosDados}
                        objSetter={setNovosDados}
                        funcoes={{
                            enviar,
                            cancelar: () => setIsUpdating(false)
                        }}
                        setExibirModal={setExibirModal}
                        tipo='update' />
                </>
            ) : (
                <>
                    <tr>
                        <td style={{ color: item.type === 'income' ? 'green' : item.type === 'exchange' ? '#335EFF' : 'red' }}>{labelsTipo[item.type]}</td>
                        <td className={styles.tdDescricao} style={{ color: item.type === 'income' ? 'green' : item.type === 'exchange' ? '#335EFF' : 'red' }}>
                            {item.description}
                        </td>
                        <td className={styles.tdValor} style={{ color: item.type === 'income' ? 'green' : item.type === 'exchange' ? '#335EFF' : 'red' }}>
                            <b>R${Math.abs(item.value).toFixed(2)}</b>
                        </td>
                        <td className={styles.tdData}>{item.date}</td>
                        <td className={styles.tdArea}>{item?.wbs_area?.name || 'Others'}</td>
                        <td className={styles.tdOrigem}>{item.origin}</td>
                        <td className={styles.tdDestino}>{item.destination}</td>
                        <td className={styles.tdBalanco}>
                            <a style={{ color: item.type === 'income' ? 'green' : 'red', fontSize: '1.2rem' }}>
                                {item.type === 'income' ? "▲" : item.type === 'exchange' ? "" : '▼'}
                            </a>
                            <b>R${item.balance}</b>
                        </td>
                        <td className="botoes_acoes">
                            <button onClick={() => setDeleteItem(item)}
                                disabled={!isEditor}>❌</button>
                            <button onClick={() => setIsUpdating(true)}
                                disabled={!isEditor}>⚙️</button>
                        </td>
                    </tr>
                </>
            )}
        </>
    )
};

export default ReleaseBlock;