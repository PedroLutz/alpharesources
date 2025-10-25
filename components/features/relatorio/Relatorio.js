import React, { useState, useEffect } from "react";
import { isoDateToEuDate } from "../../../functions/general";
import styles from '../../../styles/modules/relatorio.module.css'
import Loading from "../../ui/Loading";
import Modal from "../../ui/Modal";
import { format } from 'date-fns';
import useAuth from "../../../hooks/useAuth";
import { handlePostFetch, handleFetch, handleReq } from "../../../functions/crud_s";
import HelpBubble from "../../ui/HelpBubble/monitoramento/Relatorio";

/*
⢀⡴⠑⡄⠀⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣤⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ 
⠸⡇⠀⠿⡀⠀⠀⠀⣀⡴⢿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀ 
⠀⠀⠀⠀⠑⢄⣠⠾⠁⣀⣄⡈⠙⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀ 
⠀⠀⠀⠀⢀⡀⠁⠀⠀⠈⠙⠛⠂⠈⣿⣿⣿⣿⣿⠿⡿⢿⣆⠀⠀⠀⠀⠀⠀⠀ 
⠀⠀⠀⢀⡾⣁⣀⠀⠴⠂⠙⣗⡀⠀⢻⣿⣿⠭⢤⣴⣦⣤⣹⠀⠀⠀⢀⢴⣶⣆ 
⠀⠀⢀⣾⣿⣿⣿⣷⣮⣽⣾⣿⣥⣴⣿⣿⡿⢂⠔⢚⡿⢿⣿⣦⣴⣾⠁⠸⣼⡿ 
⠀⢀⡞⠁⠙⠻⠿⠟⠉⠀⠛⢹⣿⣿⣿⣿⣿⣌⢤⣼⣿⣾⣿⡟⠉⠀⠀⠀⠀⠀ 
⠀⣾⣷⣶⠇⠀⠀⣤⣄⣀⡀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀ 
⠀⠉⠈⠉⠀⠀⢦⡈⢻⣿⣿⣿⣶⣶⣶⣶⣤⣽⡹⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀ 
⠀⠀⠀⠀⠀⠀⠀⠉⠲⣽⡻⢿⣿⣿⣿⣿⣿⣿⣷⣜⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀ 
⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣷⣶⣮⣭⣽⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀ 
⠀⠀⠀⠀⠀⠀⣀⣀⣈⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀ 
⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀ 
⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀ 
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠻⠿⠿⠿⠿⠛⠉


FAZER SELECIONADOR DE CAMPOS A SEREM USADOS

*/

