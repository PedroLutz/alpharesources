import { TempoProvider, useTempo } from "./data/TempoContext"
import Loading from "../../ui/Loading";
import { DepsData, GanttChart, PlanData, RealData } from "../../ui/GanttChart/GanttChart";
import { useCallback, useEffect, useState } from "react";
import { handleReq } from "../../../functions/crud_s";
import useAuth from "../../../hooks/useAuth";
import { useToolbar } from "../../../hooks/useToolbar";
import HelpBubble from "../../ui/HelpBubble/cronograma/TimeMonitoring";

type QuickUpdateActionType = "start" | "execute" | "complete";

type UpdateDataType = {
    id: number | string; 
    user_id: any;
    status?: string | null; 
    start?: string | null; 
    end?: string | null;
}

const Content = () => {
    const { setIsLoading, isLoading, chartData, refetchData } = useTempo();
    const {user, token} = useAuth();

    const { setExportCSVClick, setHelpClick } = useToolbar();
    const [ showHelp, setShowHelp ] = useState(false);

    useEffect(() => {
            setHelpClick(() => () => setShowHelp(true));
    
            return (() => {
                setHelpClick(null);
            })
        }, []);

    const handleOnQuickUpdate = useCallback( async (id: number | string, action: QuickUpdateActionType) => {
        const today = new Date();
        const formattedDate = today
                .toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
                .split(',')[0];
        const data : UpdateDataType = {
            id,
            user_id: user?.id
        };

        switch(action){
            case "start": {
                data.status = "executing";
                data.start = formattedDate;
                data.end = null;
                break;
            }
            case "execute": {
                data.end = formattedDate;
                break;
            }
            case "complete": {
                data.status = "complete";
                data.end = formattedDate;
                break;
            }
        }

        await handleReq({
            table: "gantt_data",
            route: "update",
            token,
            data
        })
        await refetchData();
    }, [handleReq, setIsLoading, refetchData, user, token])

    const handleOnStart = useCallback(async (id: number | string) => {
        setIsLoading(true);
        await handleOnQuickUpdate(id, "start");
        setIsLoading(false);
    }, [handleOnQuickUpdate]);

    const handleOnExecute = useCallback(async (id: number | string) => {
        setIsLoading(true);
        await handleOnQuickUpdate(id, "execute");
        setIsLoading(false);
    }, [handleOnQuickUpdate]);

    const handleOnComplete = useCallback(async (id: number | string) => {
        setIsLoading(true);
        await handleOnQuickUpdate(id, "complete");
        setIsLoading(false);
    }, [handleOnQuickUpdate]);

    const handleOnReset = useCallback(async (id: number | string) => {
        setIsLoading(true);
        await handleReq({
            table: "gantt_data",
            route: "update",
            token,
            data: {
                id,
                user_id: user?.id,
                status: "start",
                start: null,
                end: null
            }
        })
        await refetchData();
        setIsLoading(false);
    }, [handleReq, setIsLoading, refetchData, user, token]);

    const handleOnSave = useCallback(async (plan: PlanData, real: RealData, deps: DepsData) => {
        setIsLoading(true);
        const dependencySubmitFunctions = [];
        deps.dependencies.forEach((dep) => {
            dependencySubmitFunctions.push(
                handleReq({
                    table: "gantt_dependency",
                    route: "create",
                    token,
                    data: {
                        gantt_id: deps.ganttId,
                        dependency_id: dep,
                        user_id: user?.id
                    }
                })
            )
        })
        await Promise.all([
            handleReq({ table: "gantt_data", route: "update", token, data: {...plan, user_id: user?.id} }),
            handleReq({ table: "gantt_data", route: "update", token, data: {...real, user_id: user?.id} }),
            ...dependencySubmitFunctions
        ])
        await refetchData();
        setIsLoading(false);
    }, [handleReq, setIsLoading, refetchData, user, token]);
    
    return (
        <div className="centered-container">
            {isLoading && <Loading />}
            {showHelp && <HelpBubble setShowHelp={setShowHelp} />}

            <h2 className="smallTitle">Time Management</h2>

            <GanttChart
                tasks={chartData}
                onSave={handleOnSave}
                onStart={handleOnStart}
                onExecute={handleOnExecute}
                onComplete={handleOnComplete}
                onReset={handleOnReset}
            />
        </div>
    )
}

export const Main = () => (
    <TempoProvider>
        <Content/>
    </TempoProvider>
)