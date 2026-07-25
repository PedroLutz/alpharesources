import { createContext } from "react";

type ImportCSVContextType = {
    tableHeaders: string[];
    uploadImport: (lines: unknown[]) => Promise<void>;

    lines: unknown[];
    setLines: React.Dispatch<React.SetStateAction<unknown[]>>;

    showTable: boolean;
    setShowTable: React.Dispatch<React.SetStateAction<boolean>>;

    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;

    setHide: () => void;
    areLinesValid?: (lines: unknown[]) => [boolean, string];
}

export const ImportCSVContext = createContext<ImportCSVContextType>(null);