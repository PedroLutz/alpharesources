import { useRef } from "react"
import styles from '../../../../styles/modules/responsabilidades.module.css'
import usePerm from "../../../../hooks/usePerm"

const CadastroInputs = ({ obj, objSetter, tipo, funcoes, setExibirModal }) => {
    const { isEditor } = usePerm();

    const camposRef = useRef({
        name: null,
        softskills: null,
        hardskills: null
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');

    };

    const validaDados = () => {
        if(funcoes?.isMembroCadastrado?.(obj.name) ?? false){
            camposRef.current.name.classList.add('campo-vazio');
            setExibirModal('membroRepetido');
            return false;
        }

        const camposVazios = Object.keys(obj).filter(
            key => obj[key] === null || obj[key] === ""
        );

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
        funcoes?.enviar();
    }

    return (
        <div className={styles.membrosContainer}>
            <div className={styles.membrosConteudo}><b>Name: </b>
                <input
                    className={styles.membrosInputNome}
                    value={obj.name}
                    name='name'
                    onChange={handleChange}
                    ref={el => (camposRef.current.name = el)} />
            </div>
            <div className={styles.membrosConteudo}>
                <b>Softskills: </b>
                <input
                    className={styles.membrosInputSoftskills}
                    value={obj.softskills}
                    name='softskills'
                    onChange={handleChange}
                    ref={el => (camposRef.current.softskills = el)} />
            </div>
            <div className={styles.membrosConteudo}>
                <b>Hardskills: </b>
                <input
                    className={styles.membrosInputHardskills}
                    value={obj.hardskills}
                    name='hardskills'
                    onChange={handleChange}
                    ref={el => (camposRef.current.hardskills = el)} />
            </div>
            <div className={styles.membrosBotoesAcoes}>
                
                {tipo !== 'update' && (
                    <button className={styles.membrosBotaoAddNew} onClick={handleSubmit} disabled={!isEditor}>Add new</button>
                )}

                {tipo === 'update' && (
                    <div className={styles.membrosBotoesAcoes}>
                        <button onClick={handleSubmit}>✔️</button>
                        <button onClick={funcoes?.cancelar}>✖️</button>
                    </div>
                )}

            </div>
        </div>
    )

}

export default CadastroInputs;