import CadastroInputs from "../forms/Inputs";
import { useState, useEffect } from "react";
import { handleReq } from "../../../../../functions/crud_s";
import { useCostBenefit } from "../CbDataContext";
import useAuth from "../../../../../hooks/useAuth";
import usePerm from "../../../../../hooks/usePerm";
import styles from '../../../../../styles/modules/custoBeneficio.module.css'

const CbBlock = ({ custoBeneficio, setExibirModal, setConfirmDeleteItem }) => {
    const {refetchData, setIsLoading} = useCostBenefit();
    const {user, token} = useAuth();
    const {isEditor} = usePerm();
    const [novosDados, setNovosDados] = useState(custoBeneficio);
    const [benefitAverage, setBenefitAverage] = useState(0);
    const [benefitIndex, setBenefitIndex] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);

    const enviar = async () => {
        setIsLoading(true);
        const { mediaBeneficios, ...usedObj } = novosDados;
        try {
            await handleReq({
                table: 'cost_benefit',
                route: 'update',
                token,
                data: usedObj,
                fetchData: refetchData
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
        setIsLoading(false);
        setIsUpdating(false);
    };

    useEffect(() => {
        const benefitAverage = parseFloat((custoBeneficio.area_impact
            + custoBeneficio.impact
            + custoBeneficio.urgency
            + custoBeneficio.edge)
            / 4);
        const benefitIndex = parseFloat(benefitAverage / custoBeneficio.cost_ranking);
        setBenefitAverage(benefitAverage);
        setBenefitIndex(benefitIndex);

        setNovosDados(custoBeneficio);
    }, [custoBeneficio]);

    return (
        <>
            {isUpdating ? (
                <CadastroInputs tipo="update"
                    obj={novosDados}
                    objSetter={setNovosDados}
                    funcoes={{
                        enviar,
                        cancelar: () => setIsUpdating(false)
                    }}
                    setExibirModal={setExibirModal}
                />
            ) : (
                <tr>
                    <td>{custoBeneficio.identification}</td>
                    <td className={styles.tdDescricao}>{custoBeneficio.description}</td>
                    <td className={styles.tdCusto}>R${parseFloat(custoBeneficio.cost).toFixed(2)}</td>
                    <td className={styles.tdEscala}>{custoBeneficio.cost_ranking}</td>
                    <td className={styles.tdImpacto}>{custoBeneficio.impact}</td>
                    <td className={styles.tdUrgencia}>{custoBeneficio.urgency}</td>
                    <td className={styles.tdDiferencial}>{custoBeneficio.edge}</td>
                    <td className={styles.tdAreas}>{custoBeneficio.area_impact}</td>
                    <td className={styles.tdMediaBeneficios}>{benefitAverage.toFixed(2)}</td>
                    <td className={styles.tdIndice}>{benefitIndex.toFixed(2)}</td>
                    <td className={styles.tdExplicacao}>{custoBeneficio.explanation}</td>
                    <td className='botoes_acoes'>
                        <button onClick={() => setConfirmDeleteItem(custoBeneficio)} disabled={!isEditor}>❌</button>
                        <button onClick={() => {setIsUpdating(true) }
                        } disabled={!isEditor}>⚙️</button>
                    </td>
                </tr>
            )}
        </>
    )
};

export default CbBlock;