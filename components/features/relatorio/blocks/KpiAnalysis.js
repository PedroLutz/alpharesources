import { useReport } from "../data/ReportContext";

const objKpis = {
    scopeStatus: '',
    scheduleStatus: '',
    riskStatus: '',
    qualityStatus: '',
    costStatus: ''
}

const handleKpiChange = (e) => {
    const { name, value } = e.target;
    const tdElement = e.target.closest('td');
    switch (value) {
        case "Unsafe":
            tdElement.classList.remove('attention');
            tdElement.classList.add('unsafe');
            break;
        case "Requires attention":
            tdElement.classList.add('attention');
            tdElement.classList.remove('unsafe');
            break;
        default:
            tdElement.classList.remove('unsafe');
            tdElement.classList.remove('attention');
    }
}

const KpiAnalysis = () => {
    const { styles } = useReport();

    return (
        <table className={`tableStatus ${styles.tableStatus}`} style={{ marginTop: '2rem' }}>
            <thead>
                <tr>
                    <th colSpan={5}>KPI ANALYSIS</th>
                </tr>
                <tr>
                    <th>Scope</th>
                    <th>Schedule</th>
                    <th>Cost</th>
                    <th>Risk</th>
                    <th>Quality</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    {Object.keys(objKpis).map((key, index) => (
                        <td className='status_td' key={index}>
                            <select
                                style={{ textAlign: 'center' }}
                                onChange={(e) => handleKpiChange(e)}
                            >
                                <option value='Safe'>Safe</option>
                                <option value='Requires attention'>Requires attention</option>
                                <option value='Unsafe'>Unsafe</option>
                            </select>
                        </td>
                    ))}
                </tr>
                <tr>
                    {Object.keys(objKpis).map((_, index) => (
                        <td key={index}>
                            <textarea />
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    )
};

export default KpiAnalysis;