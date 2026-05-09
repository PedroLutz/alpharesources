import { generatePDF } from "../utils/generatePDF";
import { useReport } from "../data/ReportContext";
import Modal from "../../../ui/Modal";
import { useState } from "react";

const Menu = ({ setTeamLogo, handleExportPDF }) => {
    const { fetchData, setInterval, interval, setIsLoading, styles, showReport } = useReport();
    const [confirmExport, setConfirmExport] = useState(false);
    const [exibirModal, setExibirModal] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return;
        if (file.size > (3 * 1024 * 1024)) {
            setExibirModal('Please select a smaller image!');
        }

        const url = URL.createObjectURL(file)
        const img = new Image();
        img.src = url;
        img.onload = () => {
            if (img.width != img.height) {
                setExibirModal(`Please select a square image!`)
                return;
            } else {
                setTeamLogo(url);
            }
        }
    }

    return (
        <>
            {exibirModal && (
                <Modal objeto={{
                    titulo: `${exibirModal}`,
                    botao1: {
                        funcao: () => setExibirModal(null), texto: 'Okay'
                    },
                }} />
            )}

            {confirmExport && (
                <Modal objeto={{
                    titulo: "Are you sure you want to export? The page will reload, and all data written by the user will be deleted. (information collected automatically by the website will not be affected)",
                    botao1: {
                        funcao: () => {setConfirmExport(false), handleExportPDF}, texto: 'Export'
                    },
                    botao2: {
                        funcao: () => setConfirmExport(false), texto: 'Go Back'
                    },
                }} />
            )}

            <div style={{ display: `flex`, gap: `1rem` }}>
                <div className={styles.menu}>
                    <h3>Select Interval</h3>
                    <div>
                        <select
                            style={{ backgroundColor: 'transparent', borderColor: 'gray', borderStyle: 'solid', borderWidth: '0.1rem', borderRadius: '0.4rem' }}
                            onChange={(e) => setInterval(e.target.value)}>
                            <option defaultValue value="">Interval</option>
                            <option value="2 months">2 months</option>
                            <option defaultValue value="1 month">1 month</option>
                            <option value="2 weeks">2 weeks</option>
                            <option value="1 week">1 week</option>
                        </select>
                    </div>
                    <button className="botao-padrao" onClick={() => fetchData(setExibirModal)}>Get data</button>
                    {showReport && (
                        <button className="botao-padrao" onClick={() => setConfirmExport(true)}>Export</button>)}
                </div>

                {showReport && <div className={styles.customize_report}>
                    <h3>Customize report</h3>
                    <label htmlFor="fileUpload" className={styles.uploadLabel}>
                        Upload Team Logo
                    </label>
                    <input
                        id="fileUpload"
                        type="file"
                        onChange={handleFileChange}
                        className={styles.hiddenInput}
                    />
                </div>}
            </div>
        </>
    )
};

export default Menu;