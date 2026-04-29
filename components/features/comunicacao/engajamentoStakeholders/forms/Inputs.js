import { useRef} from "react";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const camposRef = useRef({
        eng_level: null,
        eng_target_level: null
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
        const camposVazios = Object.keys(obj)
        .filter(key => obj[key] === null || obj[key] === "")

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');
            });
            setExibirModal('inputsVazios');
            return false;
        }
        return true;
    }

    //funcao que executa a funcao de submit caso os dados sejam validos
    const handleSubmit = () => {
        const isValid = validaDados();
        if(!isValid) return;
        funcoes?.enviar();
    }

    return (
        <>
            <td>
                <select
                    value={obj?.eng_level ?? ""}
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
                    value={obj?.eng_target_level ?? ""}
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
        </>
    )
}

export default CadastroInputs;