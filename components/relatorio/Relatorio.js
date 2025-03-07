import React, { useState } from "react";
import { fetchData } from "../../functions/crud";
import styles from '../../styles/modules/relatorio.module.css'
import { handleExport } from "../../functions/exportHtml";
import Loading from "../Loading";

const Relatorio = () => {
    const months = [
        ['01', 'January'],
        ['02', 'February'],
        ['03', 'March'],
        ['04', 'April'],
        ['05', 'May'],
        ['06', 'June'],
        ['07', 'July'],
        ['08', 'August'],
        ['09', 'September'],
        ['10', 'October'],
        ['11', 'November'],
        ['12', 'December'],
    ]
    const years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
    const [showTable, setShowTable] = useState(false);
    const [monthYear, setMonthYear] = useState({
        year: '',
        month: ''
    })
    const [issues, setIssues] = useState('');
    const [kpyAnalysisText, setKpiAnalysisText] = useState({
        scope: '',
        schedule: '',
        risk: '',
        quality: '',
        cost: ''
    })
    const [kpyAnalysisStatus, setKpiAnalysisStatus] = useState({
        scopeStatus: '',
        scheduleStatus: '',
        riskStatus: '',
        qualityStatus: '',
        costStatus: ''
    });
    const [information, setInformation] = useState({
        data: '',
        manager: ''
    })
    const [tarefasIniciadas, setTarefasIniciadas] = useState([]);
    const [costDados, setCostDados] = useState([]);
    const [tarefasEmAndamento, setTarefasEmAndamento] = useState([]);
    const [tarefasConcluidas, setTarefasConcluidas] = useState([]);
    const [tarefasPlanejadas, setTarefasPlanejadas] = useState([]);
    const [areaAnalysis, setAreaAnalysis] = useState([]);
    const [notasAreas, setNotasAreas] = useState({});
    const [loading, setLoading] = useState(false);
    const [riscos, setRiscos] = useState([]);

    const generateLabelsTarefas = (dados, setter) => {
        const tarefas = dados.reduce(
            (texto, dado) => texto + `${dado.area} - ${dado.item}, `, ``
        )
        const textoAjustado = tarefas.slice(0, tarefas.lastIndexOf(','));
        setter(textoAjustado);
    }

    const generateLabelsRiscos = (dados, setter) => {
        const riscos = dados.reduce(
            (texto, dado) => texto + `${dado.risco}, `, ``
        )
        const textoAjustado = riscos.slice(0, riscos.lastIndexOf(','));
        setter(textoAjustado);
    }

    const generateCostDados = (dados, setter) => {
        const caixa = dados[0].total;
        if (caixa >= 2000) {
            setter({
                valor: caixa,
                status: 'Safe'
            })
        }
        if (caixa >= 200 && caixa < 2000) {
            setter({
                valor: caixa,
                status: 'Requires attention'
            })
        }
        if (caixa < 200) {
            setter({
                valor: caixa,
                status: 'Unsafe'
            })
        }
    }

    const handleChange = (e, obj, setter) => {
        const { name, value } = e.target;
        setter({
            ...obj,
            [name]: value,
        });
        const tdElement = e.target.closest('td');
        if (obj === kpyAnalysisStatus)
            if (value === 'Unsafe') {
                tdElement.classList.remove('attention');
                tdElement.classList.add('unsafe');
            } else if (value === 'Requires attention') {
                tdElement.classList.add('attention');
                tdElement.classList.remove('unsafe');
            } else {
                tdElement.classList.remove('unsafe');
                tdElement.classList.remove('attention');
            }
    };

    const busca = async () => {
        setLoading(true)
        setIssues('');
        setKpiAnalysisStatus({
            scopeStatus: '',
            scheduleStatus: '',
            riskStatus: '',
            qualityStatus: ''
        })
        setKpiAnalysisText({
            scope: '',
            schedule: '',
            risk: '',
            quality: ''
        })
        setInformation({
            data: '',
            manager: ''
        })
        const mesAno = `${monthYear.year}-${monthYear.month}`
        try {
            const response = await fetch(`/api/relatorio/get/geral`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ monthYear: mesAno }),
            });

            if (response.ok) {
                const data = await response.json();
                generateLabelsTarefas(data.tarefasIniciadas, setTarefasIniciadas);
                generateLabelsTarefas(data.tarefasConcluidas, setTarefasConcluidas);
                generateLabelsTarefas(data.tarefasEmAndamento, setTarefasEmAndamento);
                generateLabelsTarefas(data.tarefasPlanejadas, setTarefasPlanejadas);
                generateLabelsRiscos(data.riscos, setRiscos);
                generateCostDados(data.caixaPorMes, setCostDados);
            } else {
                console.error(`Erro ao buscar por dados`);
            }
        } catch (error) {
            console.error(`Erro ao buscar por dados`, error);
        }

        const responsePlano = await fetchData('cronograma/get/startAndEndPlano');
        const responseGantt = await fetchData('cronograma/get/startAndEndGantt');
        const responseSituacoesGantt = await fetchData('cronograma/get/ganttsESituacoes');
        const dadosPlano = responsePlano.resultadosPlano;
        const dadosGantt = responseGantt.resultadosGantt;
        const dadosSituacoesGantt = responseSituacoesGantt.ganttPorArea;

        var objSituacao = {}
        dadosSituacoesGantt.forEach((dado) => {
            if (dado.itens.filter((item) => item.situacao === "em andamento").length === 0 &&
                dado.itens.filter((item) => item.situacao === "iniciar").length === 0) {
                objSituacao = { ...objSituacao, [dado.area]: "Complete" }
            } else if (dado.itens.filter((item) => item.situacao === "em andamento").length === 0 &&
                dado.itens.filter((item) => item.situacao === "iniciar").length > 0) {
                objSituacao = { ...objSituacao, [dado.area]: "Hold" }
            } else if (dado.itens.filter((item) => item.situacao === "em andamento").length > 0) {
                objSituacao = { ...objSituacao, [dado.area]: "Executing" }
            } else if (dado.itens.filter((item) => item.situacao === "em andamento").length === 0 &&
                dado.itens.filter((item) => item.situacao === "concluida").length === 0) {
                objSituacao = { ...objSituacao, [dado.area]: "To Begin" }
            }
        })

        var duplas = [];
        dadosPlano.forEach((dado) => {
            const gantt = dadosGantt.find(o => o.area === dado.area);
            duplas.push([dado, gantt])
        })

        let arrayAnalise = [];

        duplas.forEach((dupla) => {
            console.log(dupla)
            const area = dupla[0].area;
            const planoUltimo = dupla[0].ultimo;
            const ganttUltimo = dupla[1].ultimo;
            const getLastDayOfMonth = (monthYear) => {
                const { year, month } = monthYear;
                const lastDay = new Date(year, month, 0).getDate(); // Dia 0 do próximo mês retorna o último dia do mês atual
                return new Date(year, month - 1, lastDay); // month - 1 porque os meses são indexados de 0 a 11
            };
            var obj = { area: area, state: objSituacao[area] }

            const hoje = getLastDayOfMonth(monthYear).toISOString();

            //executing
            if (objSituacao[area] === "Executing") {
                if (planoUltimo.termino >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //hold
            if (objSituacao[area] === "Hold") {
                if (planoUltimo.termino >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //complete
            if (objSituacao[area] === "Complete") {
                if (planoUltimo.termino >= ganttUltimo.termino) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //to begin
            if (objSituacao[area] === "To Begin") {
                if (planoUltimo.termino >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }
        })
        setAreaAnalysis(arrayAnalise);
        setLoading(false);
        setShowTable(true);
    }

    const exportar = () => {
        handleExport('.report', monthYear);
    };

    return (
        <div className="centered-container">
            <h2>Status Report Generator</h2>
            {loading && <Loading />}
            <div className={styles.menu}>
                <h3>Select Month</h3>
                <div>
                    <select
                        name="month"
                        onChange={(e) => handleChange(e, monthYear, setMonthYear)}
                        value={monthYear.month}>
                        <option value='' disabled>Select month</option>
                        {months.map((month, index) => (
                            <option key={index} value={month[0]}>{month[1]}</option>
                        ))}
                    </select>

                    <select
                        name="year"
                        onChange={(e) => handleChange(e, monthYear, setMonthYear)}
                        value={monthYear.year}>
                        <option value='' disabled>Select year</option>
                        {years.map((year, index) => (
                            <option key={index} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <button className="botao-padrao" onClick={busca}>Get data</button>
                {showTable && (
                    <button className="botao-padrao" onClick={exportar}>Export</button>)}
            </div>
            {showTable && (
                <div className={`report ${styles.report}`}>

                    <React.Fragment>
                        <div style={{ display: 'flex' }}>
                            <table className={`tableInformation ${styles.tableInformation}`}>
                                <thead>
                                    <tr>
                                        <th colSpan={2}>PROJECT INFORMATION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Project Name</td>
                                        <td>Alpha Scuderia</td>
                                    </tr>
                                    <tr>
                                        <td>Month of report</td>
                                        <td>{monthYear.month}/{monthYear.year}</td>
                                    </tr>
                                    <tr>
                                        <td>Projected Date of Completion</td>
                                        <td><input type="date"
                                            name='data'
                                            value={information.data}
                                            onChange={(e) => handleChange(e, information, setInformation)} /></td>
                                    </tr>
                                    <tr>
                                        <td>Project Manager</td>
                                        <td><input name='manager'
                                            value={information.manager}
                                            onChange={(e) => handleChange(e, information, setInformation)} /></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style={{ width: '90%' }}>
                                <img src={'/images/logo.png'} alt="Logo" style={{ width: '200px', margin: '-10px' }} />
                            </div>

                        </div>
                        <table style={{ marginTop: '2rem' }} className={`tableProgress ${styles.tableProgress}`}>
                            <thead>
                                <tr>
                                    <th colSpan={2}>PROJECT PROGRESS (TASK ANALYSIS)</th>
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
                                    <td>Tasks planned for next month</td>
                                    <td>{tarefasPlanejadas || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Risks</td>
                                    <td>{riscos || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Issues</td>
                                    <td><textarea value={issues} name="issues"
                                        onChange={(e) => { setIssues(e.target.value) }} /></td>
                                </tr>
                            </tbody>
                        </table>

                        <table className={`tableStatus ${styles.tableStatus}`} style={{ marginTop: '2rem' }}>
                            <thead>
                                <tr>
                                    <th colSpan={5}>PROJECT STATUS (KPI ANALYSIS)</th>
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
                                    <td className='status_td'>
                                        <select name='scopeStatus'
                                            value={kpyAnalysisStatus.scopeStatus}
                                            onChange={(e) => handleChange(e, kpyAnalysisStatus, setKpiAnalysisStatus)}>
                                            <option value='Safe'>Safe</option>
                                            <option value='Requires attention'>Requires attention</option>
                                            <option value='Unsafe'>Unsafe</option>
                                        </select>
                                    </td>
                                    <td className="status_td">
                                        <select name='scheduleStatus'
                                            value={kpyAnalysisStatus.scheduleStatus}
                                            onChange={(e) => handleChange(e, kpyAnalysisStatus, setKpiAnalysisStatus)}>
                                            <option value='Safe'>Safe</option>
                                            <option value='Requires attention'>Requires attention</option>
                                            <option value='Unsafe'>Unsafe</option>
                                        </select>
                                    </td>
                                    <td className="status_td">
                                        <select name='costStatus'
                                            value={kpyAnalysisStatus.costStatus}
                                            onChange={(e) => handleChange(e, kpyAnalysisStatus, setKpiAnalysisStatus)}>
                                            <option value='Safe'>Safe</option>
                                            <option value='Requires attention'>Requires attention</option>
                                            <option value='Unsafe'>Unsafe</option>
                                        </select>
                                    </td>
                                    <td className="status_td">
                                        <select name='riskStatus'
                                            value={kpyAnalysisStatus.riskStatus}
                                            onChange={(e) => handleChange(e, kpyAnalysisStatus, setKpiAnalysisStatus)}>
                                            <option value='Safe'>Safe</option>
                                            <option value='Requires attention'>Requires attention</option>
                                            <option value='Unsafe'>Unsafe</option>
                                        </select>
                                    </td>
                                    <td className="status_td">
                                        <select name='qualityStatus'
                                            value={kpyAnalysisStatus.qualityStatus}
                                            onChange={(e) => handleChange(e, kpyAnalysisStatus, setKpiAnalysisStatus)}>
                                            <option value='Safe'>Safe</option>
                                            <option value='Requires attention'>Requires attention</option>
                                            <option value='Unsafe'>Unsafe</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <textarea
                                            name="scope"
                                            value={kpyAnalysisText.scope}
                                            onChange={(e) => handleChange(e, kpyAnalysisText, setKpiAnalysisText)}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            name="schedule"
                                            value={kpyAnalysisText.schedule}
                                            onChange={(e) => handleChange(e, kpyAnalysisText, setKpiAnalysisText)}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            name="cost"
                                            value={kpyAnalysisText.cost}
                                            onChange={(e) => handleChange(e, kpyAnalysisText, setKpiAnalysisText)}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            name="risk"
                                            value={kpyAnalysisText.risk}
                                            onChange={(e) => handleChange(e, kpyAnalysisText, setKpiAnalysisText)}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            name="quality"
                                            value={kpyAnalysisText.quality}
                                            onChange={(e) => handleChange(e, kpyAnalysisText, setKpiAnalysisText)}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table className={`tableDetails ${styles.tableDetails}`} style={{ marginTop: '2rem' }}>
                            <thead>
                                <tr>
                                    <th colSpan={4}>PROJECT DETAILS (AREA ANALYSIS)</th>
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
                                            <textarea
                                                name={`${area.area}_notas`}
                                                value={notasAreas[`${area.area}_notas`]}
                                                onChange={(e) => handleChange(e, notasAreas, setNotasAreas)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </React.Fragment>

                </div>
            )}
        </div>
    )
}

export default Relatorio;
