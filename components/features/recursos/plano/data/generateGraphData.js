export const generateGraphData = (areaSummary, contingencia) => {
    const essentialGraph = [['Area', 'Value']];
    const allGraph = [['Area', 'Value']];
    const reserveGraph = [['Area', 'Value']];
    if (areaSummary.length == 0) return [essentialGraph, allGraph, reserveGraph];
    var objEssential = {};
    var objAll = {}
    var objReserve = {};
    var sumEssencial = 0;
    var sumAll = 0;
    areaSummary.forEach((item) => {
        var somaAtual;
        const areaName = item.area_name || "Others";
        if (item.is_essential) {
            if (objEssential[areaName]) {
                somaAtual = objEssential[areaName];
            } else {
                somaAtual = 0;
            }
            somaAtual += (item.total_a * 2 + item.total_b) / 3;
            objEssential = {
                ...objEssential,
                [item.area_name]: somaAtual
            }
            sumEssencial += (item.total_a * 2 + item.total_b) / 3;
        }
        if (objAll[areaName]) {
            somaAtual = objAll[areaName];
        } else {
            somaAtual = 0;
        }
        somaAtual += (item.total_a * 2 + item.total_b) / 3;
        objAll = {
            ...objAll,
            [item.area_name]: somaAtual
        }
        objReserve = {
            ...objReserve,
            [item.area_name]: somaAtual
        }
        sumAll += (item.total_a * 2 + item.total_b) / 3;

    })
    Object.keys(objEssential).forEach((key) => {
        essentialGraph.push([key, parseFloat(objEssential[key].toFixed(2))])
    })
    Object.keys(objAll).forEach((key) => {
        allGraph.push([key, parseFloat(objAll[key].toFixed(2))]);
    })

    contingencia.forEach(c => {
        const areaName = c.risk?.wbs_item?.wbs_area.name || 'Reserves';
        if (!objReserve[areaName]) objReserve[areaName] = 0;
        objReserve[areaName] += (c.financial_impact * (c.occurrence / 5));
    });

    Object.keys(objReserve).forEach((key) => {
        reserveGraph.push([key, parseFloat(objReserve[key].toFixed(2))]);
    })
    return {essentialGraph, sumEssencial, allGraph, sumAll, reserveGraph};
}   