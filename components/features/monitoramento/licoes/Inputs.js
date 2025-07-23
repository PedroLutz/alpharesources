import { useRef, useContext } from "react";
import styles from '../../../../styles/modules/monitoramento.module.css'
import React from "react";
import { AuthContext } from "../../../../contexts/AuthContext";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, setExibirModal }) => {
    const camposRef = useRef({
        data: null, 
        tipo: null,
        situacao: null,
        aprendizado: null,
        acao: null
    })
    const { isAdmin } = useContext(AuthContext);

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
        const camposVazios = Object.entries(obj)
            .filter(([key, value]) => value === null || value === "")
            .map(([key]) => key);

        if (camposVazios.length > 0) {
            console.log(camposVazios)
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
        if (funcao.funcao1) {
            funcao.funcao1();
        } else {
            funcao(e);
        }
    }

    return (
        <tr>
            <td className={styles.licoesData}>
                <input type="date"
                    value={obj.data}
                    name='data'
                    onChange={handleChange}
                    ref={el => (camposRef.current.data = el)} />
            </td>
            <td className={styles.licoesTipo}>
                <select
                    value={obj.tipo}
                    name='tipo'
                    onChange={handleChange}
                    ref={el => (camposRef.current.tipo = el)}
                >
                    <option value="" defaultValue>Type</option>
                    <option value='Explicit'>Explicit</option>
                    <option value='Tacit'>Tacit</option>
                </select>
            </td>
            <td className={styles.licoesSituacao}>
                <textarea
                    name="situacao"
                    onChange={handleChange}
                    value={obj.situacao}
                    placeholder="Situation"
                    ref={el => (camposRef.current.situacao = el)}
                />
            </td>
            <td className={styles.licoesAprendizado}>
                <textarea
                    name="aprendizado"
                    onChange={handleChange}
                    value={obj.aprendizado}
                    placeholder="Lesson learned"
                    ref={el => (camposRef.current.aprendizado = el)}
                />
            </td>
            <td className={styles.licoesAcao}>
                <textarea
                    name="acao"
                    onChange={handleChange}
                    value={obj.acao}
                    placeholder="Action taken"
                    ref={el => (camposRef.current.acao = el)}
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