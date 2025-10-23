import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Risk Response Planning</b> is used for defining response plans for the risk.<br /><br />
                    This table should only be used after registering all risks in <Link href="/pags/risk/risks">Risk Identification</Link>.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Risk</b>: the risk itself.</li>
                            <li><b>Strategy</b>: changes depending if the risk is a threat or a opportunity.</li>
                            <li><b>Response</b>: a description of the response plan for that strategy.</li>
                        </ul>
                    </div>
                    Below, are the strategies for negative risks (threats):
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Avoid</b>: prevent the risk from happening.</li>
                            <li><b>Mitigate</b>: after the risk happens, reduce the impacts.</li>
                            <li><b>Transfer</b>: transfer the responsibility of dealing with the risk for a third party.</li>
                            <li><b>Accept</b>: do nothing (for low impact risks).</li>
                        </ul>
                    </div>
                    And as for the strategies for positive risks (opportunities):
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Exploit</b>: utilize the effects of the risk for self benefit.</li>
                            <li><b>Enhance</b>: increase the effects of the risk.</li>
                            <li><b>Share</b>: share the effects of the risk with other parties.</li>
                            <li><b>Ignore</b>: do nothing (for low impact risks).</li>
                        </ul>
                    </div>
                    The Project Manager should register, for every single risk, multiple response plans with multiple strategies.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;