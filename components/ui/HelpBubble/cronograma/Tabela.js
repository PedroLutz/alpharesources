import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    The <b>Estimated Timeline</b> is used for planning the Project Schedule.<br /><br />
                    This table should only be used after registering the WBS in <Link href="/pags/wbs/wbs">WBS</Link>.<br /><br />
                    Choose the <b>area</b> and the <b>task</b> based on the WBS.<br />
                    Type in the estimated dates for the <b>start</b> and <b>end</b> of the task.<br />
                    Optionally, choose the task that the current task <b>depends</b> on. A task cannot start before the task it depends on ends.<br /><br />

                    Tasks submitted in this table are also automatically submitted to the <Link href={"/pags/timeline/monitoring"}>Timeline Monitoring</Link> table.
                    At the same time, tasks deleted from this table are also automatically deleted from the <Link href={"/pags/timeline/monitoring"}>Timeline Monitoring</Link> table.<br /><br />

                    By clicking <b>Show contingencies</b>, additional time calculated in <Link href={'/pags/risk/analysis'}>Risk Analysis</Link> (if there is any) will be shown for each task in the graph and in the table.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;