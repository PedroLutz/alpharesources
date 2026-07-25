import React, { useState, useRef, useEffect } from 'react';
import styles from '../../../../../styles/modules/wbs.module.css'
import usePerm from '../../../../../hooks/usePerm';
import { useDictionary } from '../data/DictionaryContext';

const Inputs = ({ obj, objSetter, tipo, funcoes, setExibirModal, area_id, backgroundColor }) => {
    const { isEditor } = usePerm();

    const {areasSet, itensSet, elementosWBS, isLoading} = useDictionary();

    const [itensPorArea, setItensPorArea] = useState([]);
    const [areasUnicas, setAreasUnicas] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState(area_id ?? '');
    const camposRef = useRef({
        item_id: null,
        description: null,
        purpose: null,
        criteria: null,
        inspection: null,
        timing: null,
        responsible: null,
        approval_responsible: null,
        premises: null,
        restrictions: null,
        resources: null
    });

    const checkItemDisponivel = (item_id) => {
        if (itensSet.size == 0) {
            return true;
        }

        return !itensSet.has(item_id);
    }

    const checkAreaDisponivel = (area_id, item_id) => {
        if (areasSet.size == 0) {
            return true;
        }

        if (areasSet.has(area_id)) {
            return checkItemDisponivel(item_id);
        }

        return true;
    }

    const getAreas = () => [...new Map(
                elementosWBS
                ?.filter(item => checkAreaDisponivel(item.wbs_area.id, item.id))
                ?.map(item => [
                    item.wbs_area.id, 
                    { id: item.wbs_area.id, name: item.wbs_area.name }])
            ).values()
        ]

    //esse useEffect só roda na primeira render
    useEffect(() => {
        if (!isLoading){
            setAreasUnicas(getAreas())
        }   
    }, [isLoading]);

    const atualizarItensPorArea = (area) => {
        const itensDaArea = elementosWBS?.filter(item => item.wbs_area.id == area
            && checkItemDisponivel(item.id));
        setItensPorArea(itensDaArea);
    }

    useEffect(() => {
        if (!areaSelecionada) return;
        atualizarItensPorArea(areaSelecionada);
    }, [areaSelecionada, elementosWBS])

    const handleAreaChange = (e) => {
        objSetter({ ...obj, item_id: "" });
        const areaSelecionada = e.target.value;
        setAreaSelecionada(areaSelecionada);
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
        const { id, user_id, ...camposConsiderados } = obj;

        const camposVazios = Object.keys(camposConsiderados).filter(
            key => camposConsiderados[key] === null || camposConsiderados[key] === ""
        )

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');
            });
            setExibirModal('inputsVazios');
            return false;
        }

        return true;
    }


    //essa funcao se responsabiliza por executar o handleSubmit de acordo
    //com o tipo de funcao recebida, executando apenas se os dados sao validos
    const handleSubmit = async () => {
        const isValid = validaDados();
        if (!isValid) return;
        await funcoes?.enviar();
        setAreaSelecionada(area_id ?? '');
    };

    return (
        <tr>
            {tipo != "update" &&
                <>
                    <td className={styles.td_area}>
                        <select
                            name="area"
                            onChange={handleAreaChange}
                            value={areaSelecionada}
                            ref={el => (camposRef.current.area = el)}
                        >
                            <option value="" defaultValue>Area</option>
                            {areasUnicas.map((area, index) => (
                                <option key={index} value={area.id}>{area.name}</option>
                            ))};
                        </select>
                    </td>
                    <td className={styles.td_item}>
                        <select
                            value={obj.item_id}
                            name='item_id'
                            onChange={handleChange}
                            ref={el => (camposRef.current.item = el)}
                        >
                            <option value="" defaultValue>Item</option>
                            {itensPorArea.map((item, index) => (
                                <option key={index} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </td>

                </>
            }

            <td className={styles.td_descricao}>
                <textarea type='text'
                    value={obj.description}
                    name='description'
                    placeholder='Description'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.description = el)}
                />
            </td>
            <td className={styles.td_proposito}>
                <textarea type='text'
                    value={obj.purpose}
                    name='purpose'
                    placeholder='Purpose'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.purpose = el)} />
            </td>
            <td className={styles.td_premissas}>
                <textarea type='text'
                    value={obj.premises}
                    name='premises'
                    placeholder='Premises'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.premises = el)} />
            </td>
            <td className={styles.td_restricoes}>
                <textarea type='text'
                    value={obj.restrictions}
                    name='restrictions'
                    placeholder='Restrictions'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.restrictions = el)} />
            </td>
            <td className={styles.td_recursos}>
                <textarea type='text'
                    value={obj.resources}
                    name='resources'
                    placeholder='Expected Resources'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.resources = el)} />
            </td>
            <td className={styles.td_criterio}>
                <textarea type='text'
                    value={obj.criteria}
                    name='criteria'
                    placeholder='Acceptance criteria'
                    onChange={handleChange}
                    min="0"
                    ref={el => (camposRef.current.criteria = el)} />
            </td>
            <td className={styles.td_verificacao}>
                <textarea
                    type="text"
                    value={obj.inspection}
                    name='inspection'
                    placeholder='Verification'
                    onChange={handleChange}
                    ref={el => (camposRef.current.inspection = el)} />
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
                    value={obj.responsible}
                    name='responsible'
                    placeholder='Responsible'
                    onChange={handleChange}
                    ref={el => (camposRef.current.responsible = el)} />
            </td>
            <td className={styles.td_responsavel_aprovacao}>
                <textarea
                    type="text"
                    value={obj.approval_responsible}
                    name='approval_responsible'
                    placeholder='Responsible for Approval'
                    onChange={handleChange}
                    ref={el => (camposRef.current.approval_responsible = el)} />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined} style={{backgroundColor: tipo === "submit" && "white"}}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isEditor}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit} disabled={!isEditor}>✔️</button>
                        <button onClick={funcoes?.cancelar}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </tr>
    )
}

export default Inputs;