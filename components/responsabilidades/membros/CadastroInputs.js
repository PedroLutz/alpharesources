import React, { useRef, useContext } from "react"
import styles from '../../../styles/modules/responsabilidades.module.css'
import { AuthContext } from "../../../contexts/AuthContext";

const CadastroInputs = ({ obj, objSetter, tipo, funcoes, setExibirModal }) => {
    const camposRef = useRef({
        nome: null,
        softskills: null,
        hardskills: null
    })
    const { isAdmin } = useContext(AuthContext)

    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');

    };

    const validaDados = () => {
        if(funcoes?.isMembroCadastrado(obj.nome)){
            camposRef.current.nome.classList.add('campo-vazio');
            setExibirModal('membroRepetido');
            return true;
        }

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

    const handleSubmit = async () => {
        const isInvalido = validaDados();
        if(isInvalido == true) return;
        funcoes?.enviar();
    }

    return (
        <div className={styles.container}>
            <div><b>Name: </b>
                <input
                    value={obj.nome}
                    name='nome'
                    onChange={handleChange}
                    ref={el => (camposRef.current.nome = el)} />
            </div>
            <div>
                <b>Softskills: </b>
                <input
                    value={obj.softskills}
                    name='softskills'
                    onChange={handleChange}
                    ref={el => (camposRef.current.softskills = el)} />
            </div>
            <div>
                <b>Hardskills: </b>
                <input
                    value={obj.hardskills}
                    name='hardskills'
                    onChange={handleChange}
                    ref={el => (camposRef.current.hardskills = el)} />
            </div>
            <div className={tipo == 'update' ? styles.botoesAcoes : undefined}>
                {tipo !== 'update' ? (
                    <button onClick={(e) => handleSubmit(e)} disabled={!isAdmin}>Add new</button>
                ) : (
                    <React.Fragment>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcoes?.cancelar}>✖️</button>
                    </React.Fragment>
                )}
            </div>
        </div>
    )

}

export default CadastroInputs;