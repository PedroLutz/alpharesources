import React, { useState, useEffect, useRef } from "react";
import Loading from "../../ui/Loading";
import Modal from "../../ui/Modal";
import useAuth from "../../../hooks/useAuth";
import HelpBubble from "../../ui/HelpBubble/monitoramento/Relatorio";
import { generatePDF } from "./utils/generatePDF";
import { ReportProvider, useReport } from "./data/ReportContext";
import Menu from "./blocks/Menu";
import ProjectInformation from "./blocks/ProjectInformation";
import TaskAnalysis from "./blocks/TaskAnalysis";
import WorkCompletedVsResources from "./blocks/WorkCompletedVsResources";
import KpiAnalysis from "./blocks/KpiAnalysis";
import AreaAnalysis from "./blocks/AreaAnalysis";
import PredictionsOfFuture from "./blocks/PredictionsOfFuture";
import ProjectChanges from "./blocks/ProjectChanges";
import { useToolbar } from "../../../hooks/useToolbar";

const Relatorio = () => {
    const [exibirModal, setExibirModal] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const { styles, setIsLoading, isLoading, showReport } = useReport();

    const { setHelpClick } = useToolbar();

    useEffect(() => {
        setHelpClick(() => () => setShowHelp(true));

        return (() => {
            setHelpClick(null);
        })
    }, [setShowHelp]);

    const [teamLogo, setTeamLogo] = useState(null);
    const relatorioRef = useRef(null);

    const handleExportPDF = async () => {
        if (relatorioRef.current) {
            setIsLoading(true);
            await generatePDF(relatorioRef.current);
        }
    };

    return (
        <div className="centered-container">

            <h2 className="smallTitle">Status Report Generator</h2>

            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}

            <Menu handleExportPDF={handleExportPDF} setTeamLogo={setTeamLogo} />

            {showReport && (
                <div className={styles.report_container}>
                    <div ref={relatorioRef} className="reportToPrint" style={{ padding: '1rem', maxWidth: '95vw' }}>
                        <div className={styles.report} id="innerReport">
                            <ProjectInformation teamLogo={teamLogo} />
                            <TaskAnalysis />
                            <WorkCompletedVsResources />
                            <KpiAnalysis />
                            <AreaAnalysis />
                            <PredictionsOfFuture />
                            <ProjectChanges />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const Main = () => {
    return (
        <ReportProvider>
            <Relatorio />
        </ReportProvider>
    )
}

export default Main;