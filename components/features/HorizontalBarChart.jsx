// HorizontalBarChart.jsx
import React, { useMemo, useRef, useEffect, useState } from "react";

/**
 * props:
 *  - data: [{ area: "área a", total: 10, initiated: 6 }, ...]
 *  - width (px or % for svg element) default "100%"
 *  - barHeight default 14
 *  - gapBetweenGroups default 18
 *  - colors default ['#f28c28', '#a0a0a0']
 */
export default function HorizontalBarChart({
    data = [],
    width = "100%",
    barHeight = 14,
    gapBetweenGroups = 18,
    colors = ["#f28c28", "#a0a0a0"],
}) {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(800); // valor inicial qualquer

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(() => {
            const w = containerRef?.current?.clientWidth;
            setContainerWidth(w);
        });
        observer.observe(containerRef?.current);
        return () => observer.disconnect();
    }, []);

    const padding = { left: 25, right: 24, top: 24, bottom: 24 }; // left reserves space for labels
    const seriesCount = 2; // total + initiated
    const groupHeight = seriesCount * barHeight + (seriesCount - 1) * 6; // inner spacing
    const totalHeight =
        padding.top + padding.bottom + data.length * groupHeight + (data.length - 1) * gapBetweenGroups;
    const innerWidth = Math.max(10, containerWidth - padding.left - padding.right);
    const viewBoxWidth = containerWidth; // viewbox acompanha novo width real


    const maxValue = useMemo(() => {
        let max = 1;
        data.forEach((d) => {
            max = Math.max(max, d.total || 0, d.initiated || 0);
        });
        // add small headroom
        return Math.ceil(max * 1.05);
    }, [data]);

    const xForValue = (v) => (maxValue === 0 ? 0 : (v / maxValue) * innerWidth);

    return (
        <div ref={containerRef} style={{ width: "100%" }}>
            <svg
                width={width}
                height={totalHeight}
                viewBox={`0 0 ${viewBoxWidth} ${totalHeight}`}
                role="img"
                aria-label="horizontal bar chart"
            >
                <style>{`
        .label { font: 12px sans-serif; fill: #111 }
        .tick { font: 10px sans-serif; fill: #666 }
      `}</style>

                {/* background */}
                <rect x="0" y="0" width={viewBoxWidth} height={totalHeight} fill="transparent" />

                {/* x axis ticks (4 ticks) */}
                {Array.from({ length: 5 }).map((_, i) => {
                    const t = (i / 4) * maxValue;
                    const x = padding.left + xForValue(t);
                    return (
                        <g key={`tick-${i}`} transform={`translate(${x}, ${padding.top - 6})`}>
                            <line x1="0" y1="0" x2="0" y2={totalHeight - padding.top - padding.bottom} stroke="#eee" />
                            <text x="0" y="-6" textAnchor="middle" className="tick">{Math.round(t)}</text>
                        </g>
                    );
                })}

                {/* bars */}
                {data.map((row, idx) => {
                    const groupY =
                        padding.top + idx * (groupHeight + gapBetweenGroups);

                    const totalW = xForValue(row.total || 0);
                    const initiatedW = xForValue(row.initiated || 0);

                    const bar1Y = groupY; // total
                    const bar2Y = groupY + barHeight + 6; // initiated

                    return (
                        <g key={`group-${idx}`}>
                            {/* area label */}
                            <text
                                x={padding.left - 12}
                                y={groupY + barHeight}
                                textAnchor="end"
                                className="label"
                                dominantBaseline="middle"
                            >
                                {row.area}
                            </text>

                            {/* total bar */}
                            <g transform={`translate(${padding.left}, ${bar1Y})`} >
                                <rect
                                    x="0"
                                    y="0"
                                    width={Math.max(1, totalW)}
                                    height={barHeight}
                                    rx="3"
                                    ry="3"
                                    fill={colors[0]}
                                >
                                    <title>{`total: ${row.total || 0}`}</title>
                                </rect>
                                <text
                                    x={Math.max(6, totalW + 6)}
                                    y={barHeight / 2}
                                    alignmentBaseline="middle"
                                    className="label"
                                >
                                    {row.total}
                                </text>
                            </g>

                            {/* initiated bar */}
                            <g transform={`translate(${padding.left}, ${bar2Y})`} >
                                <rect
                                    x="0"
                                    y="0"
                                    width={Math.max(1, initiatedW)}
                                    height={barHeight}
                                    rx="3"
                                    ry="3"
                                    fill={colors[1]}
                                >
                                    <title>{`initiated: ${row.initiated || 0}`}</title>
                                </rect>
                                <text
                                    x={Math.max(6, initiatedW + 6)}
                                    y={barHeight / 2}
                                    alignmentBaseline="middle"
                                    className="label"
                                >
                                    {row.initiated}
                                </text>
                            </g>
                        </g>
                    );
                })}

                {/* legend */}
                <g transform={`translate(${padding.left}, ${totalHeight - padding.bottom + 4})`}>
                    <g transform="translate(0,0)">
                        <rect x="0" y="0" width="14" height="10" rx="2" fill={colors[0]} />
                        <text x="20" y="8" className="tick">total</text>
                    </g>
                    <g transform="translate(120,0)">
                        <rect x="0" y="0" width="14" height="10" rx="2" fill={colors[1]} />
                        <text x="20" y="8" className="tick">initiated</text>
                    </g>
                </g>
            </svg>
        </div>

    );
}
