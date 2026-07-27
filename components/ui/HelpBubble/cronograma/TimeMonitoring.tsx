import Link from "next/link";

type HelpBubbleProps = {
    setShowHelp: React.Dispatch<React.SetStateAction<boolean>>;
}

const HelpBubble = ({ setShowHelp } : HelpBubbleProps) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Time Management</b> is used for creating and tracking the Project Schedule.<br /><br />
                    This table should only be used after registering the WBS in <Link href="/pags/wbs/wbs">WBS</Link>. Every item registered in the WBS is automatically registered in this page.<br /><br />
                    Each WBS item has two related tasks in the Gantt chart: <b>planned</b> (above, with lower opacity) and <b>actual</b> (below). 
                    The dates for each task can be viewed in the table next to the chart. The Status column in the same table displays the status of the actual task.<br /><br />

                    By clicking ⚙️ in any task, the Project Manager can update task data. The first four buttons are used for <b>Quick Updating</b>.
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ol>
                            <li><b>Start</b>: set the starting date of the task as the current day and set status as "Executing".</li>
                            <li><b>Execution</b>: set the last execution as the current day.</li>
                            <li><b>Complete</b>: set the last execution as the current day and set status as "Complete".</li>
                            <li><b>Reset</b>: Reset the dates of task and set status as "starting". <b>Use only when necessary.</b></li>
                        </ol>
                    </div>
                    The Project Manager should <b>use the quick update every day</b>, to guarantee all tasks are up-to-date.<br/><br/>
                    If <b>manual updating</b> is necessary, the Manager may use the fields below the four buttons. It is only through manual updating that dependencies can be set.<br/><br/>
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;