import { useReport } from "../data/ReportContext";

const PredictionsOfFuture = () => {
    const { styles, tarefasPlanejadas, interval } = useReport();

    const futurePerformanceLabel = () => {
        switch (interval) {
            case '1 week':
                return "week";
            case "1 month":
                return "month";
            default:
                return interval;
        }
    }

    if (tarefasPlanejadas.length > 0) return (
        <table style={{ marginTop: '2rem' }} className={`tableProgress ${styles.tableProgress}`}>
            <thead>
                <tr>
                    <th colSpan={2}>PREDICTIONS OF FUTURE PROJECT PERFORMANCE</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Tasks planned for the next {futurePerformanceLabel()}</td>
                    <td>{tarefasPlanejadas || '-'}</td>
                </tr>
                <tr>
                    <td>Comments</td>
                    <td><textarea /></td>
                </tr>
            </tbody>
        </table>

    )
};

export default PredictionsOfFuture;