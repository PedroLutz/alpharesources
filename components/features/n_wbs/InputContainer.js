import styles from "../../../styles/modules/wbs_n.module.css"

const InputContainer = ({op, functions, isNew, obj, objSetter, setShowModal}) => {
    <div className={styles.wbs_container}>
        <div className={styles.area_block}>
            <div className={styles.new_inputs}>
                <input
                    placeholder={`New ${op == 'area' ? 'area' : 'item'}`}
                />
                {op == 'area'}
                <div className={styles.new_inputs_color}>
                    <label>Color: </label>
                    <input type="color"/>
                </div>
            </div>
            <div className={styles.action_buttons}>
                <button onClick={functions?.submit}>✔️</button>
                {isNew == false && 
                    <button onClick={functions?.cancel}>✖️</button>
                }
            </div>
        </div>
    </div>
}

export default InputContainer;