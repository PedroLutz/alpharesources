import { useRef } from "react";
import React from "react";
import styles from '../../../../../styles/modules/responsabilidades.module.css'
import usePerm from "../../../../../hooks/usePerm";
import { useHabilidade } from "../data/HabilidadeContext";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const {nomesFuncoes} = useHabilidade();
    const {isEditor} = usePerm();
    const camposRef = useRef({
        funcao: null,
        area: null,
        habilidade: null,
        nivel_atual: null,
        nivel_min: null,
        acao: null
    })

    const handleChange = (e, isNumber) => {
        var { name, value } = e.target;
        if (isNumber) {
            value = value.replace(/[^0-9]/g, '');
        }
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        const campos = { nivel_atual: obj.nivel_atual, nivel_min: obj.nivel_min };

        for (const [key, value] of Object.entries(campos)) {
            if (value < 0) {
                camposRef.current[key].classList.add('campo-vazio');
                setExibirModal('valorNegativo');
                return false;
            }
            if (value > 5) {
                camposRef.current[key].classList.add('campo-vazio');
                setExibirModal('maiorQueCinco');
                return false;
            }
        }

        const { acao, ...camposConsiderados } = obj;
        const camposVazios = Object.keys(camposConsiderados)
            .filter(key => camposConsiderados[key] === null || camposConsiderados[key] === "")

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');
            });
            setExibirModal('inputsVazios');
            return false;
        }

        return true;
    }

    const handleSubmit = () => {
        const isValid = validaDados();
        if (!isValid) return;
        funcoes?.enviar();
    }

    return (
        <React.Fragment>

            {tipo != 'update' && (

                <React.Fragment>
                    <td>
                        -
                    </td>
                    <td>
                        <select
                            name="role_id"
                            onChange={(e) => handleChange(e, false)}
                            value={obj.role_id}
                            ref={el => (camposRef.current.role_id = el)}
                        >
                            <option defaultValue value="">Role</option>
                            {nomesFuncoes.map((funcao, index) => (
                                <option key={index} value={funcao.id}>{funcao.role}</option>
                            ))}
                        </select>
                    </td>
                    <td>
                        -
                    </td>
                </React.Fragment>
            )}


            <td>
                <textarea
                    name="skill"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.skill}
                    placeholder="Skill"
                    ref={el => (camposRef.current.skill = el)}
                />
            </td>
            <td className={styles.habilidadeTdNivel}>
                <textarea
                    name="cur_level"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.cur_level}
                    placeholder="Current level"
                    ref={el => (camposRef.current.cur_level = el)}
                />
            </td>
            <td className={styles.habilidadeTdNivel}>
                <textarea
                    name="min_level"
                    onChange={(e) => handleChange(e, true)}
                    value={obj.min_level}
                    placeholder="Desired level"
                    ref={el => (camposRef.current.min_level = el)}
                />
            </td>
            <td className={styles.habilidadeTdAcao}>
                <textarea
                    name="action"
                    onChange={(e) => handleChange(e, false)}
                    value={obj.action}
                    placeholder="Development action"
                    ref={el => (camposRef.current.action = el)}
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
        </React.Fragment>
    )
}

export default CadastroInputs;