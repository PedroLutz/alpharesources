import { useContext } from "react"
import { ImportCSVContext } from "./ImportCSVContext"

export const ImportCSVConfirmPreview = () => {
    const { tableHeaders, lines, showTable, setHide, uploadImport } = useContext(ImportCSVContext);

    if (showTable) return (
        <div className="overlay">
            <div className="modal" style={{ maxWidth: "50rem" }}>
                The following spreadsheet will be registered. <p style={{ color: "red" }}><b>Any data from the current spreadsheet not found in the new spreadsheet will be deleted.</b></p>
                <div style={{ width: "100%", maxWidth: "100%", overflow: "auto" }}>
                    <div style={{ display: "block", }}>
                        <table className={`tabela`}>
                            <thead>
                                <tr>
                                    {tableHeaders.map((header, index) => (
                                        <th style={{ fontSize: "small" }} key={index}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map((line, index) => (
                                    <tr key={index}>
                                        {tableHeaders.map((header, index) => (
                                            <td style={{ textAlign: "center", fontSize: "0.7rem" }} key={index}>{line[header]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <button className="botao-bonito" onClick={() => uploadImport(lines)}>Upload</button>
                    <button className="botao-bonito" onClick={setHide}>Cancel</button>
                </div>
            </div>
        </div>
    )

    return null;
}