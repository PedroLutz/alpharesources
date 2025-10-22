import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Planned Schedule vs Reality</b> is used for comparing the Estimated Timeline and the Actual Timeline.<br /><br />
                    This table should only be used after registering the WBS in <Link href="/pags/wbs/wbs">WBS</Link>, scheduling the project in <Link href="/pags/timeline/timeline_plan">Estimated Timeline</Link> and monitoring it in <Link href="/pags/timeline/monitoring">Timeline Monitoring</Link>.<br /><br />
                    Each row contains, as the top line, the <b>planned duration</b> of the item.<br/>
                    As the bottom line, the <b>actual duration</b> of the item.<br/><br/>
                    If an area or item's name is too long, it may be reduced to its initials, in order to guarantee the graph's visual stability.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;