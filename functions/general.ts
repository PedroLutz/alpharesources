function cleanForm(object: any, setter: any, camposVazios: any) {
    const fields = Object.keys(object);
    const values = Object.values(camposVazios);
    const returnObject: any = {};
    for (let i = 0; i < fields.length; i++) {
        returnObject[fields[i]] = values[i];
    }
    setter(returnObject);
}


/**
 * js Date to 'dd/MM/yyyy' format
 * @param {Date} dateData the js date
 * @returns the dd/MM/yyyy date
 */
function jsDateToEuDate(dateData: Date) {
    if (dateData != null) {
        const date = new Date(dateData);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();

        return `${day}/${month}/${year}`;
    }
    return null;
}

/**
    *  'dd/MM/yyyy' format to 'yyyy-MM-dd' format
    * @param {string} dateString - the date in 'dd/MM/yyyy' format
    * @returns {string | null} the date in 'yyyy-MM-dd' format
    */
function euDateToIsoDate(dateString: string): string | null {
    if (dateString != 'NaN/NaN/NaN' && dateString != null) {

        const parts: string[] = dateString.split('/');
        const dataFormatada = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        return dataFormatada.toISOString().split('T')[0];
    }
    return null;
}

/**
    *  'yyyy-MM-dd' format to 'dd/MM/yyyy' format
    * @param {string} dateString - the date
    * @returns {string | null} the date in 'dd/MM/yyyy' format
    */
function isoDateToEuDate(dateString: string): string | null {
    if (dateString != 'NaN/NaN/NaN' && dateString != null) {

        const parts = dateString.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return null;
}
/**
    *  'dd/MM/yyyy' format to js Date
    * @param {string} dateString - the date in 'dd/MM/yyyy' format
    * @returns {Date | null} the date in js Date format
    */
function euDateToJsDate(dateString: string): Date | null {
    if (dateString != null) {
        const dateParts: string[] = dateString.split("/");
        return new Date(+dateParts[2], Number(dateParts[1]) - 1, Number(dateParts[0]));
    }
    return null;
}

/**
    *  'yyyy-MM-dd' format to js Date
    * @param {string} dateString - the date in yyyy-MM-dd' format
    * @returns {Date | null} the date in js Date format
    */
function isoDateToJsDate(dateString: string): Date | null {
    if (dateString != null) {
        var dateParts: string[] = dateString.split("-");
        return new Date(+dateParts[0], Number(dateParts[1]) - 1, Number(dateParts[2]))
    }
    return null;
}

/**
    *  calculates the row span of information in a table (for merging cells)
    * @param {any[]} dados - the array with all data compared
    * @param {string | number} currentArea - the information being evaluated
    * @param {number} currentIndex - the index of the current object in relation to data
    * @param {string} parametro - the property path inside of the object being evaluated
    * @returns {Date | null} the date in js Date format
    */
function calculateRowSpan(dados: any[], currentArea: string | number, currentIndex: number, parametro: string): number {
    let rowSpan = 1;
    for (let i = currentIndex + 1; i < dados.length; i++) {
        let comparedData = dados[i][parametro];
        if (parametro.includes(".")) {
            comparedData = parametro.split('.').reduce((acc, key) => acc?.[key], dados[i]);
        }
        if (comparedData === currentArea) {
            rowSpan++;
        } else {
            break;
        }
    }
    return rowSpan;
};

export { cleanForm, jsDateToEuDate, euDateToIsoDate, euDateToJsDate, isoDateToJsDate, isoDateToEuDate, calculateRowSpan };