import React, { useEffect, useState } from "react";
import Loading from '../../../ui/Loading';
import { handlePostFetch, handleFetch } from "../../../../functions/crud_s";
import styles from '../../../../styles/modules/cbs.module.css'
import useAuth from "../../../../hooks/useAuth";
import HelpBubble from '../../../ui/HelpBubble/recursos/Cbs';
import { getTextColor } from "../../../../functions/colors";
import { calculateRowSpan } from "../../../../functions/general";

const Tabela = () => {
    const [dadosCbs, setDadosCbs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuth();
    const user_id = user.id;
    const [showHelp, setShowHelp] = useState(false);

    //funcao para puxar os dados e atribuilos ao estado dadosCBS
    const fetchCbs = async () => {
        try {
            const data = await handlePostFetch({
                table: 'resource_acquisition_plan',
                query: 'cbs',
                token,
                data: { uid: user_id }
            })
            const array = [];
            data.data.forEach(item => {
                var obj = array.find(i => i.item_id == item.item_id);
                const isUndefined = obj === undefined;
                if (isUndefined) obj = {
                    area_color: item.area_color,
                    area_id: item.area_id ?? -1,
                    area_name: item.area_name ?? "Others",
                    item_id: item.item_id ?? -1,
                    item_name: item.item_name ?? "Others",
                    essential_cost: 0,
                    ideal_cost: 0,
                    real_cost: item.total_real ?? 0
                }
                if (item.is_essential) {
                    obj.essential_cost = (item.total_a * 2 + item.total_b) / 3
                }
                obj.ideal_cost += (item.total_a * 2 + item.total_b) / 3;
                if(isUndefined) array.push(obj);
            })
            const data_emvs = await handleFetch({
                table: 'risk_analysis',
                query: 'emvs_per_item_w_info',
                token,
            })
            var contingencies = {};
            data_emvs.data.forEach(item =>{
                const id = item?.risk?.wbs_item?.id || -1;
                if(!contingencies[id]) contingencies[id] = 0;
                contingencies[id] += item.financial_impact * (item.occurrence / 5);
            })
            for(const key in contingencies){
                var obj = array.find(i => i.item_id == key);
                const isUndefined = obj === undefined;
                if(isUndefined){
                    const found = data_emvs.data.find(i => i?.risk?.wbs_item?.id == key);
                    obj = {
                        area_color: found?.risk?.wbs_item?.wbs_area?.color || '#ffffff',
                        area_id: found?.risk?.wbs_item?.wbs_area?.id || -1,
                        area_name: found?.risk?.wbs_item?.wbs_area?.name || "Others",
                        item_id: found?.risk?.wbs_item?.id || -1,
                        item_name: found?.risk?.wbs_item?.name || "Others",
                        essential_cost: 0,
                        ideal_cost: 0,
                        real_cost: 0
                    }
                }
                obj.contingency = contingencies[key];
                if(isUndefined) array.push(obj);
            }
            array.sort((a, b) => {
                const areaComparison = a.area_name.localeCompare(b.area_name);
                if(areaComparison !== 0) return areaComparison;
                return a.item_name.localeCompare(b.item_name);
            });

            setDadosCbs(array);
            
        } finally {
            setLoading(false);
        }
    }

    //useEffect que só executa na primeira render
    useEffect(() => {
        fetchCbs();
    }, []);

    return (
        <div className="centered-container">
            {loading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp}/>}
            <h2 className="smallTitle">Cost Breakdown Structure (CBS) <button onClick={()=>setShowHelp(true)}>❔</button></h2>

            <div className={styles.tabela_cbs_container}>
                <div className={styles.tabela_cbs_wrapper}>
                    <table className="tabela">
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
                            {dadosCbs.map((cbs, index) => { 
                                const contingency = cbs.contingency ? parseFloat(cbs.contingency).toFixed(2) : "0.00";

                                const comparisonIdeal = parseFloat(cbs.real_cost - cbs.ideal_cost).toFixed(2);
                                const comparisonEssential = parseFloat(cbs.essential_cost - cbs.ideal_cost).toFixed(2);
                                const comparisonContingency = parseFloat(cbs.real_cost - (cbs.contingency || 0) - cbs.ideal_cost).toFixed(2);

                                return (
                                <React.Fragment key={index}>
                                    <tr style={{ backgroundColor: cbs.area_color, color: getTextColor(cbs.area_color) }}>
                                        {index === 0 || dadosCbs[index - 1].area_id !== cbs.area_id ? (
                                            <td rowSpan={calculateRowSpan(dadosCbs, cbs.area_id, index, 'area_id')}
                                            >{cbs.area_name}</td>
                                        ) : null}
                                        <td>{cbs.item_name}</td>
                                        <td className={styles.td_custos}>R${parseFloat(cbs.ideal_cost).toFixed(2)}</td>
                                        <td className={styles.td_custos}>R${parseFloat(cbs.essential_cost).toFixed(2)}</td>
                                        <td className={styles.td_custos}>R${contingency}</td>
                                        <td className={styles.td_custos}>R${parseFloat(cbs.real_cost).toFixed(2)}</td>
                                        <td className={styles.tdComparacao}>In relation to: <br />
                                            Ideal cost: R${comparisonIdeal}<br />
                                            Essential cost: R${comparisonEssential}<br />
                                            Ideal cost + contingency: R${comparisonContingency}<br />
                                        </td>
                                    </tr>
                                </React.Fragment>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

export default Tabela;