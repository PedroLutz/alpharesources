import { useState, useEffect } from "react";
import Loading from '../../ui/Loading';
import { handleReq } from "../../../functions/crud_s";
import { cleanForm } from '../../../functions/general';
import styles from "../../../styles/modules/wbs_n.module.css"

const Main = () => {
    return (
        <div className="centered-container">
            <div className={styles.main_container}>

                <div className={styles.wbs_container}>
                    <div className={styles.area_block}>
                        <div className={styles.new_inputs}>
                            <input
                                placeholder="New area"
                            />
                            <div className={styles.new_inputs_color}>
                                <label>Color: </label>
                                <input type="color"/> 
                            </div>
                        </div>
                        <div className={styles.action_buttons}>
                            <button>✔️</button>
                        </div>
                    </div>
                </div>

                <div className={styles.wbs_container}>
                    <div className={styles.area_block}>
                        <span className={styles.area_label}>
                            Car
                        </span>
                        <div className={styles.action_buttons}>
                            <button>⚙️</button>
                            <button>❌</button>
                        </div>
                    </div>


                    <div className={styles.item_outer_block}>
                        <div className={styles.item_connective_line}></div>
                        <div className={styles.item_inner_block}>
                            <span className={styles.item_label}>Chassis Modelling</span>
                            <div className={styles.action_buttons}>
                            <button>⚙️</button>
                            <button>❌</button>
                        </div>
                        </div>
                    </div>

                    <div className={styles.item_outer_block}>
                        <div className={styles.item_connective_line}></div>
                        <div className={styles.item_inner_block}>
                            <span className={styles.item_label}>Components Modelling</span>
                            <div className={styles.action_buttons}>
                            <button>⚙️</button>
                            <button>❌</button>
                        </div>
                        </div>
                    </div>

                    <div className={styles.item_outer_block}>
                        <div className={styles.item_inner_block}>
                            <div className={styles.new_inputs}>
                                <input
                                placeholder="New item"
                                />
                            </div>
                            <div className={styles.action_buttons}>
                            <button>✔️</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.wbs_container}>
                    <div className={styles.area_block}>
                        <span className={styles.area_label}>
                            Project Management Documentation
                        </span>
                        <div className={styles.action_buttons}>
                            <button>⚙️</button>
                            <button>❌</button>
                        </div>
                    </div>


                    <div className={styles.item_outer_block}>
                        <div className={styles.item_connective_line}></div>
                        <div className={styles.item_inner_block}>
                            <span className={styles.item_label}>Extra Project Management Documents</span>
                            <div className={styles.action_buttons}>
                            <button>⚙️</button>
                            <button>❌</button>
                        </div>
                        </div>
                    </div>

                    <div className={styles.item_outer_block}>
                        <div className={styles.item_connective_line}></div>
                        <div className={styles.item_inner_block}>
                            <span className={styles.item_label}>Components Modelling</span>
                            <div className={styles.action_buttons}>
                            <button>⚙️</button>
                            <button>❌</button>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Main;