import { useState, useRef } from "react";
import React from "react";
import styles from '../../../../../styles/modules/responsabilidades.module.css'
import usePerm from "../../../../../hooks/usePerm";
import { useFuncoes } from "../data/FuncoesContext";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const {nomesMembros, areas} = useFuncoes();
    const [areaEscrita, setAreaEscrita] = useState(''); 
    const camposRef = useRef({
        role: null,
        description: null,
        skills: null,
        member_id: null,
        area: null,
    })
    const {isEditor} = usePerm();

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
        if(funcoes?.isFuncaoCadastrada?.(obj.role) ?? false){
            camposRef.current.role.classList.add('campo-vazio');
            setExibirModal('funcaoRepetida');
            return false;
        }

        const camposVazios = Object.keys(obj).filter(key => obj[key] === null || obj[key] === "");

        if(obj?.areas?.length == 0){
            camposVazios.push('area');
        }

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');
            });
            setExibirModal('inputsVazios');
            return false;
        }

        return true;
    }

    const handleSubmit = async () => {
        const isValid = validaDados();
        if(!isValid) return;
        await funcoes?.enviar();
    }

    const addToAreaArray = () => {
        if(obj.areas.some(a => a == areaEscrita)) return;
        if(areaEscrita == '') return;
        objSetter(prev => ({
            ...prev,
            areas: [...prev.areas, areaEscrita]
        }));
        setAreaEscrita('');
        camposRef.current.area.classList.remove('campo-vazio');
    }

    const AreaModal = ({area, index}) => {
        const popFromArray = () => {
            var arr = [];
            obj.areas.forEach(a => {
                if(a != index){
                    arr.push(a);
                }
            })
            objSetter(prev => ({
                    ...prev,
                    areas: arr
                }));
        }

        return (
            <div key={index} className={styles.areaContainer}>
                {area}
                <button onClick={popFromArray}>✕</button>
            </div>
        )
    }

    return (
        <tr>
            <td className={styles.funcoesTdFuncao}>
                <textarea
                    name="role"
                    onChange={handleChange}
                    value={obj.role}
                    placeholder="Role"
                    ref={el => (camposRef.current.role = el)}
                />
            </td>
            <td className={styles.funcoesTdDescricao}>
                <textarea
                    name="description"
                    onChange={handleChange}
                    value={obj.description}
                    placeholder="Description"
                    ref={el => (camposRef.current.description = el)}
                />
            </td>
            <td className={styles.funcoesTdHabilidade}>
                <textarea
                    name="skills"
                    onChange={handleChange}
                    value={obj.skills}
                    placeholder="Skill requirements"
                    ref={el => (camposRef.current.skills = el)}
                />
            </td>
            <td>
                <select
                    name="member_id"
                    onChange={handleChange}
                    value={obj.member_id}
                    ref={el => (camposRef.current.member_id = el)}
                >
                    <option defaultValue value="">Responsible</option>
                    {nomesMembros.map((membro, index) => (
                        <option key={index} value={membro.id}>{membro.name}</option>
                    ))}
                </select>
            </td>
            <td className={styles.areaTd}>
                <div className={styles.inputsDiv}>
                    <select
                        name="area"
                        onChange={(e) => setAreaEscrita(e.target.value)}
                        value={areaEscrita || ''}
                        ref={el => (camposRef.current.area = el)}

                    >
                        <option value="" defaultValue>Area</option>
                        {areas.map((area, index) => (
                            <option key={index} value={area.id}>{area.name}</option>
                        ))};
                    </select>
                    <button onClick={addToAreaArray}>➕</button>
                </div>
                <div className={styles.areaDiv}>
                    {obj.areas.map((a, index) => (
                    <AreaModal
                        key={index}
                        area={areas?.find(ar => ar.id == a)?.name || ''}
                        index={a}
                    />
                ))}
                </div>
                
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isEditor}>Add new</button>
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