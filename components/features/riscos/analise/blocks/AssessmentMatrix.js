import styles from '../../../../../styles/modules/risco.module.css'
import { useAnalise } from '../data/AnaliseContext';

const AssessmentMatrix = () => {
    const {riscosMapeados} = useAnalise(); 

    const getRiscosMapeados = (occ, imp) => {
        if (riscosMapeados.size > 0) {
            return (
                <ul>
                    {riscosMapeados.get(`${occ}-${imp}`).map((risco, index) => (
                        <li key={index} style={{ fontSize: '0.65rem', textAlign: 'left', marginLeft: '-2rem' }}>{risco}</li>
                    ))}
                </ul>
            );
        }
        return "-";
    }

    return (
        <>
            <h2 style={{ marginTop: '3rem' }}>Risk Assessment Matrix</h2>
            <div className={styles.tabelaRisco_container}>
                <p>Impact</p>
                <div className={styles.tabelaRisco_wrapper}>
                    <table className={`${styles.tabelaAnalise} tabela`}>
                        <thead style={{ background: 'transparent' }}>
                            <tr>
                                <th style={{ borderColor: 'transparent', backgroundColor: 'transparent', width: '1rem', color: 'white' }}></th>
                                <th style={{ borderColor: 'transparent', borderBottomColor: 'black', borderRightColor: 'black', backgroundColor: 'transparent', width: '1rem', color: 'white' }}></th>
                                <th>1</th>
                                <th>2</th>
                                <th>3</th>
                                <th>4</th>
                                <th>5</th>
                            </tr>
                        </thead>
                        <tbody >
                            <tr>
                                <td rowSpan={5}
                                    style={{ border: 'none', width: '0.2rem', fontSize: '1rem', margin: '0rem', padding: '0rem' }}
                                ><div style={{
                                    writingMode: 'sideways-lr',
                                    display: 'inline-block',
                                }}>
                                        Occurrence
                                    </div></td>
                                <th>5</th>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(5, 1)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(5, 2)}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(5, 3)}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(5, 4)}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(5, 5)}</td>
                            </tr>
                            <tr>
                                <th>4</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(4, 1)}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(4, 2)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(4, 3)}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(4, 4)}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(4, 5)}</td>
                            </tr>
                            <tr>
                                <th>3</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(3, 1)}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(3, 2)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(3, 3)}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(3, 4)}</td>
                                <td style={{ backgroundColor: '#ff9595' }}>{getRiscosMapeados(3, 5)}</td>
                            </tr>
                            <tr>
                                <th>2</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(2, 1)}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(2, 2)}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(2, 3)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(2, 4)}</td>
                                <td style={{ backgroundColor: '#ffb486' }}>{getRiscosMapeados(2, 5)}</td>
                            </tr>
                            <tr>
                                <th>1</th>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(1, 1)}</td>
                                <td style={{ backgroundColor: '#78bf9d' }}>{getRiscosMapeados(1, 2)}</td>
                                <td style={{ backgroundColor: '#a5d68f' }}>{getRiscosMapeados(1, 3)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(1, 4)}</td>
                                <td style={{ backgroundColor: '#ffe990' }}>{getRiscosMapeados(1, 5)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
};

export default AssessmentMatrix;