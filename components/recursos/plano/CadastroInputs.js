import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";

const CadastroInputs = ({ obj, objSetter, funcao, tipo, checkDados }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState("");
    const [recursos, setRecursos] = useState([]);
    const [recursosPorArea, setRecursosPorArea] = useState([]);
    const camposRef = useRef({
        recurso: null,
        metodo_a: null,
        plano_a: null,
        valor_a: null,
        data_esperada: null,
        data_limite: null,
        metodo_b: null,
        plano_b: null,
        valor_b: null,
        plano_real: null,
        data_real: null,
        valor_real: null
    });
    const {isAdmin} = useContext(AuthContext)

    const fetchRecursos = async () => {
        const data = await fetchData('recursos/recurso/get/nomesRecursos');
        setRecursos(data.recursos);
        var todosOsRecursos = [];
        data.recursos.forEach((recurso) => {
            todosOsRecursos.push([recurso.recurso])
        })
        setRecursosPorArea(todosOsRecursos);
    };

    useEffect(() => {
        fetchRecursos();
    }, []);

    useEffect(() => {
        if (isFirstRender.current === true) {
            isFirstRender.current = false;
            return;
        }

        objSetter({
            ...obj,
            recurso: ''
        });
    }, [areaSelecionada]);

    const isFirstRender = useRef(true);

    const isFormVazio = (form) => {
        const camposConsiderados = {
            recurso: form.recurso,
            metodo_a: form.metodo_a,
            plano_a: form.plano_a,
            valor_a: form.valor_a,
            data_esperada: form.data_esperada,
            data_limite: form.data_limite,
            metodo_b: form.metodo_b,
            plano_b: form.plano_b,
            valor_b: form.valor_b,
        }
        const emptyFields = Object.entries(camposConsiderados).filter(([key, value]) => !value);
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };

    const handleAreaChange = (e) => {
        setAreaSelecionada(e.target.value);
        const areaSelect = e.target.value;
        const itensDaArea = recursos.filter(item => item.area === areaSelect).map(item => item.recurso);
        setRecursosPorArea(itensDaArea);
    };

    const handleRecursoChange = (e) => {
        const recursoSelecionado = e.target.value;
        const dados = recursos.filter(item => item.recurso === recursoSelecionado)[0];
        objSetter({
            ...obj,
            area: dados.area,
            ehEssencial: dados.ehEssencial, 
            recurso: recursoSelecionado
        })
        e.target.classList.remove('campo-vazio');
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        const index = emptyFields.indexOf(name);
        index > -1 && emptyFields.splice(index, 1);
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        const [isEmpty, camposVazios] = isFormVazio(obj);
        if (isEmpty) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
            });
            setEmptyFields(camposVazios);
            checkDados('inputsVazios');
            return true;
        }
    };

    const handleSubmit = async (e) => {
        const isInvalido = validaDados();
        if (funcao.funcao1) {
            !isInvalido && funcao.funcao1();
            return;
        } else {
            !isInvalido && funcao(e);
        }
    };

    return (
        <tr className='linha-cadastro'>
            <td>
                <select
                    name="area"
                    onChange={handleAreaChange}
                    value={areaSelecionada}
                >
                    <option value="" disabled>Area</option>
                    {[...new Set(recursos.map(item => item.area))].map((area, index) => (
                        <option key={index} value={area}>{area}</option>
                    ))};
                    <option value="Others">Others</option>
                </select>

                <select
                    style={{ marginTop: '0.3rem' }}
                    value={obj.recurso}
                    name='recurso'
                    onChange={handleRecursoChange}
                    ref={el => (camposRef.current.recurso = el)}
                >
                    <option defaultValue value=''>Resource</option>
                    {recursosPorArea.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                </select>
            </td>
            <td>
                <select
                    value={obj.metodo_a}
                    name='metodo_a'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.metodo_a = el)} >
                    <option defaultValue value=''>Acquisition method</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Rental">Rental</option>
                    <option value="Borrowing">Borrowing</option>
                    <option value="Outsourcing">Outsourcing</option>
                </select>
            </td>
            <td>
                <input type='text'
                    value={obj.plano_a}
                    name='plano_a'
                    placeholder='Supplier'
                    onChange={handleChange}
                    ref={el => (camposRef.current.plano_a = el)} />
            </td>
            <td>
                <input type='number'
                    value={obj.valor_a}
                    name='valor_a'
                    placeholder='Value'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.valor_a = el)} />
            </td>
            <td>
                <input
                    value={obj.data_esperada}
                    name='data_esperada'
                    type="date"
                    onChange={handleChange}
                    ref={el => (camposRef.current.data_esperada = el)} />
            </td>
            <td>
                <input
                    value={obj.data_limite}
                    name='data_limite'
                    type="date"
                    onChange={handleChange}
                    ref={el => (camposRef.current.data_limite = el)} />
            </td>
            <td>
                <select
                    value={obj.metodo_b}
                    name='metodo_b'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.metodo_b = el)} >
                    <option defaultValue value=''>Acquisition method</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Rental">Rental</option>
                    <option value="Borrowing">Borrowing</option>
                    <option value="Outsourcing">Outsourcing</option>
                </select>
            </td>
            <td>
                <input type='text'
                    value={obj.plano_b}
                    name='plano_b'
                    placeholder='Supplier'
                    onChange={handleChange}
                    ref={el => (camposRef.current.plano_b = el)} />
            </td>
            <td>
                <input type='number'
                    value={obj.valor_b}
                    name='valor_b'
                    placeholder='Value'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.valor_b = el)} />
            </td>
            <td>
                <input type='text'
                    value={obj.plano_real}
                    name='plano_real'
                    placeholder='Actual strategy'
                    onChange={handleChange}
                    ref={el => (camposRef.current.plano_real = el)} />
            </td>
            <td>
                <input
                    value={obj.data_real}
                    name='data_real'
                    type="date"
                    onChange={handleChange}
                    ref={el => (camposRef.current.data_real = el)} />
            </td>
            <td>
                <input type='number'
                    value={obj.valor_real}
                    name='valor_real'
                    placeholder='Value'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.valor_real = el)} />
            </td>
            <td>-</td>
            <td>-</td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={(e) => handleSubmit(e)} disabled={!isAdmin}>Add new</button>
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