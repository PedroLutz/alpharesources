import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, setExibirModal }) => {
    const [nomesMembros, setNomesMembros] = useState([]);
    const [areas, setAreas] = useState([]);
    const camposRef = useRef({
        funcao: null,
        descricao: null,
        habilidades: null,
        responsavel: null,
        area: null,
        itens: null
    })
    const { isAdmin } = useContext(AuthContext);

    const fetchMembros = async () => {
        const data = await fetchData('responsabilidades/membros/get/nomes');
        setNomesMembros(data.nomes);
    };

    const fetchAreas = async () => {
        const data = await fetchData('wbs/get/areas');
        setAreas(data.areas);
    }

    useEffect(() => {
        fetchAreas();
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

    const handleSubmit = (e) => {
        const isInvalido = validaDados();
        if(isInvalido == true) return;

        if (funcao.funcao1) {
            funcao.funcao1();
        } else {
            funcao(e);
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
            <td>
                <select
                    name="area"
                    onChange={handleChange}
                    value={obj.area}
                    ref={el => (camposRef.current.area = el)}
                >
                    <option defaultValue value="">Field</option>
                    {areas.map((area, index) => (
                        <option key={index} value={area._id}>{area._id}</option>
                    ))}
                </select>
            </td>
            <td>
                <textarea
                    name="itens"
                    onChange={handleChange}
                    value={obj.itens}
                    placeholder="WBS itens"
                    ref={el => (camposRef.current.itens = el)}
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