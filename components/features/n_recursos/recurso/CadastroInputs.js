import { useEffect, useState, useRef } from "react";
import React from "react";
import styles from '../../../../styles/modules/recursos.module.css'
import { handleFetch } from '../../../../functions/crud_s';
import useAuth from '../../../../hooks/useAuth';

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal, isEditor }) => {
    const [elementosWBS, setElementosWBS] = useState([]);
    const [itensPorArea, setItensPorArea] = useState([]);
    const [areaSelecionada, setAreaSelecionada] = useState('');
    const [areas, setAreas] = useState([]);
    const camposRef = useRef({
        area: null,
        item_id: null,
        resource: null,
        usage: null,
        type: null,
        is_essential: null
    });
    const isFirstRender = useRef(true);
    const { token } = useAuth();

    //funcao que busca no banco os elementos da WBS
    const fetchElementos = async () => {
        var elementos;
        try {
            const data = await handleFetch({
                table: 'wbs_item',
                query: 'with_areas',
                token
            })
            elementos = data?.data ?? [];
        } finally {
            setAreas([...new Map(
                elementos
                    .map(item => [
                        item.wbs_area.id,
                        { id: item.wbs_area.id, name: item.wbs_area.name }])
            ).values()
            ]);
            setElementosWBS(elementos);
        }
    };


    //useEffect q so roda no primeiro render
    useEffect(() => {
        fetchElementos();
    }, []);

    const atualizarItensPorArea = (area) => {
        var itensDaArea;
        if(area != -1) {
            itensDaArea = elementosWBS.filter(item => item.wbs_area.id == area);
        } else {
            itensDaArea = [{id: -1, name: 'Others'}]
        }
        setItensPorArea(itensDaArea);
    }

    useEffect(() => {
        if (obj.area != '') {
            atualizarItensPorArea(obj.area);
        }
    }, [obj.area, elementosWBS])

    useEffect(() => {
            if (areaSelecionada != '') {
                atualizarItensPorArea(areaSelecionada, setItensPorArea);
            }
    }, [areaSelecionada, elementosWBS]);

    useEffect(() => {
            if (obj?.item_id !== undefined) {
                const item = elementosWBS.find(item => item.id == obj?.item_id);
                if(item){
                    const areaSelecionada = item.wbs_area.id;
                    setAreaSelecionada(areaSelecionada);
                    atualizarItensPorArea(areaSelecionada, setItensPorArea);
                    objSetter({
                        ...obj,
                        item_id: obj.item_id
                    })
                }
            } else {
                setAreaSelecionada(-1);
                setItensPorArea([{id: -1, name: 'Others'}]);
                objSetter({
                        ...obj,
                        item_id: -1
                    })
            }
        }, [obj?.item_id, elementosWBS]);

    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        objSetter({ ...obj, item_id: "" });
        setAreaSelecionada(areaSelecionada);
        if(areaSelecionada != -1){
            atualizarItensPorArea(areaSelecionada, setItensPorArea);
        } else {
            setItensPorArea([{id: -1, name: 'Others'}]);
        }
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
    };


    //funcao que detecta se os dados sao validos, e se sao, utiliza a funcao de submit
    const handleSubmit = async () => {
        const isInvalido = validaDados();
        if (isInvalido) return;
        funcoes?.enviar();
        setAreaSelecionada("");
        setItensPorArea([]);
    };

    return (
        <tr className={`linha-cadastro ${styles.camposMaiores}`}>
            <td>
                <select
                    name="area"
                    onChange={handleAreaChange}
                    value={areaSelecionada}
                    ref={el => (camposRef.current.area = el)}
                >
                    <option value="" defaultValue>Area</option>
                    {areas.map((area, index) => (
                        <option key={index} value={area.id}>{area.name}</option>
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
                    {itensPorArea.map((item, index) => (
                        <option key={index} value={item.id}>{item.name}</option>
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