import styles from "../../../../../styles/modules/wbs.module.css"
import { useRef, useEffect } from "react";
import usePerm from "../../../../../hooks/usePerm";

const InputContainer = ({ op, functions, isNew, obj, objSetter, setExibirModal, area_id, style }) => {
    const { isEditor } = usePerm();

    const camposRef = useRef({
        name: null,
        color: null
    });

    useEffect(() => {
        if (area_id) {
            if (op == 'item') {
                objSetter({
                    ...obj,
                    area_id
                })
            } else {
                objSetter({
                    ...obj,
                    id: area_id
                })
            }
        }
    }, [area_id])

    const handleChange = (e, obj, objSetter) => {
        const { name, value } = e.target;
        objSetter({
            ...obj,
            [name]: value
        })
        e.target.classList.remove('campo-vazio');
    }

    const handleSubmit = async () => {
        const usedObj = obj;

        const { id, ...camposConsiderados } = usedObj;
        const camposVazios = Object.keys(camposConsiderados).filter(
            key => camposConsiderados[key] === null || camposConsiderados[key] === ""
        );

        if (camposVazios.length > 0) {
            camposVazios.forEach(campo => {
                camposRef.current?.[campo]?.classList.add('campo-vazio');
            });
            setExibirModal('inputsVazios');
            return;
        }

        await functions?.submit();
        if (functions?.hide) functions?.hide();
    }

    return (
        <div className={styles.block} style={style}>
            <div className={styles.new_inputs}>
                <input
                    name="name"
                    value={obj?.name}
                    onChange={(e) => handleChange(e, obj, objSetter)}
                    placeholder={`New ${op == 'area' ? 'area' : 'item'}`}
                    ref={el => (camposRef.current.name = el)}
                />
                {op == 'area' && (
                    <div className={styles.new_inputs_color}>
                        <label>Color: </label>
                        <input
                            name="color"
                            value={obj?.color ?? '#FFFFFF'}
                            type="color"
                            onChange={(e) => handleChange(e, obj, objSetter)}
                            ref={el => (camposRef.current.color = el)}
                        />
                    </div>
                )}
            </div>
            <div className={styles.action_buttons}>
                <button onClick={() => handleSubmit(op === "item")} disabled={!isEditor}>✔️</button>
                {!isNew &&
                    <button onClick={functions?.hide}>✖️</button>
                }
            </div>
        </div>
    )

}

export default InputContainer;