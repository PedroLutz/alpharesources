import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Stakeholder Identification</b> is used for registering all stakeholders.<br /><br />
                    This table should only be used after registering all stakeholder groups in <Link href="/pags/communication/stakeholderGroups">Stakeholder Groups</Link>.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Stakeholder Group</b>: the name of the stakeholder.</li>
                        <li><b>Involvement</b>: a description of how the stakeholder is involved in the project.</li>
                        <li><b>Potential influence</b>: classified as high/low: influence of the stakeholder on the project.</li>
                        <li><b>Potential impact</b>: classified as high/low: how much the project impacts the stakeholder.</li>
                        <li><b>Power and interest</b>: classified as high/low: the level of power and interest of the stakeholder on the project.</li>
                        <li><b>Expectations</b>: a description of what the stakeholder expects from the team and the project.</li>
                        <li><b>Requisites</b>: a description of what the stakeholder requires from the team and the project.</li>
                        <li><b>Positive/negative engagement</b>: descriptions of how the team is affected by the positive or negative engagement of the stakeholder.</li>
                    </ul>
                    </div>
                    Obs: <b>Positive engagement</b> generate benefits that come from having the stakeholder working together with the team.
                    <b> Negative engagement</b> generate damage that come from not having the help of the stakeholder or having it actively working against the team.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;