import React, { useState, useRef, useEffect, useContext } from 'react';
import { fetchData } from '../../../functions/crud';
import { AuthContext } from '../../../contexts/AuthContext';

const CadastroTabela = ({ obj, objSetter, tipo, funcao, checkDados }) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const [elementosWBS, setElementosWBS] = useState([]);
    const [nomesMembros, setNomesMembros] = useState([])
    const [itensPorArea, setItensPorArea] = useState([]);
    const camposRef = useRef({
        area: null,
        item: null,
        responsabilidades: null,
    });
    const {isAdmin} = useContext(AuthContext)

    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };

    useEffect(() => {
        if (obj.area) {
            const itensDaArea = elementosWBS.filter(item => item.area === obj.area).map(item => item.item);
            setItensPorArea(itensDaArea);
        }
    }, [obj.area, elementosWBS]);

    useEffect(() => {
        if(tipo === 'cadastro'){
            objSetter({
                ...obj,
                item: ''
            });
        }
    }, [obj.area]);


    const handleAreaChange = (e) => {
        const areaSelecionada = e.target.value;
        const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionada).map(item => item.item);
        setItensPorArea(itensDaArea);

        handleChange(e, objSetter, obj);
    };

    const isFormVazio = (form) => {
        const emptyFields = Object.entries(form).filter(([key, value]) => !value);
        return [emptyFields.length > 1, emptyFields.map(([key]) => key)];
    };

    const handleChange = (e, setter, obj) => {
        const { name, value } = e.target;
        const index = emptyFields.indexOf(name);
        index > -1 && emptyFields.splice(index, 1);
        setter({
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
            if(Object.keys(obj).length < inputNames.length + 3){
                
                setEmptyFields(camposVazios);
                checkDados('inputsVazios');
                return true;
            }
        }
    }

    const handleSubmit = async (e) => {
        const isInvalido = validaDados();
        if (funcao.funcao1) {
            !isInvalido && funcao.funcao1();
            return;
        } else {
            !isInvalido && funcao(e);
        }
    };

    const fetchNomesMembros = async () => {
        const data = await fetchData('responsabilidades/membros/get/nomes');
        setNomesMembros(data.nomes);
    };

    const generateInputNames = () => {
        const firstNames = new Map();
        const fullNames = [];
        const inputNames = [];

        nomesMembros.forEach((membro) => {
            const nomeCompleto = membro.nome;
            const firstName = nomeCompleto.split(' ')[0];
            const lastName = nomeCompleto.split(' ')[1];
            const corrigirNomeCompleto = () => {
                let index = fullNames.findIndex(x => x.includes(firstName));
                let otherLastName = fullNames[index].split(' ')[1];
                inputNames[index] = `${firstName} ${otherLastName}`;
            };

            if (firstNames.has(firstName)) {
                const existingHeader = firstNames.get(firstName);
                inputNames.push(`${existingHeader} ${lastName}`);
                fullNames.push(`${firstName} ${lastName}`);
                corrigirNomeCompleto();
            } else {
                firstNames.set(firstName, nomeCompleto.split(' ')[0]);
                inputNames.push(firstName);
                fullNames.push(`${firstName} ${lastName}`);
            };
        });
        return inputNames;
    };

    const getCleanName = (str) => {
        const removeAccents = (str) => {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };
        return removeAccents(str.split(" ").join(""));
    };
    const inputNames = generateInputNames();

    const generateFormData = () => {
        inputNames.forEach((membro) => {
            objSetter(({
                ...obj,
                [`input${getCleanName(membro)}`]: ''
            }));
        });
    };

    

    useEffect(() => {
        fetchNomesMembros();
        fetchElementos();
        generateFormData();
    }, []);

    return (
        <React.Fragment>
            {tipo !== 'update' && (
                <td>
                    <select
                        name="area"
                        onChange={handleAreaChange}
                        value={obj.area}
                        ref={el => (camposRef.current.area = el)}

                    >
                        <option value="" disabled>Area</option>
                        {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                            <option key={index} value={area}>{area}</option>
                        ))};
                    </select>
                </td>
            )}
            {tipo !== 'update' && (
                <td>
                    <select
                        value={obj.item}
                        name='item'
                        onChange={(e) => handleChange(e, objSetter, obj)}
                        ref={el => (camposRef.current.item = el)}
                    >
                        <option value="" disabled>Item</option>
                        {itensPorArea.map((item, index) => (
                            <option key={index} value={item}>{item}</option>
                        ))}
                    </select>
                </td>
            )}
            {inputNames.map((membro, index) => (
                <td key={index} className="mini-input column">
                    <select
                        type="text"
                        id={"input" + getCleanName(membro)}
                        name={"input" + getCleanName(membro)}
                        placeholder=""
                        onChange={(e) => handleChange(e, objSetter, obj)}
                        defaultValue={""}
                        value={obj["input" + getCleanName(membro)]}
                        required
                    >
                        <option value="" disabled>RACI</option>
                        <option value="R">R</option>
                        <option value="A">A</option>
                        <option value="C">C</option>
                        <option value="I">I</option>
                    </select>
                </td>
            ))}
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
        </React.Fragment>
    )
}

export default CadastroTabela;