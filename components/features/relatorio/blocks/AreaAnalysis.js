import { useReport } from "../data/ReportContext";

const AreaAnalysis = () => {
    const {styles, areaAnalysis} = useReport();

    return (
        <table className={`tableDetails ${styles.tableDetails}`} style={{ marginTop: '2rem' }}>
            <thead>
                <tr>
                    <th colSpan={4}>AREA ANALYSIS (PLANNED VERSUS ACTUAL PROGRESS)</th>
                </tr>
                <tr>
                    <th>Area</th>
                    <th>Situation</th>
                    <th>Status</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                {areaAnalysis.map((area, index) => (
                    <tr key={index}>
                        <td>{area.area}</td>
                        <td
                            className={
                                area.state === 'To Begin' ? 'status_td unsafe' : (
                                    area.state === 'Complete' ? 'status_td' : (
                                        area.state === 'Hold' ? 'status_td hold' : 'status_td attention'
                                    )
                                )
                            }>{area.state}</td>
                        <td
                            className={
                                area.status === 'Overdue' ? 'status_td unsafe' : 'status_td'
                            }>{area.status}</td>
                        <td>
                            <textarea />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
};

export default AreaAnalysis;