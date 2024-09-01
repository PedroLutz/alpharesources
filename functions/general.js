function cleanForm(object, setter, camposVazios) {
    const fields = Object.keys(object);
    const values = Object.values(camposVazios)
    const returnObject = {};
    for(let i = 0; i < fields.length; i++){
        returnObject[fields[i]] = values[i];
    }
    setter(returnObject);
}

//js Date to 'dd/MM/yyyy' format
function jsDateToEuDate(dateData) {
    if(dateData != null){
        const date = new Date(dateData);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();

        return `${day}/${month}/${year}`;
    }
    return null;
}
//'dd/MM/yyyy' format to 'yyyy-MM-dd' format
function euDateToIsoDate (dateString) {
    if(dateString != 'NaN/NaN/NaN' && dateString != null){
        
        const parts = dateString.split('/');
    const dataFormatada = new Date(parts[2], parts[1] - 1, parts[0]);
    return dataFormatada.toISOString().split('T')[0];
    }
    return null;
}
//'dd/MM/yyyy' format to js Date
function euDateToJsDate(dateString) {
    if(dateString != null){
        var dateParts = dateString.split("/");
        return new Date(+dateParts[2], dateParts[1] - 1, dateParts[0]); 
    }
    return null;
}

//'yyyy-MM-dd' format to js Date
function isoDateToJsDate(dateString) {
    var dateParts = dateString.split("-");
    return new Date(+dateParts[0], dateParts[1] - 1, dateParts[2])
}

export { cleanForm , jsDateToEuDate, euDateToIsoDate , euDateToJsDate, isoDateToJsDate };