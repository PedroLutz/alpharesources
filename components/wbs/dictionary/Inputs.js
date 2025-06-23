import React, { useState, useRef, useEffect, useContext } from 'react';
import { fetchData } from '../../../functions/crud';
import { AuthContext } from '../../../contexts/AuthContext';
import styles from '../../../styles/modules/wbs.module.css'

const Inputs = ({ obj, objSetter, tipo, funcoes, setExibirModal }) => {
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState([]);
    const camposRef = useRef({
        area: null,
        item: null,
        descricao: null,
        criterio: null,
        verificacao: null,
        proposito: null,
        timing: null,
        responsavel: null,
        responsavel_aprovacao: null,
        premissas: null,
        restricoes: null,
        recursos: null
    });
    const { isAdmin } = useContext(AuthContext);
    const isFirstRender = useRef(true);

    //essa funcao busca os itens da wbs
    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };

    //esse useEffect só roda na primeira render
    useEffect(() => {
        fetchElementos();
    }, []);

    //esse useEffect só rorda quando a area do obj é alterada, e garante que, quando a area é alterada,
    //o campo 'item' tenha seu valor apagado, evitando mistura de itens com areas a qual n pertecem
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

    const atualizarItensPorArea = (area) => {
        const itensDaArea = elementosWBS.filter(item => item.area === area).map(item => item.item);
        setItensPorArea(itensDaArea);
    }

    useEffect(() => {
        if (obj.area != '') {
            atualizarItensPorArea(obj.area);
        }
    }, [obj.area, elementosWBS])

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        atualizarItensPorArea(areaSelecionada);
        handleChange(e);
    };

    //essa funcao atualiza o estado de qualquer campo, quando ele tem seu valor alterado no input
    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    //essa funcao verifica os casos de invalidez, e se algum deles for verdadeiro,
    //chama a funcao setExibirModal para levantar um modal avisando o problema
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


    //essa funcao se responsabiliza por executar o handleSubmit de acordo
    //com o tipo de funcao recebida, executando apenas se os dados sao validos
    const handleSubmit = async () => {
        const isInvalido = validaDados();
        if (isInvalido) return;
        await funcoes?.enviar();
    };

    return (
        <tr className='linha-cadastro'>
            <td className={styles.td_area}>
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
                </select>
            </td>
            <td className={styles.td_item}>
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
                </select>
            </td>
            <td className={styles.td_descricao}>
                <textarea type='text'
                    value={obj.descricao}
                    name='descricao'
                    placeholder='Description'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.descricao = el)}
                />
            </td>
            <td className={styles.td_proposito}>
                <textarea type='text'
                    value={obj.proposito}
                    name='proposito'
                    placeholder='Purpose'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.proposito = el)} />
            </td>
            <td className={styles.td_premissas}>
                <textarea type='text'
                    value={obj.premissas}
                    name='premissas'
                    placeholder='Premises'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.premissas = el)} />
            </td>
            <td className={styles.td_restricoes}>
                <textarea type='text'
                    value={obj.restricoes}
                    name='restricoes'
                    placeholder='Restrictions'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.restricoes = el)} />
            </td>
            <td className={styles.td_recursos}>
                <textarea type='text'
                    value={obj.recursos}
                    name='recursos'
                    placeholder='Expected Resources'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.recursos = el)} />
            </td>
            <td className={styles.td_criterio}>
                <textarea type='text'
                    value={obj.criterio}
                    name='criterio'
                    placeholder='Acceptance criteria'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.criterio = el)} />
            </td>
            <td className={styles.td_verificacao}>
                <textarea
                    type="text"
                    value={obj.verificacao}
                    name='verificacao'
                    placeholder='Verification'
                    onChange={handleChange}
                    ref={el => (camposRef.current.verificacao = el)} />
            </td>
            <td className={styles.td_timing}>
                <textarea
                    type="text"
                    value={obj.timing}
                    name='timing'
                    placeholder='Timing'
                    onChange={handleChange}
                    ref={el => (camposRef.current.timing = el)} />
            </td>
            <td className={styles.td_responsavel}>
                <textarea
                    type="text"
                    value={obj.responsavel}
                    name='responsavel'
                    placeholder='Responsible'
                    onChange={handleChange}
                    ref={el => (camposRef.current.responsavel = el)} />
            </td>
            <td className={styles.td_responsavel_aprovacao}>
                <textarea
                    type="text"
                    value={obj.responsavel_aprovacao}
                    name='responsavel_aprovacao'
                    placeholder='Responsible for Approval'
                    onChange={handleChange}
                    ref={el => (camposRef.current.responsavel_aprovacao = el)} />
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

export default Inputs;