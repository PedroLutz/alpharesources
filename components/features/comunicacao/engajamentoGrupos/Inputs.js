import { useRef} from "react";
import React from "react";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const camposRef = useRef({
        dependency: null,
        influence: null,
        control: null,
        impact: null,
        engagement: null,
        alignment: null,
        eng_level: null,
        eng_target_level: null
    })

    //funcao que insere os dados no obj
    const handleChange = (e, isNumber) => {
        var { name, value } = e.target;
        if(isNumber){
            value = value.replace(/[^0-9]/g, '');
        }
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    //funcao que verifica a validez dos dados
    const validaDados = () => {
        const campos = { 
            dependency: obj.dependency, 
            influence: obj.influence, 
            control: obj.control, 
            impact: obj.impact,
            engagement: obj.engagement,
            alignment: obj.alignment };

        for (const [key, value] of Object.entries(campos)) {
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
    }

    //funcao que executa a funcao de submit caso os dados sejam validos
    const handleSubmit = () => {
        const isInvalido = validaDados();
        if(isInvalido) return;
        
        funcoes?.enviar();
    }

    return (
        <React.Fragment>
            <td>
                <input
                    min={1}
                    max={5}
                    value={obj.dependency}
                    name='dependency'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.dependency = el)}
                />
            </td>
            <td>
                <input
                    min={1}
                    max={5}
                    value={obj.influence}
                    name='influence'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.influence = el)}
                />
            </td>
            <td>
                <input
                    min={1}
                    max={5}
                    value={obj.control}
                    name='control'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.control = el)}
                />
            </td>
            <td>-</td>
            <td>
                <input
                    min={1}
                    max={5}
                    value={obj.impact}
                    name='impact'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.impact = el)}
                />
            </td>
            <td>
                <input
                    min={1}
                    max={5}
                    value={obj.engagement}
                    name='engagement'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.engagement = el)}
                />
            </td>
            <td>
                <input
                    min={1}
                    max={5}
                    value={obj.alignment}
                    name='alignment'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.alignment = el)}
                />
            </td>
            <td>-</td>
            <td>-</td>
            <td>
                <select
                    value={obj.eng_level}
                    name='eng_level'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.eng_level = el)} >
                    <option value="" defaultValue>Engagement</option>
                    <option value="unaware">Unaware</option>
                    <option value="resistant">Resistant</option>
                    <option value="neutral">Neutral</option>
                    <option value="supportive">Supportive</option>
                    <option value="leading">Leading</option>
                </select>
            </td>

            <td>
                <select
                    value={obj.eng_target_level}
                    name='eng_target_level'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.eng_target_level = el)} >
                    <option value="" defaultValue>Engagement</option>
                    <option value="unaware">Unaware</option>
                    <option value="resistant">Resistant</option>
                    <option value="neutral">Neutral</option>
                    <option value="supportive">Supportive</option>
                    <option value="leading">Leading</option>
                </select>
            </td>
   
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                <button onClick={handleSubmit}>✔️</button>
                <button onClick={funcoes?.cancelar}>✖️</button>  
            </td>
        </React.Fragment>
    )
}

export default CadastroInputs;