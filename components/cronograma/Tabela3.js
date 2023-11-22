    import React, { useEffect, useState } from 'react';
    import { Chart } from "react-google-charts";

    const formatDate = (dateString) => {
        // Converte a data da string para um objeto de data
        const date = new Date(dateString);
    
        // Adiciona um dia à data
        date.setDate(date.getDate() + 1);
    
        // Formata a data
        const formattedDate = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        });
    
        var dateParts = formattedDate.split("/");
        return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    };


    const Tabela = () => {
        const columns = [
    { type: "string", label: "Task ID" },
    { type: "string", label: "Task Name" },
    { type: "string", label: "Resource" },
    { type: "date", label: "Start Date" },
    { type: "date", label: "End Date" },
    { type: "number", label: "Duration" },
    { type: "number", label: "Percent Complete" },
    { type: "string", label: "Dependencies" },
    ];



    const dados = {
        item: 'ASDASD',
        area: 'EMES',
        inicio: '2023-05-23T00:00:00.000Z',
        termino: '2023-05-25T00:00:00.000Z',
        dp_item: 'PEDRO PEDRO',
        dp_area: 'PEDRO PEDRO',
        situacao: 'concluido',
      };

const rows = [
    [
        dados.area+dados.item,
        dados.item,
        dados.area,
        formatDate(dados.inicio),
        formatDate(dados.termino),
        null,
        100,
        null
    ],
    [
        "Research",
        "Find sources",
        null,
        new Date(2023, 0, 1),
        new Date(2023, 0, 5),
        null,
        100,
        null,
    ],
    [
        "Write",
        "Write paper",
        "write",
        null,
        new Date(2023, 0, 9),
        3 * 24 * 60 * 60 * 1000,
        25,
        "Research,Outline",
    ],
    [
        "Cite",
        "Create bibliography",
        "write",
        null,
        new Date(2023, 0, 7),
        1 * 24 * 60 * 60 * 1000,
        20,
        "Research",
    ],
    [
        "Complete",
        "Hand in paper",
        "complete",
        null,
        new Date(2023, 0, 10),
        1 * 24 * 60 * 60 * 1000,
        0,
        "Cite,Write",
    ],
    [
        "Outline",
        "Outline paper",
        "write",
        null,
        new Date(2023, 0, 6),
        1 * 24 * 60 * 60 * 1000,
        100,
        "Research",
    ],
    ];

    const data = [columns, ...rows];

    const options = {
    gantt: {
        criticalPathEnabled: false,
        innerGridHorizLine: {
        stroke: "#ffe0b2",
        strokeWidth: 2,
        },
        innerGridTrack: { fill: "#fff3e0" },
        innerGridDarkTrack: { fill: "#ffcc80" },
    },
    };


    return (
        <div className="centered-container">
        <Chart
        chartType="Gantt"
        width="100%"
        height="1000px"
        data={data}
        options={options}
        />
        </div>
    );
    };

    export default Tabela;
