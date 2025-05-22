import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";
import styles from '../../../styles/modules/comunicacao.module.css'

const CadastroInputs = ({ obj, objSetter, funcao, tipo, checkDados }) => {
    const [gruposENomes, setGruposENomes] = useState([]);
    const [stakeholdersDoGrupo, setStakeholdersDoGrupo] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([]);
    const [verOpcaoCustom, setVerOpcaoCustom] = useState(false);
    const camposRef = useRef({
        funcao: null,
        descricao: null,
        habilidades: null,
        responsavel: null
    })
    const { isAdmin } = useContext(AuthContext);
    const isFirstRender = useRef(true);

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
            checkDados('inputsVazios');
            return true;
        }
    }

    const handleSubmit = (e) => {
        const isInvalido = validaDados();
        if (funcao.funcao1) {
            !isInvalido && funcao.funcao1();
        } else {
            !isInvalido && funcao(e);
        }
    }

    return (
        <tr>
            <td>
                <textarea
                    name="funcao"
                    onChange={handleChange}
                    value={obj.funcao}
                    placeholder="Role"
                    ref={el => (camposRef.current.funcao = el)}
                />
            </td>
            <td>
                <textarea
                    name="descricao"
                    onChange={handleChange}
                    value={obj.descricao}
                    placeholder="Description"
                    ref={el => (camposRef.current.descricao = el)}
                />
            </td>
            <td>
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