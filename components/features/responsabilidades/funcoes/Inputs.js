import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import styles from '../../../../styles/modules/responsabilidades.module.css'
import { fetchData } from "../../../../functions/crud";
import { AuthContext } from "../../../../contexts/AuthContext";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const [nomesMembros, setNomesMembros] = useState([]);
    const camposRef = useRef({
        funcao: null,
        descricao: null,
        habilidades: null,
        responsavel: null,
        area: null,
    })
    const { isAdmin } = useContext(AuthContext);

    const fetchMembros = async () => {
        const data = await fetchData('responsabilidades/membros/get/nomes');
        setNomesMembros(data.nomes);
    };

    useEffect(() => {
        fetchMembros();
    }, []);

    const handleChange = (e) => {
        var { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        //se o usuario digitou algo no campo, ele n esta mais vazio
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        if(funcoes?.isFuncaoCadastrada?.(obj.funcao) ?? false){
            camposRef.current.funcao.classList.add('campo-vazio');
            setExibirModal('funcaoRepetida');
            return true;
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

    const handleSubmit = () => {
        const isInvalido = validaDados();
        if(isInvalido == true) return;
        funcoes?.enviar();
    }

    return (
        <tr>
            <td className={styles.funcoesTdFuncao}>
                <textarea
                    name="funcao"
                    onChange={handleChange}
                    value={obj.funcao}
                    placeholder="Role"
                    ref={el => (camposRef.current.funcao = el)}
                />
            </td>
            <td className={styles.funcoesTdDescricao}>
                <textarea
                    name="descricao"
                    onChange={handleChange}
                    value={obj.descricao}
                    placeholder="Description"
                    ref={el => (camposRef.current.descricao = el)}
                />
            </td>
            <td className={styles.funcoesTdHabilidade}>
                <textarea
                    name="habilidades"
                    onChange={handleChange}
                    value={obj.habilidades}
                    placeholder="Skill requirements"
                    ref={el => (camposRef.current.habilidades = el)}
                />
            </td>
            <td>
                <select
                    name="responsavel"
                    onChange={handleChange}
                    value={obj.responsavel}
                    ref={el => (camposRef.current.responsavel = el)}
                >
                    <option defaultValue value="">Responsible</option>
                    {nomesMembros.map((membro, index) => (
                        <option key={index} value={membro.nome}>{membro.nome}</option>
                    ))}
                </select>
            </td>
            <td>
                <textarea
                    name="area"
                    onChange={handleChange}
                    value={obj.area}
                    placeholder="Areas"
                    ref={el => (camposRef.current.area = el)}
                />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isAdmin}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcoes?.cancelar}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </tr>
    )
}

export default CadastroInputs;