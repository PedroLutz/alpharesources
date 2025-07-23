import React, { useState, useEffect } from "react";
import { fetchData } from "../../../functions/crud";
import { isoDateToEuDate } from "../../../functions/general";
import styles from '../../../styles/modules/relatorio.module.css'
import Loading from "../../ui/Loading";
import Modal from "../../ui/Modal";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const Relatorio = () => {
    const [showTable, setShowTable] = useState(false);
    const [mes, setMes] = useState("");
    const objKpis = {
        scopeStatus: '',
        scheduleStatus: '',
        riskStatus: '',
        qualityStatus: '',
        costStatus: ''
    }
    const [exibirModal, setExibirModal] = useState(false);
    const [kpi, setKpi] = useState(objKpis);
    const [tarefasIniciadas, setTarefasIniciadas] = useState([]);
    const [tarefasEmAndamento, setTarefasEmAndamento] = useState([]);
    const [tarefasConcluidas, setTarefasConcluidas] = useState([]);
    const [tarefasPlanejadas, setTarefasPlanejadas] = useState([]);
    const [areaAnalysis, setAreaAnalysis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [riscos, setRiscos] = useState([]);
    const [flagExport, setFlagExport] = useState(false);

    //transforma os dados em uma unica string
    const generateLabelsTarefas = (dados, setter) => {
        const tarefas = dados.reduce(
            (texto, dado) => texto + `${dado.area} - ${dado.item}, `, ``
        )
        //o reduce vai incluir uma virgula no final, ent é só cortar ela fora
        //ent o slice pega o texto entre o inicio e a ultima virgula (exclusivo)
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

    const handleChange = (e, obj, setter) => {
        const { name, value } = e.target;
        setter({
            ...obj,
            [name]: value,
        });
        const tdElement = e.target.closest('td');
        if (obj === kpi)
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
        if (mes == "") {
            setExibirModal(true);
            setLoading(false);
            return;
        }
        const mesAno = format(mes, 'yyyy-MM');
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
                console.log(data)
                generateLabelsTarefas(data.tarefasIniciadas, setTarefasIniciadas);
                generateLabelsTarefas(data.tarefasConcluidas, setTarefasConcluidas);
                generateLabelsTarefas(data.tarefasEmAndamento, setTarefasEmAndamento);
                generateLabelsTarefas(data.tarefasPlanejadas, setTarefasPlanejadas);
                generateLabelsRiscos(data.riscos, setRiscos);
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
                dado.itens.filter((item) => item.situacao === "iniciar").length > 0 &&
                dado.itens.filter((item) => item.situacao === 'concluida').length > 0) {
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
            const area = dupla[0].area;
            const planoUltimo = dupla[0].ultimo;
            const ganttUltimo = dupla[1].ultimo;
            const getLastDayOfMonth = (monthYear) => {
                console.log(monthYear)
                const { year, month } = monthYear;

                const lastDay = new Date(year, month, 0).getDate(); // Dia 0 do próximo mês retorna o último dia do mês atual
                return new Date(year, month - 1, lastDay); // month - 1 porque os meses são indexados de 0 a 11
            };
            var obj = { area: area, state: objSituacao[area] }

            const monthYear = { year: format(mes, 'MM-yyyy').split("-")[1], month: format(mes, 'MM-yyyy').split("-")[0] }
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

    const generatePDF = async () => {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.querySelector('.report');
        element.style.maxWidth = "";
        if (!element) return;

        document.querySelectorAll('textarea').forEach((textarea) => {
            const div = document.createElement('div')
            div.innerText = textarea.value
            div.style.whiteSpace = 'pre-wrap'
            div.style.wordBreak = 'break-word'
            div.style.border = 'none'
            div.style.minHeight = '50px'
            div.style.paddingLeft = '2px'
            div.style.paddingRight = '2px'
            div.style.fontFamily = 'inherit'
            div.style.textAlign = 'left'
            div.style.fontSize = 'small'
            div.style.width = `${textarea.offsetWidth}px`
            div.style.height = `${textarea.offsetHeight + 20}px`

            textarea.style.display = 'none'
            textarea.parentNode.insertBefore(div, textarea.nextSibling)
        })

        document.querySelectorAll('select').forEach((select) => {
            const div = document.createElement('div')
            div.innerText = select.value
            div.style.whiteSpace = 'pre-wrap'
            div.style.wordBreak = 'break-word'
            div.style.border = 'none'
            div.style.fontFamily = 'inherit'
            div.style.fontSize = 'inherit'
            div.style.color = 'black'
            div.style.height = `20px`
            div.style.textAlign = 'center'
            div.style.lineHeight = '20px'

            select.style.display = 'none'
            select.parentNode.insertBefore(div, select.nextSibling)
        })

        const inputManager = document.getElementById("manager");
        const inputDateCompletion = document.getElementById("dateCompletion");
        const inputs = [inputManager, inputDateCompletion]
        inputs.forEach(input => {
            const div = document.createElement('div')
            div.innerText = input.value
            if (input.id == 'dateCompletion') {
                div.innerText = isoDateToEuDate(input.value)
            }
            div.style.whiteSpace = 'pre-wrap'
            div.style.wordBreak = 'break-word'
            div.style.border = 'none'
            div.style.fontFamily = 'inherit'
            div.style.fontSize = 'inherit'
            div.style.color = 'black'
            div.style.height = `25px`
            div.style.textAlign = 'left'
            div.style.lineHeight = '25px'
            input.style.display = 'none'
            input.parentNode.insertBefore(div, input.nextSibling)
        })

        const opt = {
            margin: 1,
            filename: `relatorio-${format(mes, 'MM-yyyy')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: {
                unit: 'px',
                format: [element.offsetWidth, element.offsetHeight + 5],
                orientation: 'portrait'
            }
        };

        await html2pdf().set(opt).from(element).save();
        window.location.reload();
    }

    useEffect(() => {
        if (flagExport == true) {
            generatePDF();
            setFlagExport(false);
        }

    }, [flagExport]);

    return (
        <div className="centered-container">
            {exibirModal && (
                <Modal objeto={{
                    titulo: "Please select a valid month!",
                    botao1: {
                        funcao: () => setExibirModal(false), texto: 'Okay'
                    },
                }} />
            )}

            <h2>Status Report Generator</h2>
            {loading && <Loading />}
            <div className={styles.menu}>
                <h3>Select Month</h3>
                <div>
                    <DatePicker
                        selected={mes}
                        onChange={(date) => setMes(date)}
                        dateFormat="MM/yyyy"
                        className={styles.datePicker}
                        calendarClassName={styles.datePicker_calendar}
                        showMonthYearPicker
                        showFullMonthYearPicker
                        placeholderText="MM/yyyy"
                    />
                </div>
                <button className="botao-padrao" onClick={busca}>Get data</button>
                {showTable && (
                    <button className="botao-padrao" onClick={() => setFlagExport(true)}>Export</button>)}
            </div>
            {showTable && (
                <div className={styles.report_container}>
                    <div className={`report`} style={{ padding: '1rem', maxWidth: '95vw' }}>
                        <div className={styles.report}>

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
                                                <td>{format(mes, 'MM/yyyy')}</td>
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
                                    <div style={{ width: '90%', textAlign: 'center' }}>
                                        <img src={'/images/logo.png'} alt="Logo" style={{ width: '200px', margin: '-10px' }} />
                                    </div>
                                </div>

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
                                            <td>Risks</td>
                                            <td>{riscos || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td>Issues</td>
                                            <td><textarea /></td>
                                        </tr>
                                    </tbody>
                                </table>

                                {tarefasConcluidas && (
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
                                                    <td style={{ textAlign: 'left', fontSize: 'small', padding: '0.3rem' }}>{tarefa}</td>
                                                    <td><textarea style={{ textAlign: 'left', fontSize: 'small', padding: '0.3rem' }} /></td>
                                                    <td><textarea style={{ textAlign: 'left', fontSize: 'small', padding: '0.3rem' }} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}


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
                                                        name={`${key}`}
                                                        style={{ textAlign: 'center' }}
                                                        value={kpi[key]}
                                                        onChange={(e) => handleChange(e, kpi, setKpi)}>
                                                        <option value='Safe'>Safe</option>
                                                        <option value='Requires attention'>Requires attention</option>
                                                        <option value='Unsafe'>Unsafe</option>
                                                    </select>
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            {Object.keys(objKpis).map((key, index) => (
                                                <td key={index}>
                                                    <textarea />
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>

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

                                {tarefasPlanejadas && (
                                    <table style={{ marginTop: '2rem' }} className={`tableProgress ${styles.tableProgress}`}>
                                        <thead>
                                            <tr>
                                                <th colSpan={2}>PREDICTIONS OF FUTURE PROJECT PERFORMANCE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Tasks planned for next month</td>
                                                <td>{tarefasPlanejadas || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td>Comments</td>
                                                <td><textarea /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )}


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
                            </React.Fragment>
                        </div>
                    </div>
                </div>

            )}
        </div>
    )
}

export default Relatorio;