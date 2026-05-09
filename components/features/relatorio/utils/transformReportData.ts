interface TaskType { area_name: string; item_name: string; }
interface RiskType { risk: string; }

type ReportData = Record<string, any[]>;

export const transformReportData = (reportData: ReportData): string[] => {
    const returnArr: string[] = [];

    const tasks : TaskType[][] = [
        reportData.started, 
        reportData.completed, 
        reportData.execution, 
        reportData.planned
    ];
    
    const risks: RiskType[][] = [
        reportData.threats, 
        reportData.opportunities
    ];

    tasks.forEach(grupo => {
        const texto = grupo?.map(dado => `${dado.area_name} - ${dado.item_name}`).join(', ') || '';
        returnArr.push(texto);
    });

    // Processamento de Riscos
    risks.forEach(grupo => {
        const texto = grupo?.map(dado => dado.risk).join(', ') || '';
        returnArr.push(texto);
    });

    return returnArr;
};