const Relatorio = () => {
    const [showTable, setShowTable] = useState(false);
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
    const [oportunidades, setOportunidades] = useState([]);
    const [flagExport, setFlagExport] = useState(false);
    const [interval, setInterval] = useState('');
    const { user, token } = useAuth();
    const user_id = user?.id;
    const [showHelp, setShowHelp] = useState(false);

    const [teamLogo, setTeamLogo] = useState(null);
    const [teamColors, setTeamColors] = useState({});
    const [objTeamColors, setObjTeamColors] = useState({
        main: '',
        secondary: ''
    })

    //transforma os dados em uma unica string
    const generateLabelsTarefas = (dados, setter) => {
        const tarefas = dados.reduce(
            (texto, dado) => texto + `${dado.area_name} - ${dado.item_name}, `, ``
        )
        //o reduce vai incluir uma virgula no final, ent é só cortar ela fora
        //ent o slice pega o texto entre o inicio e a ultima virgula (exclusivo)
        const textoAjustado = tarefas.slice(0, tarefas.lastIndexOf(','));
        setter(textoAjustado);
    }

    const generateLabelsRiscos = (dados, setter) => {
        const riscos = dados.reduce(
            (texto, dado) => texto + `${dado.risk}, `, ``
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
        setLoading(true);
        if (interval == "") {
            setExibirModal(`Please select a valid interval!`);
            setLoading(false);
            return;
        }
        const data = await handlePostFetch({
            table: "report",
            query: 'all',
            token,
            data: { uid: user.id, interval_text: interval },
        });

        generateLabelsTarefas(data.data.started, setTarefasIniciadas);
        generateLabelsTarefas(data.data.completed, setTarefasConcluidas);
        generateLabelsTarefas(data.data.execution, setTarefasEmAndamento);
        generateLabelsTarefas(data.data.planned, setTarefasPlanejadas);
        generateLabelsRiscos(data.data.threats, setRiscos);
        generateLabelsRiscos(data.data.opportunities, setOportunidades);

        const responsePlano = await handleFetch({
            table: "gantt",
            query: "startAndEndPlans",
            token
        });
        const responseGantt = await handleFetch({
            table: "gantt",
            query: "startAndEndMonitors",
            token
        });
        const responseSituacoesGantt = await handleFetch({
            table: "gantt",
            query: "monitorsAndStatus",
            token
        });
        const dadosPlano = responsePlano.data;
        const dadosGantt = responseGantt.data;
        const dadosSituacoesGantt = responseSituacoesGantt.data;

        var primeiroEUltimoPlanos = [];
        var primeiroEUltimoGantts = [];
        const areas = new Map(dadosPlano.map(item => [item.wbs_item.wbs_area.id, { id: item.wbs_item.wbs_area.id, name: item.wbs_item.wbs_area.name }]).values())
        areas.forEach((area) => {
            {
                const primeiroInicio = dadosPlano.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                    .reduce((min, obj) => obj.gantt_data[0].start < min.gantt_data[0].start ? obj : min);
                const ultimoTermino = dadosPlano.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                    .reduce((max, obj) => obj.gantt_data[0].end > max.gantt_data[0].end ? obj : max);
                primeiroEUltimoPlanos.push({ primeiro: primeiroInicio, ultimo: ultimoTermino });

            }
            {
                const primeiroInicio = dadosGantt.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                    .reduce((min, obj) => obj.gantt_data[0].start < min.gantt_data[0].start ? obj : min);
                const ultimoTermino = dadosGantt.filter(dado => dado.wbs_item.wbs_area.id == area.id)
                    .reduce((max, obj) => obj.gantt_data[0].end > max.gantt_data[0].end ? obj : max);
                primeiroEUltimoGantts.push({ primeiro: primeiroInicio, ultimo: ultimoTermino });
            }
        })

        var objSituacao = {}
        dadosSituacoesGantt.ganttPorArea.forEach((dado) => {
            if (dado.itens.filter((item) => item?.status === "executing").length === 0 &&
                dado.itens.filter((item) => item?.status === "start").length === 0) {
                objSituacao = { ...objSituacao, [dado.area]: "Complete" }
            }
            else if (dado.itens.filter((item) => item?.status === "executing").length === 0 &&
                dado.itens.filter((item) => item?.status === "start").length > 0 &&
                dado.itens.filter((item) => item?.status === 'complete').length > 0) {
                objSituacao = { ...objSituacao, [dado.area]: "Hold" }
            }
            else if (dado.itens.filter((item) => item?.status === "executing").length > 0) {
                objSituacao = { ...objSituacao, [dado.area]: "Executing" }
            }
            else if (dado.itens.filter((item) => item?.status === "executing").length === 0 &&
                dado.itens.filter((item) => item?.status === "complete").length === 0) {
                objSituacao = { ...objSituacao, [dado.area]: "To Begin" }
            }
        })

        var duplas = [];
        primeiroEUltimoPlanos.forEach((dado) => {
            const gantt = primeiroEUltimoGantts.find(o => o.primeiro.wbs_item.wbs_area.id === dado.primeiro.wbs_item.wbs_area.id);
            duplas.push([dado, gantt])
        })

        let arrayAnalise = [];
        duplas.forEach((dupla) => {
            const area = dupla[0].ultimo.wbs_item.wbs_area.name;
            const planoUltimo = dupla[0].ultimo;
            const ganttUltimo = dupla[1].ultimo;
            const hoje = new Date().toISOString();
            var obj = { area: area, state: objSituacao[area] }


            //executing
            if (objSituacao[area] === "Executing") {
                if (planoUltimo.gantt_data[0].end >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //hold
            if (objSituacao[area] === "Hold") {
                if (planoUltimo.gantt_data[0].end >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //complete
            if (objSituacao[area] === "Complete") {
                if (planoUltimo.gantt_data[0].end >= ganttUltimo.gantt_data[0].end) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }

            //to begin
            if (objSituacao[area] === "To Begin") {
                if (planoUltimo.gantt_data[0].end >= hoje) {
                    obj = { ...obj, status: 'On Schedule' }
                } else {
                    obj = { ...obj, status: 'Overdue' }
                }
                arrayAnalise.push(obj);
            }
        })
        setAreaAnalysis(arrayAnalise)
        setShowTable(true);
        setLoading(false);
    }

    const generatePDF = async () => {
        const html2pdf = (await import('html2pdf.js')).default;
        const element = document.querySelector('.reportToPrint');
        element.style.maxWidth = "";
        if (!element) return;

        const innerReport = document.getElementById('innerReport');
        innerReport.style.width = '60rem';

        document.querySelectorAll('td').forEach((td) => {
            td.style.fontSize = 'small';
        });

        document.querySelectorAll('th').forEach((th) => {
            th.style.fontSize = 'small';
        });

        document.querySelectorAll('img').forEach((img) => {
            img.style.width = '200px';
            img.style.margin = '-10px';
        });


        document.getElementsByClassName('alphaLogo').forEach((a) => {
            a.style.width = '90%';
        })

        document.querySelectorAll('textarea').forEach((textarea) => {
            const div = document.createElement('div')
            div.innerText = textarea.value
            div.style.whiteSpace = 'pre-wrap'
            div.style.wordBreak = 'break-word'
            div.style.minHeight = '20px'
            div.style.border = 'none'
            div.style.paddingLeft = '2px'
            div.style.paddingRight = '2px'
            div.style.fontFamily = 'inherit'
            div.style.textAlign = 'left'
            div.style.fontSize = 'small'
            div.style.width = `100%`

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
            div.style.fontSize = 'small'
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
            div.style.fontSize = 'small'
            div.style.color = 'black'
            div.style.height = `25px`
            div.style.textAlign = 'left'
            div.style.lineHeight = '25px'
            input.style.display = 'none'
            input.parentNode.insertBefore(div, input.nextSibling)
        })

        const opt = {
            margin: 1,
            filename: `report-${format(new Date(), 'dd-MM-yyyy')}.pdf`,
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

    const futurePerformanceLabel = () => {
        switch (interval) {
            case '1 week':
                return "week";
            case "2 weeks":
                return "2 weeks";
            case "1 month":
                return "month";
            case "2 months":
                return "2 months"
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return;
        if (file.size > (3 * 1024 * 1024)) {
            setExibirModal('Please select a smaller image!');
        }

        const url = URL.createObjectURL(file)
        const img = new Image();
        img.src = url;
        img.onload = () => {
            if (img.width != img.height) {
                setExibirModal(`Please select a square image!`)
                return;
            } else {
                setTeamLogo(url);
            }
        }
    }

    return (
        <div className="centered-container">
            {exibirModal && (
                <Modal objeto={{
                    titulo: `${exibirModal}`,
                    botao1: {
                        funcao: () => setExibirModal(false), texto: 'Okay'
                    },
                }} />
            )}

            <h2 className="smallTitle">Status Report Generator <button onClick={() => setShowHelp(true)}>❔</button></h2>
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <div style={{display: `flex`, gap: `1rem`}}>
            <div className={styles.menu}>
                <h3>Select Interval</h3>
                <div>
                    <select
                        style={{ backgroundColor: 'transparent', borderColor: 'gray', borderStyle: 'solid', borderWidth: '0.1rem', borderRadius: '0.4rem' }}
                        onChange={(e) => setInterval(e.target.value)}>
                        <option defaultValue value="">Interval</option>
                        <option value="2 months">2 months</option>
                        <option defaultValue value="1 month">1 month</option>
                        <option value="2 weeks">2 weeks</option>
                        <option value="1 week">1 week</option>
                    </select>
                </div>
                <button className="botao-padrao" onClick={busca}>Get data</button>
                {showTable && (
                    <button className="botao-padrao" onClick={() => setFlagExport(true)}>Export</button>)}
            </div>

                {showTable && <div className={styles.customize_report}>
                    <h3>Customize report</h3>
                    <label htmlFor="fileUpload" className={styles.uploadLabel}>
                        Upload Team Logo
                    </label>
                    <input
                        id="fileUpload"
                        type="file"
                        onChange={handleFileChange}
                        className={styles.hiddenInput}
                    />
                </div>}
            </div>
            


            {showTable && (
                <div className={styles.report_container}>
                    <div className={`reportToPrint`} style={{ padding: '1rem', maxWidth: '95vw' }}>
                        <div className={styles.report} id="innerReport">

                            <React.Fragment>
                                <div style={{ display: 'flex' }}>
                                    <table className={`tableInformation ${styles.tableInformation}`}>
                                        <thead>
                                            <tr>
                                                <th colSpan={2} style={{backgroundColor: teamColors?.main}}>PROJECT INFORMATION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{backgroundColor: teamColors?.secondary}}>Project Name</td>
                                                <td><input name='teamname'
                                                    id='teamname' />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{backgroundColor: teamColors?.secondary}}>Date of report</td>
                                                <td>{format(new Date(), 'dd/MM/yyyy')}</td>
                                            </tr>
                                            <tr>
                                                <td style={{backgroundColor: teamColors?.secondary}}>Projected Date of Completion</td>
                                                <td><input type="date"
                                                    id='dateCompletion' />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{backgroundColor: teamColors?.secondary}}>Project Manager</td>
                                                <td><input name='manager'
                                                    id='manager' />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className={styles.alphaLogo}>
                                        <img src={teamLogo || '/images/logo.png'} alt="Logo" />
                                    </div>
                                </div>

                                <table style={{ marginTop: '2rem' }} className={`tableProgress ${styles.tableProgress}`}>
                                    <thead>
                                        <tr>
                                            <th style={{backgroundColor: teamColors?.main}} colSpan={2}>TASK ANALYSIS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{backgroundColor: teamColors?.secondary}}>Tasks initiated</td>
                                            <td>{tarefasIniciadas || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{backgroundColor: teamColors?.secondary}}>Tasks in execution</td>
                                            <td>{tarefasEmAndamento || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{backgroundColor: teamColors?.secondary}}>Tasks finished</td>
                                            <td>{tarefasConcluidas || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{backgroundColor: teamColors?.secondary}}>Threats of tasks in execution</td>
                                            <td>{riscos || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{backgroundColor: teamColors?.secondary}}>Opportunities of tasks in execution</td>
                                            <td>{oportunidades || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{backgroundColor: teamColors?.secondary}}>Issues</td>
                                            <td><textarea /></td>
                                        </tr>
                                    </tbody>
                                </table>

                                {tarefasConcluidas && (
                                    <table className={`tableResources ${styles.tableResources}`} style={{ marginTop: '2rem' }}>
                                        <thead>
                                            <tr>
                                                <th colSpan={3} style={{backgroundColor: teamColors?.main}}>WORK COMPLETED VERSUS RESOURCES USED</th>
                                            </tr>
                                            <tr>
                                                <th style={{backgroundColor: teamColors?.secondary}}>Finished task</th>
                                                <th style={{backgroundColor: teamColors?.secondary}}>Planned resources</th>
                                                <th style={{backgroundColor: teamColors?.secondary}}>Used resources</th>
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
                                )}


                                <table className={`tableStatus ${styles.tableStatus}`} style={{ marginTop: '2rem' }}>
                                    <thead>
                                        <tr>
                                            <th colSpan={5} style={{backgroundColor: teamColors?.main}}>KPI ANALYSIS</th>
                                        </tr>
                                        <tr>
                                            <th style={{backgroundColor: teamColors?.secondary}}>Scope</th>
                                            <th style={{backgroundColor: teamColors?.secondary}}>Schedule</th>
                                            <th style={{backgroundColor: teamColors?.secondary}}>Cost</th>
                                            <th style={{backgroundColor: teamColors?.secondary}}>Risk</th>
                                            <th style={{backgroundColor: teamColors?.secondary}}>Quality</th>
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
                                            <th colSpan={4} style={{backgroundColor: teamColors?.main}}>AREA ANALYSIS (PLANNED VERSUS ACTUAL PROGRESS)</th>
                                        </tr>
                                        <tr>
                                            <th style={{backgroundColor: teamColors?.secondary}}>Area</th>
                                            <th style={{backgroundColor: teamColors?.secondary}}>Situation</th>
                                            <th style={{backgroundColor: teamColors?.secondary}}>Status</th>
                                            <th style={{backgroundColor: teamColors?.secondary}}>Notes</th>
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
                                                <th style={{backgroundColor: teamColors?.main}} colSpan={2}>PREDICTIONS OF FUTURE PROJECT PERFORMANCE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{backgroundColor: teamColors?.secondary}}>Tasks planned for the next {futurePerformanceLabel()}</td>
                                                <td>{tarefasPlanejadas || '-'}</td>
                                            </tr>
                                            <tr>
                                                <td style={{backgroundColor: teamColors?.secondary}}>Comments</td>
                                                <td><textarea /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )}


                                <table style={{ marginTop: '2rem' }} className={`tableProgress ${styles.tableProgress}`}>
                                    <thead>
                                        <tr>
                                            <th colSpan={2} style={{backgroundColor: teamColors?.main}}>PROJECT CHANGES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{backgroundColor: teamColors?.secondary}}>Changes</td>
                                            <td><textarea /></td>
                                        </tr>
                                        <tr>
                                            <td style={{backgroundColor: teamColors?.secondary}}>Lessons learned</td>
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