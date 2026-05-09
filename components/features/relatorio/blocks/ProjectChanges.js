import { useReport } from "../data/ReportContext"

const ProjectChanges = () => {
    const {styles} = useReport();

    return (
        <table style={{ marginTop: '2rem' }} className={`tableProgress ${styles.tableProgress}`}>
            <thead>
                <tr>
                    <th colSpan={2}>PROJECT CHANGES</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Changes</td>
                    <td><textarea /></td>
                </tr>
                <tr>
                    <td>Lessons learned</td>
                    <td><textarea /></td>
                </tr>
            </tbody>
        </table>
    )
}

export default ProjectChanges;