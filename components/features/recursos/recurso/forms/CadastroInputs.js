import { useState, useRef } from "react";
import React from "react";
import styles from '../../../../../styles/modules/recursos.module.css'
import usePerm from "../../../../../hooks/usePerm";
import { useRecurso } from "../RecursoContext";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal, backgroundColor }) => {
    const { areas, itensPorArea} = useRecurso();
    const [areaSelecionada, setAreaSelecionada] = useState();
    const camposRef = useRef({
        area: null,
        item_id: null,
        resource: null,
        usage: null,
        type: null,
        is_essential: null
    });
    const { isEditor } = usePerm();

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        objSetter({ ...obj, item_id: "" });
        setAreaSelecionada(Number(areaSelecionada));
        camposRef.current.area.classList.remove('campo-vazio');
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
        const camposVazios = Object.keys(obj).filter(
            key => obj[key] === null || obj[key] === ""
        );

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');
            });
            setExibirModal('inputsVazios');
            return true;
        }

        return false;
    };


    //funcao que detecta se os dados sao validos, e se sao, utiliza a funcao de submit
    const handleSubmit = async () => {
        const isInvalido = validaDados();
        if (isInvalido) return;
        funcoes?.enviar();
        setAreaSelecionada();
    };

    return (
        <tr className={`linha-cadastro ${styles.camposMaiores}`} style={{backgroundColor}}>
            <td>
                <select
                    name="area"
                    onChange={handleAreaChange}
                    value={areaSelecionada}
                    ref={el => (camposRef.current.area = el)}
                >
                    <option value="" defaultValue>Area</option>
                    {areas.map((area, index) => (
                        <option key={index} value={area[0]}>{area[1]}</option>
                    ))}
                    <option value={-1}>Others</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.item_id}
                    name='item_id'
                    onChange={handleChange}
                    ref={el => (camposRef.current.item = el)}

                >
                    <option value="" defaultValue>Item</option>
                    {itensPorArea.get(areaSelecionada)?.map((item, _) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                </select>
            </td>
            <td>
                <input type='text'
                    value={obj.resource}
                    name='resource'
                    placeholder='Resource'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.resource = el)} />
            </td>
            <td>
                <input type='text'
                    value={obj.usage}
                    name='usage'
                    placeholder='Usage'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.usage = el)} />
            </td>
            <td>
                <select
                    value={obj.type}
                    name='type'
                    onChange={handleChange}
                    className={styles.campo_tipo}
                    ref={el => (camposRef.current.type = el)} >
                    <option value="" defaultValue>Type</option>
                    <option value="financial">Financial</option>
                    <option value="physical">Physical</option>
                    <option value="human">Human</option>
                </select>
            </td>
            <td>
                -
            </td>
            <td>
                <select
                    value={obj.is_essential}
                    name='is_essential'
                    onChange={handleChange}
                    className={styles.campo_ehEssencial}
                    ref={el => (camposRef.current.is_essential = el)} >
                    <option value="" defaultValue>-</option>
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                </select>
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={(e) => handleSubmit(e)} disabled={!isEditor}>Add new</button>
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