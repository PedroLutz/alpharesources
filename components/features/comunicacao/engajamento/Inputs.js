import { useRef} from "react";
import React from "react";
import styles from '../../../../styles/modules/comunicacao.module.css'

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
                    value={obj.nivel_engajamento}
                    name='nivel_engajamento'
                    onChange={handleChange}
                    ref={el => (camposRef.current.nivel_engajamento = el)} >
                    <option value="" defaultValue>Engagement</option>
                    <option value="Unaware">Unaware</option>
                    <option value="Resistant">Resistant</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Supportive">Supportive</option>
                    <option value="Leading">Leading</option>
                </select>
            </td>

            <td>
                <select
                    value={obj.nivel_eng_desejado}
                    name='nivel_eng_desejado'
                    onChange={handleChange}
                    ref={el => (camposRef.current.nivel_eng_desejado = el)} >
                    <option value="" defaultValue>Engagement</option>
                    <option value="Unaware">Unaware</option>
                    <option value="Resistant">Resistant</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Supportive">Supportive</option>
                    <option value="Leading">Leading</option>
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