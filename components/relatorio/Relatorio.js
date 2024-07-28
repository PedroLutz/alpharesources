import React, { useState, useEffect } from "react";
import { fetchData, handleSubmit } from "../../functions/crud";

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
    const [monthYear, setMonthYear] = useState({
        year: '',
        month: ''
    })
    const [issues, setIssues] = useState('');
    const [kpyAnalysisText, setKpiAnalysisText] = useState({
        scope: '',
        schedule: '',
        risk: '',
        quality: ''
    })
    const [kpyAnalysisStatus, setKpiAnalysisStatus] = useState({
        scopeStatus: '',
        scheduleStatus: '',
        riskStatus: '',
        qualityStatus: ''
    });
    const [tarefasIniciadas, setTarefasIniciadas] = useState([]);
    const [costDados, setCostDados] = useState([]);
    const [tarefasEmAndamento, setTarefasEmAndamento] = useState([]);
    const [tarefasConcluidas, setTarefasConcluidas] = useState([]);
    const [tarefasPlanejadas, setTarefasPlanejadas] = useState([]);
    const [areaAnalysis, setAreaAnalysis] = useState([]);
    const [notasAreas, setNotasAreas] = useState({});
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

    const checkAllDados = () => {
        if (!tarefasIniciadas) return false;
        if (!tarefasEmAndamento) return false;
        if (!tarefasConcluidas) return false;
        if (!tarefasPlanejadas) return false;
        if (!riscos) return false;
        return true;
    }

    const handleChange = (e, obj, setter) => {
        const { name, value } = e.target;
        setter({
            ...obj,
            [name]: value,
        });
        e.target.classList.remove('campo-vazio');
    };

    const busca = async () => {
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
        const dadosPlano = responsePlano.resultadosPlano;
        const dadosGantt = responseGantt.resultadosGantt;
        var duplas = [];
        dadosPlano.forEach((dado) => {
            const gantt = dadosGantt.find(o => o.area === dado.area);
            duplas.push([dado, gantt])
        })

        let arrayAnalise = [];

        duplas.forEach((dupla) => {
            const area = dupla[0].area;
            const planoUltimo = dupla[0].ultimo;
            const ganttPrimeiro = dupla[1].primeiro;
            const ganttUltimo = dupla[1].ultimo;
            const hoje = new Date().toISOString();

            //executing
            if (ganttUltimo.situacao === "em andamento") {
                var obj = { area: area, state: 'EXECUTING' }
                if (planoUltimo.termino >= hoje) {
                    obj = { ...obj, status: 'uptodate' }
                } else {
                    obj = { ...obj, status: 'late' }
                }
                arrayAnalise.push(obj);
            }

            //hold
            if (planoUltimo.item !== ganttUltimo.item && ganttUltimo.situacao === 'concluida') {
                var obj = { area: area, state: 'HOLD' }
                if (planoUltimo.termino >= hoje) {
                    obj = { ...obj, status: 'onschedule' }
                } else {
                    obj = { ...obj, status: 'overdue' }
                }
                arrayAnalise.push(obj);
            }

            //complete
            if (planoUltimo.item === ganttUltimo.item && ganttUltimo.situacao === 'concluida') {
                var obj = { area: area, state: 'COMPLETE' }
                if (planoUltimo.termino >= ganttUltimo.termino) {
                    obj = { ...obj, status: 'uptodate' }
                } else {
                    obj = { ...obj, status: 'late' }
                }
                arrayAnalise.push(obj);
            }

            //to begin
            if (ganttPrimeiro.inicio === null && ganttUltimo.termino === null) {
                var obj = { area: area, state: 'TOBEGIN' }
                if (planoUltimo.termino >= hoje) {
                    obj = { ...obj, status: 'onschedule' }
                } else {
                    obj = { ...obj, status: 'overdue' }
                }
                arrayAnalise.push(obj);
            }
        })
        setAreaAnalysis(arrayAnalise)
        console.log(notasAreas)
    }

    const handleExport = () => {
        const element = document.querySelector(".downloadDiv");
        const clonedElement = element.cloneNode(true);
    
        // Desativar todos os inputs, selects e botões no elemento clonado
        const inputs = clonedElement.querySelectorAll("input");
        const selects = clonedElement.querySelectorAll("select");
        const buttons = clonedElement.querySelectorAll("button");
    
        inputs.forEach(input => input.setAttribute("disabled", true));
        selects.forEach(select => select.setAttribute("disabled", true));
        buttons.forEach(button => button.setAttribute("disabled", true));
    
        const htmlString = `
            <html>
                <head>
                    <style>
                        input[disabled], select[disabled], button[disabled] {
                            opacity: 1;
                            background-color: white;
                            color: #000;
                            border: 1px solid #ccc;
                            cursor: not-allowed;
                        }
                    </style>
                </head>
                <body>
                    ${clonedElement.outerHTML}
                </body>
            </html>
        `;
        const blob = new Blob([htmlString], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'relatorio.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    

    return (
        <div className="centered-container">
            <h2>Status Report Generator</h2>
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
            <button onClick={busca}>Buscar</button>
            <button onClick={handleExport}>Exportar</button>
            <div className="downloadDiv">

            
            {!checkAllDados() && (
                <React.Fragment>
                    <table style={{ marginTop: '2rem' }}>
                        <thead>
                            <tr>
                                <th colSpan={2}>PROJECT PROGRESS (TASK ANALYSIS)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderStyle: 'solid' }}>
                                <td style={{ borderStyle: 'solid' }}>Tasks initiated</td>
                                <td>{tarefasIniciadas || '-'}</td>
                            </tr>
                            <tr style={{ borderStyle: 'solid' }}>
                                <td style={{ borderStyle: 'solid' }}>Tasks in execution</td>
                                <td>{tarefasEmAndamento || '-'}</td>
                            </tr>
                            <tr style={{ borderStyle: 'solid' }}>
                                <td style={{ borderStyle: 'solid' }}>Tasks finished</td>
                                <td>{tarefasConcluidas || '-'}</td>
                            </tr>
                            <tr style={{ borderStyle: 'solid' }}>
                                <td style={{ borderStyle: 'solid' }}>Tasks planned for next month</td>
                                <td>{tarefasPlanejadas || '-'}</td>
                            </tr>
                            <tr style={{ borderStyle: 'solid' }}>
                                <td style={{ borderStyle: 'solid' }}>Risks</td>
                                <td>{riscos || '-'}</td>
                            </tr>
                            <tr>
                                <td style={{ borderStyle: 'solid' }}>Issues</td>
                                <td><input value={issues} name="issues"
                                    onChange={(e) => { setIssues(e.target.value) }} /></td>
                            </tr>
                        </tbody>
                    </table>

                    <table style={{ marginTop: '2rem' }}>
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
                                <td style={{ fontSize: 'small', borderStyle: 'solid' }}>
                                    <select name='scopeStatus'
                                        value={kpyAnalysisStatus.scopeStatus}
                                        onChange={(e) => handleChange(e, kpyAnalysisStatus, setKpiAnalysisStatus)}>
                                        <option value='Safe'>Safe</option>
                                        <option value='Requires attention'>Requires attention</option>
                                        <option value='Unsafe'>Unsafe</option>
                                    </select>
                                </td>
                                <td style={{ fontSize: 'small', borderStyle: 'solid' }}>
                                    <select name='scheduleStatus'
                                        value={kpyAnalysisStatus.scheduleStatus}
                                        onChange={(e) => handleChange(e, kpyAnalysisStatus, setKpiAnalysisStatus)}>
                                        <option value='Safe'>Safe</option>
                                        <option value='Requires attention'>Requires attention</option>
                                        <option value='Unsafe'>Unsafe</option>
                                    </select>
                                </td>
                                <td style={{ fontSize: 'small', borderStyle: 'solid' }}>
                                    {costDados.status || '-'}
                                </td>
                                <td style={{ fontSize: 'small', borderStyle: 'solid' }}>
                                    <select name='riskStatus'
                                        value={kpyAnalysisStatus.riskStatus}
                                        onChange={(e) => handleChange(e, kpyAnalysisStatus, setKpiAnalysisStatus)}>
                                        <option value='Safe'>Safe</option>
                                        <option value='Requires attention'>Requires attention</option>
                                        <option value='Unsafe'>Unsafe</option>
                                    </select>
                                </td>
                                <td style={{ fontSize: 'small', borderStyle: 'solid' }}>
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
                                    <input
                                        name="scope"
                                        value={kpyAnalysisText.scope}
                                        onChange={(e) => handleChange(e, kpyAnalysisText, setKpiAnalysisText)}
                                    />
                                </td>
                                <td>
                                    <input
                                        name="schedule"
                                        value={kpyAnalysisText.schedule}
                                        onChange={(e) => handleChange(e, kpyAnalysisText, setKpiAnalysisText)}
                                    />
                                </td>
                                <td>
                                    {costDados.valor ? (
                                        `Cash in bank account as of this document's date: R$${costDados.valor}`
                                    ) : '-'}
                                </td>
                                <td>
                                    <input
                                        name="risk"
                                        value={kpyAnalysisText.risk}
                                        onChange={(e) => handleChange(e, kpyAnalysisText, setKpiAnalysisText)}
                                    />
                                </td>
                                <td>
                                    <input
                                        name="quality"
                                        value={kpyAnalysisText.quality}
                                        onChange={(e) => handleChange(e, kpyAnalysisText, setKpiAnalysisText)}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <table style={{ marginTop: '2rem' }}>
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
                                    <td>{area.state}</td>
                                    <td>{area.status}</td>
                                    <td>
                                        <input
                                        name={`${area.area}_notas`}
                                        value={notasAreas[`${area.area}_notas`]}
                                        onChange={(e) =>  handleChange(e, notasAreas, setNotasAreas)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </React.Fragment>
            )}
            </div>
        </div>
    )
}

export default Relatorio;