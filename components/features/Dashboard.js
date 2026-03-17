import useAuth from "../../hooks/useAuth";
import { handlePostFetch, handleFetch } from "../../functions/crud_s";
import React, { useState, useEffect, useMemo } from "react";
import styles from "../../styles/modules/dashboard.module.css"
import Loading from "../ui/Loading";
import HorizontalBarChart from "./HorizontalBarChart";
import { Chart } from 'react-google-charts';
import { isoDateToEuDate } from "../../functions/general";
import HelpBubble from "../ui/HelpBubble/Dashboard";
import { generateColorGradient } from "../../functions/colors";

const Dashboard = () => {
    const [interval, setInterval] = useState("1 week");
    const [loading, setLoading] = useState(false);
    const [countTasks, setCountTasks] = useState({});
    const [countItemsPerArea, setCountItemsPerArea] = useState([]);
    const [itemsInInterval, setItemsInInterval] = useState({});
    const [delayedTasks, setDelayedTasks] = useState({ delayed_start: [], delayed_end: [] });
    const [activeRisks, setActiveRisks] = useState({ threats: [], opportunities: [] })
    const [budgetSummary, setBudgetSummary] = useState({ total_budget: null, percentage: null, total_spent: null })
    const [resources, setResources] = useState({ resources_nearing_expected_date: [], resources_nearing_critical_date: [] })
    const [receitasPorArea, setReceitasPorArea] = useState([]);
    const [despesasPorArea, setDespesasPorArea] = useState([]);
    const [currentCashValue, setCurrentCashValue] = useState(null);
    const [cores, setCores] = useState([]);
    const [showHelp, setShowHelp] = useState(false);

    const [ready, setReady] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setReady(true), 0);
        return () => clearTimeout(timeout);
    }, []);

    const { user, token } = useAuth();
    const user_id = user?.id;

    const fetchDados = async () => {
        setLoading(true);
        const { data: data } = await handlePostFetch({
            table: 'dashboard',
            query: 'all',
            token,
            data: { uid: user_id, interval_text: interval || "1 week" }
        })
        setCountTasks(data.count_tasks);
        setCountItemsPerArea(data.count_items_per_area)
        setItemsInInterval(data.items_in_interval);
        setDelayedTasks(data.delayed_tasks);
        setActiveRisks(data.active_risks);
        setBudgetSummary(data.budget_percentage);
        setResources(data.resources);
        setCurrentCashValue(data.current_cash_value.cash_value);

        const receitasPorAreaArr = [];
        data.area_summary.forEach(obj => {
            if (obj.type == 'income') {
                const exchangeValue = data.area_summary?.find(o => o.type == 'exchange' && o.area_id == obj.area_id)?.total || 0;
                receitasPorAreaArr.push({ area_id: obj.area_id, area_name: obj.area_name || 'Others', area_color: obj.area_color, total: obj.total + exchangeValue });
            }
        })
        data.area_summary.forEach(obj => {
            if (obj.type == 'exchange') {
                if (!receitasPorAreaArr.some(o => o.area_id == obj.area_id)) receitasPorAreaArr.push({ area_id: obj.area_id, area_name: obj.area_name || 'Others', area_color: obj.area_color, total: obj.total });
            }
        })

        const despesasPorAreaArr = [];
        data.area_summary.forEach(obj => {
            if (obj.type == 'cost') {
                const exchangeValue = data.area_summary?.find(o => o.type == 'exchange' && o.area_id == obj.area_id)?.total || 0;
                despesasPorAreaArr.push({ area_id: obj.area_id, area_name: obj.area_name || 'Others', area_color: obj.area_color, total: -obj.total + exchangeValue });
            }
        })
        data.area_summary.forEach(obj => {
            if (obj.type == 'exchange') {
                if (!despesasPorAreaArr.some(o => o.area_id == obj.area_id)) despesasPorAreaArr.push({ area_id: obj.area_id, area_name: obj.area_name || 'Others', area_color: obj.area_color, total: obj.total });
            }
        })
        setDespesasPorArea(despesasPorAreaArr);
        setReceitasPorArea(receitasPorAreaArr);
        setLoading(false);
    }

    useEffect(() => {
        fetchDados();
        fetchCores();
    }, []);

    useEffect(() => {
        fetchDados();
    }, [interval]);

    const fetchCores = async () => {
        const data = await handleFetch({
            table: "wbs_area",
            query: 'colors',
            token
        });
        var cores = {};
        data?.data.forEach((area) => {
            cores = { ...cores, [area.name]: area.color || '' }
        })
        setCores(cores);
    }

    const [wbs_activity_graph, wbs_activity_data] = useMemo(() => {
        const graph_data = []
        const data = [];
        if (countItemsPerArea.length === 0) return graph_data;

        var barAmmount = 0;

        countItemsPerArea.forEach((c) => {
            const percentageOfExecution = c.num_initiated_items * 100 / c.num_itens;
            graph_data.push({ area: barAmmount + 1, total: c.num_itens, initiated: c.num_initiated_items })
            data.push({ id: barAmmount + 1, area: c.area, total: c.num_itens, initiated: c.num_initiated_items, percentage: percentageOfExecution })
            barAmmount++;
        })

        return [graph_data, data];
    }, [countItemsPerArea])

    const [schedule_summary_graph] = useMemo(() => {
        const data = [['Area', 'Value']];
        if (countTasks.length === 0) return data;

        data.push(["Not started", countTasks.total_tasks_count - countTasks.complete_tasks_count - countTasks.executing_tasks_count - countTasks.delayed_any_count])
        data.push(["Complete", countTasks.complete_tasks_count])
        data.push(["Executing in schedule", countTasks.executing_tasks_count])
        data.push(["Delayed tasks", countTasks.delayed_any_count])
        return [data];
    }, [countTasks])

    const ReceitasPorAreaGraph = useMemo(() => {
        if (receitasPorArea.length === 0) return [['Area', 'Value']];
        const graph = [['Area', 'Value']];
        receitasPorArea.forEach((area) => {
            graph.push([area.area_name, area.total]);
        });
        return graph;
    }, [receitasPorArea]);

    //gerar Array do grafico de pizza Despesas por Area
    const DespesasPorAreaGraph = useMemo(() => {
        if (despesasPorArea.length === 0) return [['Area', 'Value']];
        const graph = [['Area', 'Value']];
        despesasPorArea.forEach((area) => {
            graph.push([area.area_name, area.total]);
        });
        return graph;
    }, [despesasPorArea]);

    return (
        <div className="centered-container">
            <h2 className="smallTitle">Dashboard <button onClick={() => setShowHelp(true)}>❔</button></h2>
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
            <div className={styles.super_container}>
                <div className={styles.super_wrapper}>
                    <div className={styles.outer_container}>
                        <div className={styles.inner_container}>
                            <div className={styles.block} name="interval_picker">
                                <a>Select Interval</a>
                                <div>
                                    <select
                                        value={interval}
                                        onChange={(e) => setInterval(e.target.value)}
                                    >
                                        <option default value="1 week">1 week</option>
                                        <option default value="2 weeks">2 weeks</option>
                                        <option default value="1 month">1 month</option>
                                        <option default value="2 months">2 months</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.block} name="project_completion">
                                <a>Project Completion</a>
                                {countTasks?.total_tasks_count != null ? (
                                    <React.Fragment>
                                        <span>{(countTasks?.complete_tasks_count * 100 / countTasks?.total_tasks_count).toFixed(2)}%</span>
                                        <div style={{ textAlign: "left" }}>
                                            Number of tasks: {countTasks.total_tasks_count}<br />
                                            Number of completed tasks: {countTasks.complete_tasks_count}
                                        </div>
                                    </React.Fragment>
                                ) : (
                                    <div>No data available!</div>
                                )}
                            </div>
                            <div className={styles.block} name="wbs_summary">
                                <a>WBS Execution Summary</a>
                                {countItemsPerArea.length != 0 ? (
                                    <div className={styles.wrapper}>
                                        <div className={styles.graph} style={{ width: '25rem' }}>
                                            {ready &&
                                                <HorizontalBarChart data={wbs_activity_graph} width="100%" barHeight={10} colors={[document.documentElement.style.getPropertyValue("--main-color"), document.documentElement.style.getPropertyValue("--secondary-color")]} />
                                            }

                                        </div>
                                        <div className={styles.line} />
                                        <div className={styles.graph} style={{ width: '22rem' }}>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Area</th>
                                                        <th name="total">Num. of items</th>
                                                        <th name="initiated">Num. of initiated items</th>
                                                        <th name="percentage">Percentage of initiated items</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {wbs_activity_data?.map((w, index) => (
                                                        <tr key={index}>
                                                            <td>{w.id}</td>
                                                            <td>{w.area}</td>
                                                            <td>{w.total}</td>
                                                            <td>{w.initiated}</td>
                                                            <td>{w.percentage.toFixed(2)}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div>No data available!</div>
                                )}

                            </div>
                            <div className={styles.block} name="executed_vs_planned">
                                <a>Executed vs. Planned in interval</a>
                                <div className={styles.wrapper}>
                                    <div className={styles.inner_block}>
                                        <a>Executed</a>
                                        {itemsInInterval?.items_completed_recently?.length != 0 ? (
                                            <ul>
                                                {itemsInInterval?.items_completed_recently?.map((i, index) => (
                                                    <li key={index}>{i.area_name} - {i.item_name}</li>
                                                ))}
                                            </ul>
                                        ) : <div style={{ marginTop: '0.5rem' }}>No data available!</div>}
                                    </div>
                                    <div className={styles.line} />
                                    <div className={styles.inner_block}>
                                        <a>Planned</a>
                                        {itemsInInterval?.items_planned_to_start?.length != 0 ? (
                                            <ul>
                                                {itemsInInterval?.items_planned_to_start?.map((i, index) => (
                                                    <li key={index}>{i.area_name} - {i.item_name}</li>
                                                ))}
                                            </ul>
                                        ) : <div style={{ marginTop: '0.5rem' }}>No data available!</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.inner_container}>
                            <div className={styles.block} name="schedule_summary">
                                <a>Schedule Summary</a>
                                {countTasks.length != 0 ? (
                                    <div className={styles.wrapper}>
                                        <div className={styles.inner_block}>
                                            <ul style={{ width: "100%", textAlign: 'left', height: '1rem' }}>
                                                <li>Total tasks: {countTasks.total_tasks_count}</li>
                                                <li>Tasks not started: {countTasks.total_tasks_count - countTasks.complete_tasks_count - countTasks.executing_tasks_count - countTasks.delayed_any_count}</li>
                                                <li>Tasks in execution on schedule: {countTasks.executing_tasks_count}</li>
                                                <li>Delayed start: {countTasks.delayed_start_count}</li>
                                                <li>Delayed finish: {countTasks.delayed_finish_count}</li>
                                                <li>Completed tasks: {countTasks.complete_tasks_count}</li>
                                            </ul>
                                        </div>
                                        <div className={styles.line} />
                                        <Chart
                                            width={350}
                                            height={130}
                                            chartType="PieChart"
                                            loader={<div>Loading graph</div>}
                                            data={schedule_summary_graph}
                                            options={{
                                                chartArea: {
                                                    top: 0,
                                                    height: 130
                                                },
                                                colors: generateColorGradient(
                                                    document.documentElement.style.getPropertyValue("--main-color"), 
                                                    document.documentElement.style.getPropertyValue("--secondary-color"),
                                                    4),
                                                legend: {
                                                    position: 'labeled'
                                                }
                                            }}
                                            rootProps={{ 'data-testid': '1' }}
                                        />
                                    </div>
                                ) : (
                                    <div>No data available!</div>
                                )}
                            </div>
                            <div className={styles.block} name="schedule_delay">
                                <a>Schedule Delay</a>
                                <div className={styles.wrapper}>
                                    <div className={styles.inner_block}>
                                        <a>Delayed Start</a>
                                        {delayedTasks?.delayed_start?.length != 0 ? (
                                            <table style={{ marginTop: '0.5rem' }}>
                                                <thead>
                                                    <tr>
                                                        <th>WBS item</th>
                                                        <th name="planned_start">Planned start</th>
                                                        <th name="delay">Delay</th>
                                                        <th name="member_name">Responsible</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {delayedTasks?.delayed_start.map((d, index) => (
                                                        <tr key={index}>
                                                            <td>{d.wbs_area} - {d.wbs_item}</td>
                                                            <td name="planned_start">{isoDateToEuDate(d.planned_start)}</td>
                                                            <td name="delay">{d.delay} days</td>
                                                            <td name="member_name">{d.member_name || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : <div style={{ marginTop: '0.5rem' }}>No data available!</div>}
                                    </div>
                                    <div className={styles.line} />
                                    <div className={styles.inner_block}>
                                        <a>Delayed Finish</a>
                                        {delayedTasks?.delayed_end?.length != 0 ? (
                                            <table style={{ marginTop: '0.5rem' }}>
                                                <thead>
                                                    <tr>
                                                        <th>WBS item</th>
                                                        <th name="planned_start">Planned finish</th>
                                                        <th name="delay">Delay</th>
                                                        <th name="member_name">Responsible</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {delayedTasks?.delayed_end.map((d, index) => (
                                                        <tr key={index}>
                                                            <td>{d.wbs_area} - {d.wbs_item}</td>
                                                            <td name="planned_start">{isoDateToEuDate(d.planned_end)}</td>
                                                            <td name="delay">{d.delay} days</td>
                                                            <td name="member_name">{d.member_name || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : <div style={{ marginTop: '0.5rem' }}>No data available!</div>}
                                    </div>

                                </div>
                            </div>
                            <div className={styles.block} name="active_risks">
                                <a>Active Risks</a>
                                <div className={styles.wrapper}>
                                    <div className={styles.inner_block}>
                                        <a>Threats</a>
                                        {activeRisks?.threats?.length != 0 ? (
                                            <ul>
                                                {activeRisks?.threats?.map((i, index) => (
                                                    <li key={index}>{i.risk} {i.rpn != null && (
                                                        <a style={{ color: i.rpn >= 150 ? '#ff0000ff' : (i.rpn >= 50 ? '#c47900ff' : '#1a6800ff') }}>(RPN - {i.rpn})</a>
                                                    )}</li>
                                                ))}
                                            </ul>
                                        ) : <div style={{ marginTop: '0.5rem' }}>No data available!</div>}
                                    </div>
                                    <div className={styles.line} />
                                    <div className={styles.inner_block}>
                                        <a>Opportunities</a>
                                        {activeRisks?.opportunities?.length != 0 ? (
                                            <ul>
                                                {activeRisks?.opportunities?.map((i, index) => (
                                                    <li key={index}>{i.risk} {i.rpn != null && (
                                                        <a style={{ color: i.rpn >= 150 ? '#ff0000ff' : (i.rpn >= 50 ? '#c47900ff' : '#1a6800ff') }}>(RPN - {i.rpn})</a>
                                                    )}</li>
                                                ))}
                                            </ul>
                                        ) : <div style={{ marginTop: '0.5rem' }}>No data available!</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.inner_container}>
                            <div className={styles.block} name="budget_summary">
                                <a>Budget Summary</a>
                                {budgetSummary.percentage != null ? (
                                    <React.Fragment>
                                        <span>Budget used: {budgetSummary.percentage.toFixed(2)}%</span>
                                        <div style={{ textAlign: "left" }}>
                                            Ideal scenario: R${budgetSummary.total_budget.toFixed(2)}<br />
                                            Total spent*: R${budgetSummary.total_spent.toFixed(2)}
                                        </div>
                                        <a className={styles.warning}>* based on the Resource Acquisition Planning spreadsheet</a>
                                    </React.Fragment>
                                ) : (
                                    <div>No data available!</div>
                                )}
                            </div>
                            <div className={styles.block} name="resources_nearing">
                                <a>Resources nearing acquisition date</a>
                                <div className={styles.wrapper}>
                                    <div className={styles.inner_block}>
                                        <a>Nearing expected date:</a>
                                        {resources?.resources_nearing_expected_date?.length != 0 ? (
                                            <ul>
                                                {resources?.resources_nearing_expected_date?.map((i, index) => (
                                                    <li key={index}>{i.resource} - {isoDateToEuDate(i.expected_date)} ({i.days_left} days left)</li>
                                                ))}
                                            </ul>
                                        ) : <div style={{ marginTop: '0.5rem' }}>No data available!</div>}
                                    </div>
                                    <div className={styles.line} />
                                    <div className={styles.inner_block}>
                                        <a>Nearing critical date:</a>
                                        {resources?.resources_nearing_critical_date?.length != 0 ? (
                                            <ul>
                                                {resources?.resources_nearing_critical_date?.map((i, index) => (
                                                    <li key={index}>{i.resource} - {isoDateToEuDate(i.critical_date)} ({i.days_left} days left)</li>
                                                ))}
                                            </ul>
                                        ) : <div style={{ marginTop: '0.5rem' }}>No data available!</div>}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.block} name="financial_summary">
                                <a>Financial Releases Summary</a>
                                {currentCashValue != null ? (
                                    <React.Fragment>
                                        <a style={{ fontWeight: 'normal' }}>Current team funds: <a>R${currentCashValue?.toFixed(2)}</a></a>
                                        <div className={styles.wrapper}>
                                            <div>
                                                <a style={{ fontSize: 'smaller' }}>Incomes</a>
                                                <Chart
                                                    width={350}
                                                    height={100}
                                                    chartType="PieChart"
                                                    loader={<div>Loading graph</div>}
                                                    data={ReceitasPorAreaGraph}
                                                    options={{
                                                        chartArea: {
                                                            top: 0,
                                                            height: 100
                                                        },
                                                        // colors: ['#f28c28', '#d77c4f', '#bc8378', '#a1a1a1'],
                                                        slices: ReceitasPorAreaGraph.slice(1).map((row, index) => ({
                                                            color: cores[row[0]] || '#ccc',
                                                        })),
                                                        legend: {
                                                            position: 'labeled'
                                                        }
                                                    }}
                                                    rootProps={{ 'data-testid': '1' }}
                                                />
                                            </div>
                                            <div>
                                                <a style={{ fontSize: 'smaller' }}>Costs</a>
                                                <Chart
                                                    width={350}
                                                    height={100}
                                                    chartType="PieChart"
                                                    loader={<div>Loading graph</div>}
                                                    data={DespesasPorAreaGraph}
                                                    options={{
                                                        chartArea: {
                                                            top: 0,
                                                            height: 100
                                                        },
                                                        // colors: ['#f28c28', '#d77c4f', '#bc8378', '#a1a1a1'],
                                                        slices: DespesasPorAreaGraph.slice(1).map((row, index) => ({
                                                            color: cores[row[0]] || '#ccc',
                                                        })),
                                                        legend: {
                                                            position: 'labeled'
                                                        }
                                                    }}
                                                    rootProps={{ 'data-testid': '1' }}
                                                />
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ) : (
                                    <div style={{ marginTop: '0.5rem' }}>No data available!</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
};

export default Dashboard;