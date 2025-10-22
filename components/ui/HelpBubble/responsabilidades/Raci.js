import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>RACI Matrix</b> is used for registering each team member's level of responsibility for each WBS item.<br /><br />
                    This table should only be used after registering the WBS in <Link href="/pags/wbs/wbs">WBS</Link> and all team members in <Link href="/pags/responsibilities/raci">Team members</Link>.<br />
                     By default, the table hides the inputs. Press <b>Toggle options</b> to submit, edit or delete data.<br /><br />
                    Each team member can be categorized into one of four levels of responsibility:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Responsible (R)</b>: the ones responsible for performing the task and delivering the task. <b>At least one per WBS item</b>.</li>
                        <li><b>Accountable (A)</b>: the one that approves the execution of the task, or the "owner". <b>Exactly one per WBS item</b>.</li>
                        <li><b>Consulted (C)</b>: the ones not directly involved with carrying the task, but still are still needed for assistance.</li>
                        <li><b>Informed (I)</b>: the ones who receive output from the task, or simply need to be informed.</li>
                    </ul>
                    </div>
                    Obs: even if a team member has nothing to do with a task, they should be informed about it.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;