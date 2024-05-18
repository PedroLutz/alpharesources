function cleanForm(object, setter) {
    const fields = Object.keys(object);
    const returnObject = {};
    for(let i = 0; i < fields.length; i++){
        returnObject[fields[i]] = '';
    }
    setter(returnObject);
}

function stringToDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
}

function stringToIsoDate (dateString) {
    const parts = dateString.split('/');
    const dataFormatada = new Date(parts[2], parts[1] - 1, parts[0]);
    return dataFormatada.toISOString().split('T')[0];
}

function formatDateGantt(dateString) {
    var dateParts = dateString.split("/");
    return new Date(+dateParts[2], dateParts[1] - 1, dateParts[0]);
}



export { cleanForm , stringToDate, stringToIsoDate , formatDateGantt };