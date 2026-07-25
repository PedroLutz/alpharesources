import React, { useState } from "react";

export type Task = {
    id: number | string;
    name: string;
    start: Date;
    end: Date;
    color?: string;
    dependencies?: (number | string)[];
}

type GanttChartProps = {
    tasks: Task[];
}

export const GanttChart = ({ tasks }: GanttChartProps) => {
    const [hoveredDepId, setHoveredDepId] = useState<string | null>(null);
    const [popover, setPopover] = useState<{ x: number, y: number, task: Task } | null>(null);

    const TOTAL_SVG_WIDTH = 1000;
    const ROW_HEIGHT = 40;
    const ROW_PADDING = 6;
    const HEADER_HEIGHT = 50; 
    const MONTH_HEIGHT = 25;

    // --- 1. SOLUÇÃO DO FUSO HORÁRIO (-1 DIA) ---
    const startTimestamps = tasks.map(t => t.start.getTime());
    const minTime = tasks.length > 0 ? Math.min(...startTimestamps) : Date.now();
    const maxTime = tasks.length > 0 ? Math.max(...tasks.map(t => t.end.getTime())) : Date.now();

    const baseStart = new Date(minTime);
    const baseEnd = new Date(maxTime);

    const projectStartUTC = Date.UTC(baseStart.getUTCFullYear(), baseStart.getUTCMonth(), baseStart.getUTCDate() - 3);
    const projectEndUTC = Date.UTC(baseEnd.getUTCFullYear(), baseEnd.getUTCMonth(), baseEnd.getUTCDate() + 5);

    const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
    const totalDays = Math.round((projectEndUTC - projectStartUTC) / ONE_DAY_IN_MS) || 1;
    const dayWidth = TOTAL_SVG_WIDTH / totalDays;
    const TOTAL_HEIGHT = HEADER_HEIGHT + (tasks.length * ROW_HEIGHT);

    const getTaskX = (targetDate: Date) => {
        const targetUTC = Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate());
        const diffMs = targetUTC - projectStartUTC;
        return (diffMs / ONE_DAY_IN_MS) * dayWidth;
    };

    const formatDateSafe = (d: Date) => {
        return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth()+1).padStart(2, '0')}/${d.getUTCFullYear()}`;
    };

    // --- 2. CONSTRUÇÃO DA TIMELINE (MESES E SEMANAS) ---
    const monthsData: { dateObj: Date, startX: number, width: number }[] = [];
    const weeksData: { label: string, startX: number }[] = [];

    let currentMonth = -1;
    let currentMonthStartX = 0;
    let sundayCount = 0;

    const weekPixelWidth = 7 * dayWidth;
    let weekStep = 1;
    if (weekPixelWidth < 15) {
        weekStep = 4;
    } else if (weekPixelWidth < 40) {
        weekStep = 2;
    }

    for (let i = 0; i <= totalDays; i++) {
        const currentDayUTC = projectStartUTC + (i * ONE_DAY_IN_MS);
        const d = new Date(currentDayUTC);
        const x = i * dayWidth;
        const m = d.getUTCMonth();

        if (m !== currentMonth) {
            if (currentMonth !== -1) {
                monthsData[monthsData.length - 1].width = x - currentMonthStartX;
            }
            currentMonth = m;
            currentMonthStartX = x;
            monthsData.push({ dateObj: d, startX: x, width: 0 }); 
        }

        if (d.getUTCDay() === 0) { 
            if (sundayCount % weekStep === 0) {
                weeksData.push({ 
                    label: `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth()+1).padStart(2, '0')}`, 
                    startX: x 
                });
            }
            sundayCount++;
        }
    }

    if (monthsData.length > 0) {
        monthsData[monthsData.length - 1].width = TOTAL_SVG_WIDTH - currentMonthStartX;
    }

    // --- 3. COORDENADAS E DEPENDÊNCIAS ---
    const taskCoordsMap = new Map<number | string, { startX: number, endX: number, centerY: number }>();
    tasks.forEach((task, index) => {
        const startX = getTaskX(task.start);
        const endX = getTaskX(task.end);
        taskCoordsMap.set(task.id, {
            startX,
            endX,
            centerY: HEADER_HEIGHT + (index * ROW_HEIGHT) + (ROW_HEIGHT / 2)
        });
    });

    const dependenciesToRender: { id: string, pathData: string }[] = [];
    tasks.forEach(task => {
        if (!task.dependencies) return;

        task.dependencies.forEach(depId => {
            const fromCoords = taskCoordsMap.get(depId);
            const toCoords = taskCoordsMap.get(task.id);

            if (fromCoords && toCoords) {
                const isForward = toCoords.startX > fromCoords.endX + 10;
                let pathData = "";

                if (isForward) {
                    const midX = fromCoords.endX + (toCoords.startX - fromCoords.endX) / 3;
                    pathData = `M ${fromCoords.endX} ${fromCoords.centerY} 
                                L ${midX} ${fromCoords.centerY} 
                                L ${midX} ${toCoords.centerY} 
                                L ${toCoords.startX - 6} ${toCoords.centerY}`;
                } else {
                    const dropY = fromCoords.centerY + ROW_HEIGHT / 2 + 5;
                    pathData = `M ${fromCoords.endX} ${fromCoords.centerY} 
                                L ${fromCoords.endX + 15} ${fromCoords.centerY} 
                                L ${fromCoords.endX + 15} ${dropY} 
                                L ${toCoords.startX - 15} ${dropY} 
                                L ${toCoords.startX - 15} ${toCoords.centerY} 
                                L ${toCoords.startX - 6} ${toCoords.centerY}`;
                }

                dependenciesToRender.push({
                    id: `${depId}-${task.id}`,
                    pathData
                });
            }
        });
    });

    // --- 4. SVG RENDER ---
    return (
        <div style={{ position: "relative", width: "100%" }}>
            <svg 
                width="100%" 
                height={TOTAL_HEIGHT}
                viewBox={`0 0 ${TOTAL_SVG_WIDTH} ${TOTAL_HEIGHT}`}
                style={{ overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            >
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
                    </marker>
                    <marker id="arrow-hover" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                    </marker>
                </defs>

                {/* BACKGROUND */}
                {tasks.map((_, index) => {
                    const y = HEADER_HEIGHT + (index * ROW_HEIGHT);
                    return (
                        <g key={`grid-${index}`}>
                            <rect x={0} y={y} width={TOTAL_SVG_WIDTH} height={ROW_HEIGHT} fill={index % 2 === 0 ? "#ffffff" : "#f8fafc"} />
                            <line x1={0} y1={y + ROW_HEIGHT} x2={TOTAL_SVG_WIDTH} y2={y + ROW_HEIGHT} stroke="#e2e8f0" strokeWidth={1} />
                        </g>
                    );
                })}

                {/* LINHAS TIMELINE */}
                {monthsData.map((month, i) => (
                    i > 0 && <line key={`m-line-${i}`} x1={month.startX} y1={0} x2={month.startX} y2={TOTAL_HEIGHT} stroke="#cbd5e1" strokeWidth={1.5} />
                ))}
                {weeksData.map((week, i) => (
                    <line key={`w-line-${i}`} x1={week.startX} y1={MONTH_HEIGHT} x2={week.startX} y2={TOTAL_HEIGHT} stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth={1.5} />
                ))}

                {/* DEPENDÊNCIAS FUNDO */}
                {dependenciesToRender.map(dep => {
                    if (dep.id === hoveredDepId) return null;
                    return (
                        <path
                            key={dep.id}
                            d={dep.pathData}
                            fill="none"
                            stroke="#cbd5e1"
                            strokeWidth={1.5}
                            markerEnd="url(#arrow)"
                            onMouseEnter={() => setHoveredDepId(dep.id)}
                            onMouseLeave={() => setHoveredDepId(null)}
                            style={{ cursor: "pointer", transition: "stroke 0.2s" }}
                        />
                    );
                })}

                {/* BARRAS DE TAREFA */}
                {tasks.map((task, index) => {
                    const coords = taskCoordsMap.get(task.id);
                    if (!coords) return null;
                    const y = HEADER_HEIGHT + (index * ROW_HEIGHT);

                    return (
                        <rect
                            key={`task-${task.id}`}
                            x={coords.startX}
                            y={y + ROW_PADDING}
                            width={Math.max(coords.endX - coords.startX, 4)} 
                            height={ROW_HEIGHT - (ROW_PADDING * 2)}
                            fill={task?.color ?? "#94a3b8"}
                            rx={4}
                            ry={4}
                            style={{ cursor: "pointer", transition: "filter 0.2s" }}
                            onMouseMove={(e) => {
                                setPopover({
                                    x: e.clientX,
                                    y: e.clientY,
                                    task: task
                                });
                            }}
                            onMouseLeave={() => setPopover(null)}
                        />
                    );
                })}

                {/* DEPENDÊNCIA SELECIONADA */}
                {dependenciesToRender.map(dep => {
                    if (dep.id !== hoveredDepId) return null;
                    return (
                        <path
                            key={`hover-${dep.id}`}
                            d={dep.pathData}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth={2.5}
                            markerEnd="url(#arrow-hover)"
                            onMouseEnter={() => setHoveredDepId(dep.id)}
                            onMouseLeave={() => setHoveredDepId(null)}
                            style={{ cursor: "pointer" }}
                        />
                    );
                })}

                {/* HEADER */}
                <g id="timeline-header">
                    <rect x={0} y={0} width={TOTAL_SVG_WIDTH} height={HEADER_HEIGHT} fill="#f1f5f9" opacity={0.95} />
                    <line x1={0} y1={HEADER_HEIGHT} x2={TOTAL_SVG_WIDTH} y2={HEADER_HEIGHT} stroke="#cbd5e1" strokeWidth={2} />
                    
                    {monthsData.map((month, i) => {
                        const rawCenter = month.startX + (month.width / 2);
                        const safeX = Math.max(40, Math.min(rawCenter, TOTAL_SVG_WIDTH - 40));

                        const fullMonths = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                        const shortMonths = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                        
                        let label = "";
                        if (month.width >= 120) {
                            label = `${fullMonths[month.dateObj.getUTCMonth()]} ${month.dateObj.getUTCFullYear()}`;
                        } else if (month.width >= 70) {
                            label = `${shortMonths[month.dateObj.getUTCMonth()]}/${month.dateObj.getUTCFullYear()}`;
                        } else if (month.width >= 35) {
                            label = shortMonths[month.dateObj.getUTCMonth()];
                        }

                        return (
                            <text key={`m-text-${i}`} x={safeX} y={18} fontSize="12" fontWeight="bold" fill="#334155" textAnchor="middle">
                                {label}
                            </text>
                        )
                    })}

                    {/* SOLUÇÃO DE OVERFLOW PARA AS SEMANAS/DIAS */}
                    {weeksData.map((week, i) => {
                        // Se a marcação estiver muito perto da borda direita (últimos 35px), 
                        // invertemos a âncora para a esquerda (end) e subtraímos 5px ao invés de somar.
                        const isNearEnd = week.startX > TOTAL_SVG_WIDTH - 35;
                        const safeX = isNearEnd ? week.startX - 5 : week.startX + 5;
                        
                        return (
                            <text 
                                key={`w-text-${i}`} 
                                x={safeX} 
                                y={MONTH_HEIGHT + 16} 
                                fontSize="10" 
                                fill="#64748b"
                                textAnchor={isNearEnd ? "end" : "start"}
                            >
                                {week.label}
                            </text>
                        );
                    })}
                </g>
            </svg>

            {/* POPOVER DA TAREFA */}
            {popover && (
                <div 
                    style={{
                        position: "fixed",
                        left: popover.x + 15,
                        top: popover.y + 15,
                        backgroundColor: "#1e293b",
                        color: "#f8fafc",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        pointerEvents: "none", 
                        zIndex: 1000,
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                >
                    <p style={{ margin: 0, fontWeight: "bold" }}>{popover.task.name}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
                        Início: {formatDateSafe(popover.task.start)}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8" }}>
                        Fim: {formatDateSafe(popover.task.end)}
                    </p>
                </div>
            )}
        </div>
    );
};