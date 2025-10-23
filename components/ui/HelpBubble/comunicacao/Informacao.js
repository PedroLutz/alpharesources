import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Communicated Information</b> is used for planning and registering communication processes with stakeholders.<br /><br />
                    This table should only be used after registering all stakeholders in <Link href="/pags/communication/stakeholders">Stakeholder Identification</Link>.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Stakeholder Group, Stakeholder</b>: the stakeholder in question.</li>
                            <li><b>Information</b>: list of topics communicated to the stakeholder.</li>
                            <li><b>Method</b>: Active, Interactive or Passive communication, or a combination of all three.</li>
                            <li><b>Frequency</b>: how frequent should this information be communicated.</li>
                            <li><b>Channel</b>: where the information should happen (email addresses, phone numbers, other communication tools).</li>
                            <li><b>Responsible</b>: the team member responsible for communication.</li>
                        </ul>
                    </div>
                    <b>Optionally</b>, evidence of the communication can be stored.
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Record</b>: link to screenshot, video or documented proof of the communication.</li>
                            <li><b>Feedback</b>: small paragraph detailing feedback collected from the stakeholder.</li>
                            <li><b>Action taken</b>: small paragraph detailing if there was any action taken regarding the stakeholder's feedback.</li>
                        </ul>
                    </div>
                    Obs: for more information regading communication methods, research <Link href='https://www.projectmanagement.com/wikis/603872/communication-methods#_'>Communication Methods</Link> within Project Management.<br/><br/>
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;