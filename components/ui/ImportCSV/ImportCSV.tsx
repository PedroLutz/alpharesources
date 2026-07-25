import { useState } from "react";
import { ImportCSVContext } from "./ImportCSVContext";

type ImportCSVType = {
    setHide: () => void;
    children: React.ReactNode;
    tableHeaders: string[];
    uploadImport: (lines: unknown[]) => Promise<void>;
    areLinesValid?: (lines: unknown[]) => [boolean, string];
}

export const ImportCSV = ({children, setHide, tableHeaders, uploadImport, areLinesValid}: ImportCSVType) => {
    const [lines, setLines] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [error, setError] = useState<string>("");

    return (
        <ImportCSVContext.Provider value={{
            lines,
            setLines,
            error,
            setError,
            setHide,
            tableHeaders,
            uploadImport,
            showTable,
            setShowTable,
            areLinesValid
        }}>
            {children}
        </ImportCSVContext.Provider>
    )
}