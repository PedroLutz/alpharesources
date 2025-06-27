import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";
import styles from '../../../styles/modules/planoAquisicao.module.css'

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const [areaSelecionada, setAreaSelecionada] = useState("");
    const [recursos, setRecursos] = useState([]);
    const [recursosPorArea, setRecursosPorArea] = useState([]);
    const camposRef = useRef({
        recurso: null,
        metodo_a: null,
        plano_a: null,
        detalhes_a: null,
        valor_a: null,
        data_esperada: null,
        data_limite: null,
        metodo_b: null,
        plano_b: null,
        detalhes_b: null,
        valor_b: null,
        plano_real: null,
        data_real: null,
        valor_real: null
    });
    const {isAdmin} = useContext(AuthContext);
    const isFirstRender = useRef(true);

    //funcao para buscar os nome dos recursos
    const fetchRecursos = async () => {
        const data = await fetchData('recursos/recurso/get/nomesRecursos');
        setRecursos(data.recursos);
        var todosOsRecursos = [];
        data.recursos.forEach((recurso) => {
            todosOsRecursos.push([recurso.recurso])
        })
        setRecursosPorArea(todosOsRecursos);
    };

    //useEffect que usa apenas na primeira render
    useEffect(() => {
        fetchRecursos();
    }, []);

    
    //useEffect que so roda quando areaSelecionada eh atualizado, para apagar o valor de recurso no obj
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

    //funcao apenas quando area eh atualizada, e atualiza os recursos do select para serem apenas os da area
    const handleAreaChange = (e) => {
        setAreaSelecionada(e.target.value);
        const areaSelect = e.target.value;
        const itensDaArea = recursos.filter(item => item.area === areaSelect).map(item => item.recurso);
        setRecursosPorArea(itensDaArea);
    };


    //funcao apenas quando recurso eh atualizado, inserindo no obj os dados de ehEssencial
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

    //funcao geral para inserir os dados dos inputs no obj
    const handleChange = (e, isNumber) => {
        var { name, value } = e.target;
        if(isNumber){
            value = value.replace(/[^0-9.]/g, '');
        }
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    //funcao para validar os dados do objeto
    const validaDados = () => {
        if(obj.data_esperada > obj.data_limite){
            camposRef.current.data_esperada.classList.add('campo-vazio');
            camposRef.current.data_limite.classList.add('campo-vazio');
            setExibirModal('datasSemSentido');
            return true;
        }
        const camposConsiderados = { ...obj };
        delete camposConsiderados.plano_real;
        delete camposConsiderados.valor_real;
        delete camposConsiderados.data_real;
        const camposVazios = Object.entries(camposConsiderados)
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
    };

    //funcao que chama validaDados, e se os dados estao ok, chama as funcoes de submit
    const handleSubmit = async (e) => {
        const isInvalido = validaDados();
        if(isInvalido) return;
        funcoes?.enviar();
    };

    return (
        <tr className={`linha-cadastro ${styles.camposMaiores}`}>
            <td className={styles.campo_recurso}>
                <select
                    name="area"
                    onChange={handleAreaChange}
                    value={areaSelecionada}
                >
                    <option value="" defaultValue>Area</option>
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
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.metodo_a = el)} >
                    <option defaultValue value=''>Acquisition method</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Rental">Rental</option>
                    <option value="Borrowing">Borrowing</option>
                    <option value="Outsourcing">Outsourcing</option>
                </select>
            </td>
            <td>
                <textarea type='text'
                    value={obj.plano_a}
                    name='plano_a'
                    placeholder='Supplier'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.plano_a = el)} />
            </td>
            <td>
                <textarea type='text'
                    value={obj.detalhes_a}
                    name='detalhes_a'
                    placeholder='Details'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.detalhes_a = el)} />
            </td>
            <td>
                <input
                    value={obj.valor_a}
                    name='valor_a'
                    placeholder='Value'
                    onChange={(e) => handleChange(e, true)}
                    min="0"
                    ref={el => (camposRef.current.valor_a = el)} />
            </td>
            <td>
                <input
                    value={obj.data_esperada}
                    name='data_esperada'
                    type="date"
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.data_esperada = el)} />
            </td>
            <td>
                <input
                    value={obj.data_limite}
                    name='data_limite'
                    type="date"
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.data_limite = el)} />
            </td>
            <td>
                <select
                    value={obj.metodo_b}
                    name='metodo_b'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.metodo_b = el)} >
                    <option defaultValue value=''>Acquisition method</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Rental">Rental</option>
                    <option value="Borrowing">Borrowing</option>
                    <option value="Outsourcing">Outsourcing</option>
                </select>
            </td>
            <td>
                <textarea type='text'
                    value={obj.plano_b}
                    name='plano_b'
                    placeholder='Supplier'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.plano_b = el)} />
            </td>
            <td>
                <textarea type='text'
                    value={obj.detalhes_b}
                    name='detalhes_b'
                    placeholder='Details'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.detalhes_b = el)} />
            </td>
            <td>
                <input
                    value={obj.valor_b}
                    name='valor_b'
                    placeholder='Value'
                    onChange={(e) => handleChange(e, true)}
                    min="0"
                    ref={el => (camposRef.current.valor_b = el)} />
            </td>
            <td>
                <textarea type='text'
                    value={obj.plano_real}
                    name='plano_real'
                    placeholder='Actual strategy'
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.plano_real = el)} />
            </td>
            <td>
                <input
                    value={obj.data_real}
                    name='data_real'
                    type="date"
                    onChange={(e) => handleChange(e, false)}
                    ref={el => (camposRef.current.data_real = el)} />
            </td>
            <td>
                <input type='number'
                    value={obj.valor_real}
                    name='valor_real'
                    placeholder='Value'
                    onChange={(e) => handleChange(e, true)}
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
                        <button onClick={funcoes?.cancelar}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </tr>
    )
}

export default CadastroInputs;