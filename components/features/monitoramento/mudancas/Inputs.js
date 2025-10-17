import { useState, useRef, useEffect } from "react";
import React from "react";
import { handleFetch } from "../../../../functions/crud_s";
import styles from '../../../../styles/modules/monitoramento.module.css'
import usePerm from "../../../../hooks/usePerm";
import useAuth from "../../../../hooks/useAuth";

const CadastroInputs = ({ obj, objSetter, funcoes, tipo, setExibirModal }) => {
    const { token } = useAuth();
    const { isEditor } = usePerm();
    const [areas, setAreas] = useState([]);
    const camposRef = useRef({
        date: null,
        area_id: null,
        type: null,
        item: null,
        change: null,
        reasoning: null,
        impact: null,
        is_approved: null,
        status: null,
        responsible_request: null,
        responsible_approval: null
    })

    //funcao que busca os elementos da WBS
    const fetchAreas = async () => {
        const data = await handleFetch({
            table: 'wbs_area',
            query: 'all',
            token
        })
        setAreas(data.data);
    };


    //useEffect que so roda no primeiro render
    useEffect(() => {
        fetchAreas();
    }, []);

    //funcao que atualiza o obj. dependendo da natureza do dado, permite caracteres especificos apenas.
    const handleChange = (e) => {
        var { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const validaDados = () => {
        const camposVazios = Object.entries(obj)
            .filter(([key, value]) => value === null || value === "")
            .map(([key]) => key);

        if (camposVazios.length > 0) {
            console.log(camposVazios)
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

    //funcao que roda a funcao de envio de acordo com o tipo da funcao
    const handleSubmit = () => {
        const isInvalido = validaDados();
        if (isInvalido) return;
        funcoes?.enviar();
    }

    return (
        <tr>
            <td className={styles.mudancasData}>
                <input type="date"
                    value={obj.date}
                    name='date'
                    onChange={handleChange}
                    ref={el => (camposRef.current.date = el)} />
            </td>
            <td className={styles.mudancasArea}>
                <select
                    name="area_id"
                    onChange={handleChange}
                    value={obj.area_id}
                    ref={el => (camposRef.current.area_id = el)}

                >
                    <option value="" defaultValue>Area</option>
                    {areas.map((area, index) => (
                        <option key={index} value={area.id}>{area.name}</option>
                    ))};
                    <option value={-1}>Others</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.type}
                    name='type'
                    onChange={handleChange}
                    ref={el => (camposRef.current.type = el)}
                >
                    <option value="" defaultValue>Type</option>
                    <option value='corrective'>Corrective Action</option>
                    <option value='preventive'>Preventive Action</option>
                    <option value='repair'>Defect Repair</option>
                    <option value='update'>Update</option>
                </select>
            </td>
            <td>
                <textarea
                    name="item"
                    onChange={handleChange}
                    value={obj.item}
                    placeholder="Item"
                    ref={el => (camposRef.current.item = el)}
                />
            </td>
            <td className={styles.mudancasMudanca}>
                <textarea
                    name="change"
                    onChange={handleChange}
                    value={obj.change}
                    placeholder="Change"
                    ref={el => (camposRef.current.change = el)}
                />
            </td>
            <td className={styles.mudancasJustificativa}>
                <textarea
                    name="reasoning"
                    onChange={handleChange}
                    value={obj.reasoning}
                    placeholder="Reasoning"
                    ref={el => (camposRef.current.reasoning = el)}
                />
            </td>
            <td className={styles.mudancasImpacto}>
                <textarea
                    name="impact"
                    onChange={handleChange}
                    value={obj.impact}
                    placeholder="Impact description"
                    ref={el => (camposRef.current.impact = el)}
                />
            </td>
            <td>
                <select
                    value={obj.is_approved}
                    name='is_approved'
                    onChange={handleChange}
                    ref={el => (camposRef.current.is_approved = el)}
                >
                    <option value="" defaultValue>Decision</option>
                    <option value={true}>Approved</option>
                    <option value={false}>Rejected</option>
                </select>
            </td>
            <td>
                <select
                    value={obj.status}
                    name='status'
                    onChange={handleChange}
                    ref={el => (camposRef.current.status = el)}
                >
                    <option value="" defaultValue>Status</option>
                    <option value="starting">Starting</option>
                    <option value="progress">In progress</option>
                    <option value="finalized">Finalized</option>
                </select>
            </td>
            <td>
                <textarea
                    name="responsible_request"
                    onChange={handleChange}
                    value={obj.responsible_request}
                    placeholder="Applicant"
                    ref={el => (camposRef.current.responsible_request = el)}
                />
            </td>
            <td>
                <textarea
                    name="responsible_approval"
                    onChange={handleChange}
                    value={obj.responsible_approval}
                    placeholder="Responsible for approval"
                    ref={el => (camposRef.current.responsible_approval = el)}
                />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isEditor}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcoes.funcao2}>✖️</button>
                    </React.Fragment>
                )}
            </td>
        </tr>
    )
}

export default CadastroInputs;