import React, { useEffect, useState } from "react";
import Loading from '../../../ui/Loading';
import { fetchData } from '../../../../functions/crud';
import styles from '../../../../styles/modules/cbs.module.css'

const Tabela = () => {
    const [dadosCbs, setDadosCbs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cores, setCores] = useState([]);

    //funcao para puxar os dados e atribuilos ao estado dadosCBS
    const fetchCbs = async () => {
        try {
            const data = await fetchData('recursos/cbs/get/all');
            const data_emvs = await fetchData('riscos/analise/get/emvs_per_item');
            data.cbs.forEach((item) => {
                item.contingencia = data_emvs.resultadosAgrupados[item.item];
            })
            setDadosCbs(data.cbs);
        } finally {
            setLoading(false);
        }
    }

    //funcao para puxar as cores e criar uma array de objetos no formato {area : cor}
    const fetchCores = async () => {
        const data = await fetchData('wbs/get/cores');
        var cores = {};
        data.areasECores.forEach((area) => {
            cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
        })
        setCores(cores);
    }


    //useEffect que só executa na primeira render
    useEffect(() => {
        fetchCbs();
        fetchCores();
    }, []);


    //funcao para calcular o rowSpan do td de areas de acordo com a quantidade de itens q tem
    const calculateRowSpan = (itens, currentArea, currentIndex, parametro) => {
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < itens.length; i++) {
            if (itens[i][parametro] === currentArea) {
                rowSpan++;
            } else {
                break;
            }
        }
        return rowSpan;
    };

    return (
        <div className="centered-container">
            {loading && <Loading />}
            <h2>Cost Breakdown Structure (CBS)</h2>

            <div className={styles.tabela_cbs_container}>
                <div className={styles.tabela_cbs_wrapper}>
                    <table className={styles.tabela_cbs}>
                        <thead>
                            <tr>
                                <th>Area</th>
                                <th>Item</th>
                                <th className={styles.td_custos}>Ideal cost</th>
                                <th className={styles.td_custos}>Essential cost</th>
                                <th style={{ fontSize: '0.7rem' }} className={styles.td_custos}>Contingency</th>
                                <th className={styles.td_custos}>Actual cost</th>
                                <th>Comparison</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dadosCbs.map((cbs, index) => (
                                <React.Fragment key={index}>
                                    <tr style={{ backgroundColor: cores[cbs.area] }}>
                                        {index === 0 || dadosCbs[index - 1].area !== cbs.area ? (
                                            <td rowSpan={calculateRowSpan(dadosCbs, cbs.area, index, 'area')}
                                            >{cbs.area}</td>
                                        ) : null}
                                        <td>{cbs.item}</td>
                                        <td className={styles.td_custos}>R${parseFloat(cbs.custo_ideal).toFixed(2)}</td>
                                        <td className={styles.td_custos}>R${parseFloat(cbs.custo_essencial).toFixed(2)}</td>
                                        <td className={styles.td_custos}>R${cbs.contingencia ? parseFloat(cbs.contingencia).toFixed(2) : 0}</td>
                                        <td className={styles.td_custos}>R${cbs.custo_real}</td>
                                        <td>In relation to: <br />
                                            Ideal cost: R${parseFloat(cbs.custo_real - cbs.custo_ideal).toFixed(2)}<br />
                                            Essencial cost: R${parseFloat(cbs.custo_essencial - cbs.custo_ideal).toFixed(2)}<br />
                                            Ideal cost + contingency: R${parseFloat(cbs.custo_real + (cbs.contingencia ? cbs.contingencia : 0) - cbs.custo_ideal).toFixed(2)}<br />
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

export default Tabela;