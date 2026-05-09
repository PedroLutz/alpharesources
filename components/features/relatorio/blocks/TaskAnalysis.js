import { useReport } from "../data/ReportContext";

const TaskAnalysis = () => {
    const { styles, tarefasIniciadas, tarefasEmAndamento, tarefasConcluidas, riscos, oportunidades } = useReport();

    return (
        <table style={{ marginTop: '2rem' }} className={`tableProgress ${styles.tableProgress}`}>
            <thead>
                <tr>
                    <th colSpan={2}>TASK ANALYSIS</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Tasks initiated</td>
                    <td>{tarefasIniciadas || '-'}</td>
                </tr>
                <tr>
                    <td>Tasks in execution</td>
                    <td>{tarefasEmAndamento || '-'}</td>
                </tr>
                <tr>
                    <td>Tasks finished</td>
                    <td>{tarefasConcluidas || '-'}</td>
                </tr>
                <tr>
                    <td>Threats of tasks in execution</td>
                    <td>{riscos || '-'}</td>
                </tr>
                <tr>
                    <td>Opportunities of tasks in execution</td>
                    <td>{oportunidades || '-'}</td>
                </tr>
                <tr>
                    <td>Issues</td>
                    <td><textarea /></td>
                </tr>
            </tbody>
        </table>
    )
};

export default TaskAnalysis;