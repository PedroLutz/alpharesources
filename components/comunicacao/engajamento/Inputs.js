import { useRef} from "react";
import React from "react";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, setExibirModal }) => {
    const camposRef = useRef({
        nivel_engajamento: null,
        nivel_eng_desejado: null
    })

    const handleChange = (e) => {
        var { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => value === null || value === "");
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };

    const validaDados = () => {
        const [isEmpty, camposVazios] = isFormVazio(obj);
        if (isEmpty) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
            });
            setExibirModal('inputsVazios');
            return true;
        }
    }

    const handleSubmit = () => {
        const isInvalido = validaDados();
        !isInvalido && funcao.funcao1();
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
                <button onClick={funcao.funcao2}>✖️</button>  
            </td>
        </React.Fragment>
    )
}

export default CadastroInputs;