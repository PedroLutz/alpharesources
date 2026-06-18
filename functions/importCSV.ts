import Papa from 'papaparse';

type importCSVProps = {
    file: File;
    headers: string[];
    onError: (e: string) => void;
    onSuccess: (lines: unknown[]) => void;
}

const checkHeaders = (headers: string[], fileHeaders: string[] | undefined): string | null => {
    if (!fileHeaders || fileHeaders.length == 0) return "The file has no headers!"

    const missingHeaders: string[] = [];
    const unknownHeaders: string[] = [];

    headers.forEach(h => { !fileHeaders.includes(h) && missingHeaders.push(h) });
    fileHeaders.forEach(h => { !headers.includes(h) && unknownHeaders.push(h != "" ? h : "[empty header]") });

    let errorMsg: string = "";

    if (missingHeaders.length !== 0) {
        errorMsg += `The following expected headers were not found in the file: ${missingHeaders.join(", ")}. `;
    }

    if (unknownHeaders.length !== 0) {
        errorMsg += `The following unknown headers were found in the file: ${unknownHeaders.join(", ")}.`;
    }

    return errorMsg.length !== 0 ? errorMsg.trim() : null;
}

const checkLines = (lines: unknown[]): boolean => {
    let hasEmptyValue = false;

    for (const line in lines) {
        const objectHasEmptyValue = Object.values(lines[line] as Record<string, string>).some(value => value === "")
        if (objectHasEmptyValue) {
            hasEmptyValue = true;
            break;
        }
    }

    return hasEmptyValue;
}

export const importCSV = ({ file, headers, onError, onSuccess }: importCSVProps) => {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {

            const receivedHeaders = results.meta.fields;

            const error = checkHeaders(headers, receivedHeaders);
            if (error) {
                onError(error);
                return;
            }

            if (checkLines(results.data)) {
                onError("Some lines have empty cells!");
                return;
            }

            onSuccess(results.data);
        }
    })
}