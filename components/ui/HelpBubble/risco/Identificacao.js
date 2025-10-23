import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Risk Identification</b> is used for planning all risks (positive or negative) that can affect the project.<br /><br />
                    This table should only be used after registering the WBS in <Link href="/pags/wbs/wbs">WBS</Link> and the team members in <Link href="/pags/responsibilities/members">Team Members</Link>.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Area and item</b>: the WBS item which the risk affects.</li>
                            <li><b>Risk</b>: a short description of the risk itself.</li>
                            <li><b>Classification</b>: normative (regarding competition rules), technical (regarding task execution), managerial (regarding project management) or financial (regarding resources/finances).</li>
                            <li><b>Category</b>: threat (negative risk) or opportunity (positive risk).</li>
                            <li><b>Effect</b>: a short description of how the risk affects the project.</li>
                            <li><b>Cause</b>: a short description of what might cause the risk to happen.</li>
                            <li><b>Trigger</b>: situation or result that indicates that the risk is happening.</li>
                            <li><b>Owner</b>: team member responsible for monitoring, preventing and/or responding to the risk.</li>
                        </ul>
                    </div>
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;