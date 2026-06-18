import { CircleQuestionMark, Download, Upload } from "lucide-react"
import styles from "../../../styles/modules/ui/toolbar.module.css"
import { useToolbar } from "../../../hooks/useToolbar"

export const Toolbar = ({ children }) => {
    const { helpClick, exportCSVClick, importCSVClick } = useToolbar();

    if(!helpClick && !exportCSVClick && !importCSVClick) return;

    return (
        <div className={styles.toolbar_div}>
            <button data-tooltip="Help"
                hidden={!helpClick}
                onClick={helpClick}
                className={styles.toolbar_button}>
                <CircleQuestionMark size={30} />
            </button>

            <button 
                hidden={!exportCSVClick}
                data-tooltip="Export to .csv file"
                onClick={exportCSVClick}
                className={styles.toolbar_button}>
                <Download size={30} />
            </button>

            <button
                hidden={!importCSVClick}
                data-tooltip="Import .csv file"
                onClick={importCSVClick}
                className={styles.toolbar_button}>
                <Upload size={30}/>
            </button>
        </div>
    )
}