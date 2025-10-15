import { useRef} from "react";
import React from "react";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const camposRef = useRef({
        nivel_engajamento: null,
        nivel_eng_desejado: null
    })

    //funcao que insere os dados no obj
    const handleChange = (e) => {
        var { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    //funcao que verifica a validez dos dados
    const validaDados = () => {
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
                <select
                    value={obj.eng_level}
                    name='eng_level'
                    onChange={handleChange}
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
                    onChange={handleChange}
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