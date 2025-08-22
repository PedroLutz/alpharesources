import { useRef} from "react";
import React from "react";
import styles from '../../../../styles/modules/comunicacao.module.css'

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    console.log(obj)
    const camposRef = useRef({
        dependencia: null,
        influencia: null,
        controle: null,
        impacto: null,
        engajamento: null,
        alinhamento: null,
        nivel_engajamento: null,
        nivel_eng_desejado: null
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
            dependencia: obj.dependencia, 
            influencia: obj.influencia, 
            controle: obj.controle, 
            impacto: obj.impacto,
            engajamento: obj.engajamento,
            alinhamento: obj.alinhamento };

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
                    value={obj.dependencia}
                    name='dependencia'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.dependencia = el)}
                />
            </td>
            <td>
                <input
                    min={1}
                    max={5}
                    value={obj.influencia}
                    name='influencia'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.influencia = el)}
                />
            </td>
            <td>
                <input
                    min={1}
                    max={5}
                    value={obj.controle}
                    name='controle'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.controle = el)}
                />
            </td>
            <td>-</td>
            <td>
                <input
                    min={1}
                    max={5}
                    value={obj.impacto}
                    name='impacto'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.impacto = el)}
                />
            </td>
            <td>
                <input
                    min={1}
                    max={5}
                    value={obj.engajamento}
                    name='engajamento'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.engajamento = el)}
                />
            </td>
            <td>
                <input
                    min={1}
                    max={5}
                    value={obj.alinhamento}
                    name='alinhamento'
                    onChange={(e) => handleChange(e, true)}
                    ref={el => (camposRef.current.alinhamento = el)}
                />
            </td>
            <td>-</td>
            <td>-</td>
            <td>
                <select
                    value={obj.nivel_engajamento}
                    name='nivel_engajamento'
                    onChange={(e) => handleChange(e, false)}
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
                    onChange={(e) => handleChange(e, false)}
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