import React, { useEffect, useState, useRef, useContext } from "react"
import members from '../../../styles/modules/members.module.css';
import { AuthContext } from "../../../contexts/AuthContext";

const CadastroInputs = ({obj, objSetter, tipo, funcao, checkDados}) => {
    const [emptyFields, setEmptyFields] = useState([]);
    const camposRef = useRef({
        nome: null,
        softskills: null,
        hardskills: null
    })
    const {isAdmin} = useContext(AuthContext)

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
        const isFormVazio = (form) => {
            const emptyFields = Object.entries(form).filter(([key, value]) => !value);
            return [emptyFields.length > 0, emptyFields.map(([key]) => key)];
        };
        const [isEmpty, camposVazios] = isFormVazio(obj);
        if (isEmpty) {
            camposVazios.forEach(campo => {
                if (camposRef.current[campo]) {
                    camposRef.current[campo].classList.add('campo-vazio');
                }
              });
            setEmptyFields(camposVazios);
            checkDados('inputsVazios');
            return true;
        }
    }

    const handleSubmit = async (e) => {
        const isInvalido = validaDados();
        if(funcao.funcao1) {
            !isInvalido && funcao.funcao1();
        } else {
            !isInvalido && funcao(e);
        }
    }

    return (
        <div className={members.container}>
            <div><b>Name: </b>
                <input
                    value={obj.nome}
                    name='nome'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.nome = el)} />
            </div>
            <div>
                <b>Softskills: </b>
                <input 
                    value={obj.softskills}
                    name='softskills'
                    onChange={(e) => handleChange(e, objSetter, obj)}
                    ref={el => (camposRef.current.softskills = el)}/>
            </div>
            <div>
                <b>Hardskills: </b>
                <input 
                value={obj.hardskills}
                name='hardskills'
                onChange={(e) => handleChange(e, objSetter, obj)}
                ref={el => (camposRef.current.hardskills = el)}/>
            </div>
            <div className={tipo == 'update' ? members.botoesAcoes : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={(e) => handleSubmit(e)} disabled={!isAdmin}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcao.funcao2}>✖️</button>
                    </React.Fragment>
                )}
            </div>
        </div>
    )

}

export default CadastroInputs;