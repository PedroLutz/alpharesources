import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Risk Audit</b> is used for registering risks that came into fruition and analyzing them.<br /><br />
                    This table should only be used after registering all risks in <Link href="/pags/risk/risks">Risk Identification</Link>.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Risk</b>: the risk itself.</li>
                            <li><b>Impact description</b>: details regarding how the risk affected the project.</li>
                            <li><b>Financial impact</b>: how much it cost to deal with the risk.</li>
                            <li><b>Schedule impact</b>: how long (in days) it took to deal with the risk.</li>
                            <li><b>Response</b>: the response strategy used to deal with the risk.</li>
                            <li><b>Impact</b>: the impact of the risk, ranked from 1 to 5.</li>
                            <li><b>Action</b>: the difficulty to deal with the risk, ranked from 1 to 5.</li>
                            <li><b>Urgency</b>: how urgent it was to respond to the risk, ranked from 1 to 5.</li>
                            <li><b>Evaluation description</b>: an evaluation regarding the risk, the response applied and the overall effect.</li>
                        </ul>
                    </div>
                    The table also automatically compares the risk with the planned financial impact, schedule impact, impact, action and urgency, as planned in <Link href="/pags/risk/analysis">Risk Analysis</Link>.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;