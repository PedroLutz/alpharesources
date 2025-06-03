import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, setExibirModal }) => {
    const camposRef = useRef({
        grupo: null,
        envolvimento: null,
        influencia: null,
        impacto: null,
        poder: null,
        interesse: null,
        expectativas: null,
        requisitos: null,
        engajamento_positivo: null,
        engajamento_negativo: null
    })
    const {isAdmin} = useContext(AuthContext);


    //funcao que insere os dados no obj
    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    //funcao que retorna array com true caso algum campo esteja vazio, e os nomes dos campos vazios
    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => value === null || value === "");
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };

    //funcao que valida os dados e insere nos campos vazios a classe "campo-vazio"
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

        return false;
    }

    //funcao que, caso os dados sejam validos, executa a funcao de submit
    const handleSubmit = (e) => {
        const isInvalido = validaDados();
        
        if(isInvalido){
            return;
        }
        
        if(funcao.funcao1){
            funcao.funcao1();
        } else {
            funcao(e);
        }
    }

    return (
        <tr>
            <td>
                <textarea
                    name="grupo"
                    onChange={handleChange}
                    value={obj.grupo}
                    placeholder="Stakeholder Group"
                    ref={el => (camposRef.current.grupo = el)}
                />
            </td>
            <td>
                <textarea
                    name="envolvimento"
                    onChange={handleChange}
                    value={obj.envolvimento}
                    placeholder="Involvement"
                    ref={el => (camposRef.current.envolvimento = el)}
                />
            </td>
            <td>
                <textarea
                    name="influencia"
                    onChange={handleChange}
                    value={obj.influencia}
                    placeholder="Potencial Influence"
                    ref={el => (camposRef.current.influencia = el)}
                />
            </td>
            <td>
                <textarea
                    name="impacto"
                    onChange={handleChange}
                    value={obj.impacto}
                    placeholder="Potencial Impact"
                    ref={el => (camposRef.current.impacto = el)}
                />
            </td>
            <td>
                <textarea
                    name="poder"
                    onChange={handleChange}
                    value={obj.poder}
                    placeholder="Power"
                    ref={el => (camposRef.current.poder = el)}
                />
            </td>
            <td>
                <textarea
                    name="interesse"
                    onChange={handleChange}
                    value={obj.interesse}
                    placeholder="Interest"
                    ref={el => (camposRef.current.interesse = el)}
                />
            </td>
            <td>
                <textarea
                    name="expectativas"
                    onChange={handleChange}
                    value={obj.expectativas}
                    placeholder="Expectations"
                    ref={el => (camposRef.current.expectativas = el)}
                />
            </td>
            <td>
                <textarea
                    name="requisitos"
                    onChange={handleChange}
                    value={obj.requisitos}
                    placeholder="Requisites"
                    ref={el => (camposRef.current.requisitos = el)}
                />
            </td>
            <td>
                <textarea
                    name="engajamento_positivo"
                    onChange={handleChange}
                    value={obj.engajamento_positivo}
                    placeholder="Positive Engagement"
                    ref={el => (camposRef.current.engajamento_positivo = el)}
                />
            </td>
            <td>
                <textarea
                    name="engajamento_negativo"
                    onChange={handleChange}
                    value={obj.engajamento_negativo}
                    placeholder="Negative Engagement"
                    ref={el => (camposRef.current.engajamento_negativo = el)}
                />
            </td>   
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isAdmin}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcao.funcao2}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </tr>
    )
}

export default CadastroInputs;