import { jsDateToEuDate } from "../../../../functions/general";
import { useReport } from "../data/ReportContext";

const ProjectInformation = ({ teamLogo }) => {
    const { styles } = useReport();

    return (
        <div style={{ display: 'flex', width: "100%" }}>
            <table className={`tableInformation ${styles.tableInformation}`}>
                <thead>
                    <tr>
                        <th colSpan={2}>PROJECT INFORMATION</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Project Name</td>
                        <td><input name='teamname'
                            id='teamname' />
                        </td>
                    </tr>
                    <tr>
                        <td>Date of report</td>
                        <td>{jsDateToEuDate(new Date())}</td>
                    </tr>
                    <tr>
                        <td>Projected Date of Completion</td>
                        <td><input type="date"
                            id='dateCompletion' />
                        </td>
                    </tr>
                    <tr>
                        <td>Project Manager</td>
                        <td><input name='manager'
                            id='manager' />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className={styles.alphaLogo}>
                <img src={teamLogo || '/images/logo_border.png'} alt="Logo" />
            </div>
        </div>
    )
}

export default ProjectInformation;