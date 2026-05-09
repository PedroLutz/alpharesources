import { useReport } from "../data/ReportContext"

const WorkCompletedVsResources = () => {
    const { tarefasConcluidas, styles } = useReport();

    console.log(tarefasConcluidas)

    if(tarefasConcluidas.length > 0) return (
        <table className={`tableResources ${styles.tableResources}`} style={{ marginTop: '2rem' }}>
            <thead>
                <tr>
                    <th colSpan={3}>WORK COMPLETED VERSUS RESOURCES USED</th>
                </tr>
                <tr>
                    <th>Finished task</th>
                    <th>Planned resources</th>
                    <th>Used resources</th>
                </tr>
            </thead>
            <tbody>
                {tarefasConcluidas.split(', ').map((tarefa, index) => (
                    <tr key={index}>
                        <td style={{ textAlign: 'left', padding: '0.3rem' }}>{tarefa}</td>
                        <td><textarea /></td>
                        <td><textarea /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default WorkCompletedVsResources;