import { useRef } from "react";
import React from "react";
import usePerm from "../../../../hooks/usePerm";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const camposRef = useRef({
        group: null,
        involvement: null,
        influence: null,
        impact: null,
        power: null,
        interest: null,
        expectations: null,
        requisites: null,
        positive_eng: null,
        negative_eng: null
    })
    const {isEditor} = usePerm();


    //funcao que insere os dados no obj
    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    //funcao que valida os dados e insere nos campos vazios a classe "campo-vazio"
    const validaDados = () => {
        if(funcoes?.isGrupoCadastrado?.(obj.group) ?? false){
            camposRef.current.group.classList.add('campo-vazio');
            setExibirModal('groupRepetido');
            return true;
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

    //funcao que, caso os dados sejam validos, executa a funcao de submit
    const handleSubmit = () => {
        const isInvalido = validaDados();
        
        if(isInvalido) return;
        funcoes?.enviar();
    }

    return (
        <tr>
            <td>
                <textarea
                    name="group"
                    onChange={handleChange}
                    value={obj.group}
                    placeholder="Stakeholder Group"
                    ref={el => (camposRef.current.group = el)}
                />
            </td>
            <td>
                <textarea
                    name="involvement"
                    onChange={handleChange}
                    value={obj.involvement}
                    placeholder="Involvement"
                    ref={el => (camposRef.current.involvement = el)}
                />
            </td>
            <td>
                <textarea
                    name="influence"
                    onChange={handleChange}
                    value={obj.influence}
                    placeholder="Potencial Influence"
                    ref={el => (camposRef.current.influence = el)}
                />
            </td>
            <td>
                <textarea
                    name="impact"
                    onChange={handleChange}
                    value={obj.impact}
                    placeholder="Potencial Impact"
                    ref={el => (camposRef.current.impact = el)}
                />
            </td>
            <td>
                <textarea
                    name="power"
                    onChange={handleChange}
                    value={obj.power}
                    placeholder="Power"
                    ref={el => (camposRef.current.power = el)}
                />
            </td>
            <td>
                <textarea
                    name="interest"
                    onChange={handleChange}
                    value={obj.interest}
                    placeholder="Interest"
                    ref={el => (camposRef.current.interest = el)}
                />
            </td>
            <td>
                <textarea
                    name="expectations"
                    onChange={handleChange}
                    value={obj.expectations}
                    placeholder="Expectations"
                    ref={el => (camposRef.current.expectations = el)}
                />
            </td>
            <td>
                <textarea
                    name="requisites"
                    onChange={handleChange}
                    value={obj.requisites}
                    placeholder="Requisites"
                    ref={el => (camposRef.current.requisites = el)}
                />
            </td>
            <td>
                <textarea
                    name="positive_eng"
                    onChange={handleChange}
                    value={obj.positive_eng}
                    placeholder="Positive Engagement"
                    ref={el => (camposRef.current.positive_eng = el)}
                />
            </td>
            <td>
                <textarea
                    name="negative_eng"
                    onChange={handleChange}
                    value={obj.negative_eng}
                    placeholder="Negative Engagement"
                    ref={el => (camposRef.current.negative_eng = el)}
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