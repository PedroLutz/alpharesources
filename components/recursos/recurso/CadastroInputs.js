import { useEffect, useState, useRef, useContext } from "react";
import React from "react";
import { fetchData } from "../../../functions/crud";
import { AuthContext } from "../../../contexts/AuthContext";
import styles from '../../../styles/modules/recursos.module.css'

const CadastroInputs = ({ obj, objSetter, funcao, tipo, setExibirModal }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState([]);
    const camposRef = useRef({
        area: null,
        item: null,
        recurso: null,
        uso: null,
        tipo: null,
        ehEssencial: null
    });
    const {isAdmin} = useContext(AuthContext);
    const isFirstRender = useRef(true);

    //funcao que busca no banco os elementos da WBS
    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };


    //useEffect q so roda no primeiro render
    useEffect(() => {
        fetchElementos();
    }, []);


    //useEffect que so roda quando obj.area atualiza, que reseta o valor de item
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        objSetter({
            ...obj,
            item: ''
        });
    }, [obj.area]);


    //funcao que retorna true se houver algum campo vazio e os nomes dos campos vazios 
    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => value === null || value === '');
        return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
    };


    //funcao que insere no array itensPorArea os itens relacionados à area relacionada
    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionada).map(item => item.item);
        setItensPorArea(itensDaArea);

        handleChange(e, objSetter, obj);
    };


    //funcao que insere no obj oo valor dos inputs
    const handleChange = (e) => {
        const { name, value } = e.target
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };


    //funcao que valida os dados, verificando quais campos estao vazios e inserindo a classe campo-vazio para destacá-los
    const validaDados = () => {
        const [isEmpty, camposVazios] = isFormVazio(obj);
        if (isEmpty) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
            });
            setEmptyFields(camposVazios);
            setExibirModal('inputsVazios');
            return true;
        }
    };


    //funcao que detecta se os dados sao validos, e se sao, utiliza a funcao de submit
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
        <tr className={`linha-cadastro ${styles.camposMaiores}`}>
            <td>
                <select
                    name="area"
                    onChange={handleAreaChange}
                    value={obj.area}
                    ref={el => (camposRef.current.area = el)}
                >
                    <option value="" defaultValue>Area</option>
                    {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                        <option key={index} value={area}>{area}</option>
                    ))};
                    <option value="Others">Others</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.item}
                    name='item'
                    onChange={handleChange}
                    ref={el => (camposRef.current.item = el)}

                >
                    <option value="" defaultValue>Item</option>
                    {itensPorArea.map((item, index) => (
                        <option key={index} value={item}>{item}</option>
                    ))}
                    <option value="Others">Others</option>
                </select>
            </td>
            <td>
                <input type='text'
                    value={obj.recurso}
                    name='recurso'
                    placeholder='Resource'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.recurso = el)} />
            </td>
            <td>
                <input type='text'
                    value={obj.uso}
                    name='uso'
                    placeholder='Use'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.uso = el)} />
            </td>
            <td>
                <select
                    value={obj.tipo}
                    name='tipo'
                    onChange={handleChange}
                    className={styles.campo_tipo}
                    ref={el => (camposRef.current.tipo = el)} >
                    <option value="" defaultValue>Type</option>
                    <option value="Financial">Financial</option>
                    <option value="Physical">Physical</option>
                    <option value="Human">Human</option>
                </select>
            </td>
            <td>
                -
            </td>
            <td>
                <select
                    value={obj.ehEssencial}
                    name='ehEssencial'
                    onChange={handleChange}
                    className={styles.campo_ehEssencial}
                    ref={el => (camposRef.current.ehEssencial = el)} >
                    <option value="" defaultValue>-</option>
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                </select>
            </td>
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
