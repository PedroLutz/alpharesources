import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Timeline Monitoring</b> is used for tracking the Project Schedule.<br /><br />
                    This table should only be used after registering the WBS in <Link href="/pags/wbs/wbs">WBS</Link> and the planned timeline in <Link href="/pags/timeline/timeline_plan">Estimated Timeline</Link>.<br /><br />
                    In the <b>Quick update</b> area, choose the task and one of three options:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ol>
                        <li><b>Start task</b>: set the starting date of the task as the current day and set status as "executing".</li>
                        <li><b>Check execution</b>: set the last execution as the current day.</li>
                        <li><b>Complete task</b>: set the last execution as the current day and set status as "complete".</li>
                        <li><b>Reset dates</b>: Reset the dates of task and set status as "starting". <b>Use only when necessary.</b></li>
                    </ol>
                    </div>
                    The Project Manager should <b>use the quick update every day</b>, to guarantee all tasks are up-to-date.<br/><br/>
                    If <b>manual updating</b> is necessary, click <b>Show table</b>. <br/><br/>
                    Below the table, all areas are listed, alongside their status in relation to execution (<b>starting, executing, hold</b> and <b>complete</b>) and in relation to the schedule (<b>on schedule</b> and <b>overdue</b>).<br/>
                    If an area is on <b>hold</b>, it means there are no tasks in execution, but there are still tasks to be started.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;