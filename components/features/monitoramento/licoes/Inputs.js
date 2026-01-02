import { useRef } from "react";
import styles from '../../../../styles/modules/monitoramento.module.css'
import React from "react";
import usePerm from "../../../../hooks/usePerm";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const camposRef = useRef({
        date: null, 
        type: null,
        situation: null,
        learning: null,
        action: null
    })
    const {isEditor} = usePerm();

    //funcao que atualiza o obj. dependendo da natureza do dado, permite caracteres especificos apenas.
    const handleChange = (e) => {
        var { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        const camposVazios = Object.keys(obj)
            .filter(key => obj[key] === null || obj[key] === "");

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');            
            });
            setExibirModal('inputsVazios');
            return false;
        }

        return true;
    }

    //funcao que roda a funcao de envio de acordo com o type da funcao
    const handleSubmit = () => {
        const isValid = validaDados();
        if (!isValid) return;
        funcoes?.enviar();
    }

    return (
        <tr>
            <td className={styles.licoesData}>
                <input type="date"
                    value={obj.date}
                    name='date'
                    onChange={handleChange}
                    ref={el => (camposRef.current.date = el)} />
            </td>
            <td className={styles.licoesTipo}>
                <select
                    value={obj.type}
                    name='type'
                    onChange={handleChange}
                    ref={el => (camposRef.current.type = el)}
                >
                    <option value="" defaultValue>Type</option>
                    <option value={true}>Explicit</option>
                    <option value={false}>Tacit</option>
                </select>
            </td>
            <td className={styles.licoesSituaction}>
                <textarea
                    name="situation"
                    onChange={handleChange}
                    value={obj.situation}
                    placeholder="Situation"
                    ref={el => (camposRef.current.situation = el)}
                />
            </td>
            <td className={styles.licoesAprendizado}>
                <textarea
                    name="learning"
                    onChange={handleChange}
                    value={obj.learning}
                    placeholder="Lesson learned"
                    ref={el => (camposRef.current.learning = el)}
                />
            </td>
            <td className={styles.licoesAcao}>
                <textarea
                    name="action"
                    onChange={handleChange}
                    value={obj.action}
                    placeholder="Action taken"
                    ref={el => (camposRef.current.action = el)}
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