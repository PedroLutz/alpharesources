import { useState, useRef, useContext } from "react";
import React from "react";
import { AuthContext } from "../../../contexts/AuthContext";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, setExibirModal }) => {
    const camposRef = useRef({
        identificacao: null,
        descricao: null,
        custo: null,
        escala_custo: null,
        impacto: null,
        urgencia: null,
        diferencial: null,
        areas_afetadas: null,
        explicacao: null
    })
    const {isAdmin} = useContext(AuthContext);

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
        const camposNumericos = { impacto: obj.impacto, 
            urgencia: obj.urgencia, 
            areas_afetadas: obj.areas_afetadas, 
            escala_custo: obj.escala_custo,
            diferencial: obj.diferencial };

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
    const handleSubmit = (e) => {
        const isInvalido = validaDados();
        if(isInvalido) return;
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
                    name="identificacao"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.identificacao}
                    placeholder="Identification"
                    ref={el => (camposRef.current.identificacao = el)}
                />
            </td>
            <td>
                <textarea
                    name="descricao"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.descricao}
                    placeholder="Description"
                    ref={el => (camposRef.current.descricao = el)}
                />
            </td>
            <td>
                <input
                    name="custo"
                    onChange={(e) => handleChange(e, {dinheiro: true})}
                    value={obj.custo}
                    placeholder="Cost"
                    ref={el => (camposRef.current.custo = el)}
                />
            </td>
            <td>
                <input
                    name="escala_custo"
                    onChange={(e) => handleChange(e, {dinheiro: false})}
                    value={obj.escala_custo}
                    placeholder="Cost Ranking"
                    ref={el => (camposRef.current.escala_custo = el)}
                />
            </td>
            <td>
                <input
                    name="impacto"
                    onChange={(e) => handleChange(e, {dinheiro: false})}
                    value={obj.impacto}
                    placeholder="Impact"
                    ref={el => (camposRef.current.impacto = el)}
                />
            </td>
            <td>
                <input
                    name="urgencia"
                    onChange={(e) => handleChange(e, {dinheiro: false})}
                    value={obj.urgencia}
                    placeholder="Urgency"
                    ref={el => (camposRef.current.urgencia = el)}
                />
            </td>
            <td>
                <input
                    name="diferencial"
                    onChange={(e) => handleChange(e, {dinheiro: false})}
                    value={obj.diferencial}
                    placeholder="Edge"
                    ref={el => (camposRef.current.diferencial = el)}
                />
            </td>
            <td>
                <input
                    name="areas_afetadas"
                    onChange={(e) => handleChange(e, {dinheiro: false})}
                    value={obj.areas_afetadas}
                    placeholder="Affected Areas"
                    ref={el => (camposRef.current.areas_afetadas = el)}
                />
            </td>
            <td>-</td>
            <td>-</td>
            <td>
                <textarea
                    name="explicacao"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.explicacao}
                    placeholder="Explanation"
                    ref={el => (camposRef.current.explicacao = el)}
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