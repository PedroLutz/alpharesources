import { useCallback, useContext, useRef, useState } from "react";
import { importCSV } from "../../../functions/importCSV";
import { ImportCSVContext } from "./ImportCSVContext";

export const ImportCSVFileSelector = () => {
    const {tableHeaders, setLines, showTable, setShowTable, areLinesValid, setHide, error, setError} = useContext(ImportCSVContext);

    const onSuccess = useCallback((lines: unknown[]) => {
        const areLinesValidResult = areLinesValid?.(lines);
        if(areLinesValidResult[0]){
            setError(areLinesValidResult[1]);
            return;
        }
        setLines(lines);
        setShowTable(true);
    }, [areLinesValid, setShowTable, setLines])

    const importFromFile = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        importCSV({
            file, headers: tableHeaders,
            onError: (e) => { setError(e) },
            onSuccess
        });
    }, [importCSV, tableHeaders, setError, onSuccess])

    const fileInputRef = useRef(null);

    const searchClick = useCallback(() => {
        fileInputRef.current?.click();
    }, [fileInputRef]);

    if(!showTable) return (
        <div className="overlay">
            <div className="modal">
                <p>Please select a valid .csv file.</p>
                <p>Your table should have the following fields:</p>
                <p style={{ fontSize: "0.8em" }}>{tableHeaders.join(", ")}</p>
                <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={importFromFile} />

                {error != "" && (
                    <p style={{ color: "red" }}>{error}</p>
                )}
                <div>
                    <button className="botao-bonito" onClick={searchClick}>Search file</button>
                    <button className="botao-bonito" onClick={setHide}>Cancel</button>
                </div>
            </div>
        </div>
    )

    return null;
}