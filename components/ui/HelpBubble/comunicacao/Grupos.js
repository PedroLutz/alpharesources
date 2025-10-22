import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Stakeholder Groups</b> is used for registering all groups of stakeholders.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Stakeholder Group</b>: the name of the stakeholder group.</li>
                        <li><b>Involvement</b>: a description of how the group is involved in the project.</li>
                        <li><b>Potential influence</b>: a description of how the group can influence project decisions.</li>
                        <li><b>Potential impact</b>: a description of how the group can be impacted by the project.</li>
                        <li><b>Power</b>: a description of the power the group holds in the development of the project.</li>
                        <li><b>Interest</b>: a description of how interested the group is the project's success.</li>
                        <li><b>Expectations</b>: a description of what the group expects from the team and the project.</li>
                        <li><b>Requisites</b>: a description of what the group requires from the team and the project.</li>
                        <li><b>Positive/negative engagement</b>: descriptions of how the team is affected by the positive or negative engagement of the stakeholder group.</li>
                    </ul>
                    </div>
                    Obs: <b>Positive engagement</b> generate benefits that come from having the stakeholder group working together with the team.
                    <b> Negative engagement</b> generate damage that come from not having the help of the group or having it actively working against the team.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;