import { useRef, useContext } from "react";
import styles from '../../../../styles/modules/custoBeneficio.module.css'
import React from "react";
import usePerm from '../../../../hooks/usePerm';

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const camposRef = useRef({
        identification: null,
        description: null,
        cost: null,
        cost_ranking: null,
        impact: null,
        urgency: null,
        area_impact: null,
        explanation: null,
        edge: null
    })
    const { isEditor } = usePerm();

    //funcao que atualiza o obj. dependendo da natureza do dado, permite caracteres especificos apenas.
    const handleChange = (e, isNumber) => {
        var { name, value } = e.target;
        if(isNumber){
            if(isNumber.dinheiro){
                value = value.replace(/[^0-9.]/g, '');
            } else {
                value = value.replace(/[^0-9]/g, '');
            }
        }
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };
    
    //funcao que verifica os dados do obj de acordo com varias especificacoes
    const validaDados = () => {
        const camposNumericos = { impact: obj.impact, 
            urgency: obj.urgency, 
            area_impact: obj.area_impact, 
            cost_ranking: obj.cost_ranking,
            edge: obj.edge };

        for (const [key, value] of Object.entries(camposNumericos)) {
            if (value < 0) {
                camposRef.current[key].classList.add('campo-vazio');
                setExibirModal('valorNegativo');
                return true;
            }
            if (value > 5) {
                camposRef.current[key].classList.add('campo-vazio');
                setExibirModal('maiorQueCinco');
                return true;
            }
        }
        const camposVazios = Object.entries(obj)
        .filter(([key, value]) => value === null || value === "")
        .map(([key]) => key);

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
            });
            setExibirModal('inputsVazios');
            return true;
        }

        return false;
    }

    //funcao que roda a funcao de envio de acordo com o tipo da funcao
    const handleSubmit = () => {
        const isInvalido = validaDados();
        if(isInvalido) return;
        funcoes?.enviar();
    }

    return (
        <tr>
            <td>
                <textarea
                    name="identification"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.identification}
                    placeholder="Identification"
                    ref={el => (camposRef.current.identification = el)}
                />
            </td>
            <td className={styles.tdDescricao}>
                <textarea
                    name="description"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.description}
                    placeholder="Description"
                    ref={el => (camposRef.current.description = el)}
                />
            </td>
            <td className={styles.tdCusto}>
                <input
                    name="cost"
                    onChange={(e) => handleChange(e, {dinheiro: true})}
                    value={obj.cost}
                    placeholder="Cost"
                    ref={el => (camposRef.current.cost = el)}
                />
            </td>
            <td className={styles.tdEscala}>
                <input
                    name="cost_ranking"
                    onChange={(e) => handleChange(e, {dinheiro: false})}
                    value={obj.cost_ranking}
                    placeholder="Cost Ranking"
                    ref={el => (camposRef.current.cost_ranking = el)}
                />
            </td>
            <td className={styles.tdImpacto}>
                <input
                    name="impact"
                    onChange={(e) => handleChange(e, {dinheiro: false})}
                    value={obj.impact}
                    placeholder="Impact"
                    ref={el => (camposRef.current.impact = el)}
                />
            </td>
            <td className={styles.tdUrgencia}>
                <input
                    name="urgency"
                    onChange={(e) => handleChange(e, {dinheiro: false})}
                    value={obj.urgency}
                    placeholder="Urgency"
                    ref={el => (camposRef.current.urgency = el)}
                />
            </td>
            <td className={styles.tdDiferencial}>
                <input
                    name="edge"
                    onChange={(e) => handleChange(e, {dinheiro: false})}
                    value={obj.edge}
                    placeholder="Edge"
                    ref={el => (camposRef.current.edge = el)}
                />
            </td>
            <td className={styles.tdAreas}>
                <input
                    name="area_impact"
                    onChange={(e) => handleChange(e, {dinheiro: false})}
                    value={obj.area_impact}
                    placeholder="Affected Areas"
                    ref={el => (camposRef.current.area_impact = el)}
                />
            </td>
            <td className={styles.tdMediaBeneficios}>-</td>
            <td className={styles.tdIndice}>-</td>
            <td className={styles.tdExplicacao}>
                <textarea
                    name="explanation"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.explanation}
                    placeholder="Explanation"
                    ref={el => (camposRef.current.explanation = el)}
                />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isEditor}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcoes?.cancelar}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </tr>
    )
}

export default CadastroInputs;