import { useState, useRef, useContext, useEffect } from "react";
import React from "react";
import { fetchData } from "../../../../functions/crud";
import { AuthContext } from "../../../../contexts/AuthContext";
import styles from '../../../../styles/modules/monitoramento.module.css'

const CadastroInputs = ({ obj, objSetter, funcao, tipo, setExibirModal }) => {
    const [elementosWBS, setElementosWBS] = useState([]);
    const camposRef = useRef({
        data: null,
        area: null,
        tipo: null,
        item_config: null,
        mudanca: null,
        justificativa: null,
        impacto: null,
        aprovado: null,
        status: null,
        responsavel_solicitacao: null,
        responsavel_aprovacao: null
    })
    const { isAdmin } = useContext(AuthContext);

    //funcao que busca os elementos da WBS
    const fetchElementos = async () => {
        const data = await fetchData('wbs/get/all');
        setElementosWBS(data.elementos);
    };


    //useEffect que so roda no primeiro render
    useEffect(() => {
        fetchElementos();
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
    const handleSubmit = (e) => {
        const isInvalido = validaDados();
        if(isInvalido) return;
        if (funcao.funcao1) {
            funcao.funcao1();
        } else {
            funcao(e);
        }
    }

    return (
        <tr>
            <td className={styles.mudancasData}>
                <input type="date"
                    value={obj.data}
                    name='data'
                    onChange={handleChange}
                    ref={el => (camposRef.current.data = el)} />
            </td>
            <td className={styles.mudancasArea}>
                <select
                    name="area"
                    onChange={handleChange}
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
                    value={obj.tipo}
                    name='tipo'
                    onChange={handleChange}
                    ref={el => (camposRef.current.tipo = el)}
                >
                    <option value="" defaultValue>Type</option>
                    <option value='Corrective Action'>Corrective Action</option>
                    <option value='Preventive Action'>Preventive Action</option>
                    <option value='Defect Repair'>Defect Repair</option>
                    <option value='Update'>Update</option>
                </select>
            </td>
            <td>
                <textarea
                    name="item_config"
                    onChange={handleChange}
                    value={obj.item_config}
                    placeholder="Item"
                    ref={el => (camposRef.current.item_config = el)}
                />
            </td>
            <td className={styles.mudancasMudanca}>
                <textarea
                    name="mudanca"
                    onChange={handleChange}
                    value={obj.mudanca}
                    placeholder="Change"
                    ref={el => (camposRef.current.mudanca = el)}
                />
            </td>
            <td className={styles.mudancasJustificativa}>
                <textarea
                    name="justificativa"
                    onChange={handleChange}
                    value={obj.justificativa}
                    placeholder="Reasoning"
                    ref={el => (camposRef.current.justificativa = el)}
                />
            </td>
            <td className={styles.mudancasImpacto}>
                <textarea
                    name="impacto"
                    onChange={handleChange}
                    value={obj.impacto}
                    placeholder="Impact description"
                    ref={el => (camposRef.current.impacto = el)}
                />
            </td>
            <td>
                <select
                    value={obj.aprovado}
                    name='aprovado'
                    onChange={handleChange}
                    ref={el => (camposRef.current.aprovado = el)}
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
                    <option value="Starting">Starting</option>
                    <option value="In progress">In progress</option>
                    <option value="Finalized">Finalized</option>
                </select>
            </td>
            <td>
                <textarea
                    name="responsavel_solicitacao"
                    onChange={handleChange}
                    value={obj.responsavel_solicitacao}
                    placeholder="Applicant"
                    ref={el => (camposRef.current.responsavel_solicitacao = el)}
                />
            </td>
            <td>
                <textarea
                    name="responsavel_aprovacao"
                    onChange={handleChange}
                    value={obj.responsavel_aprovacao}
                    placeholder="Responsible for approval"
                    ref={el => (camposRef.current.responsavel_aprovacao = el)}
                />
            </td>
            <td className={tipo === 'update' ? 'botoes_acoes' : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={handleSubmit} disabled={!isAdmin}>Add new</button>
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