import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Risk Analysis</b> is used for quantitative risk analysis.<br /><br />
                    This table should only be used after registering all risks in <Link href="/pags/risk/risks">Risk Identification</Link>.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Risk</b>: the risk itself.</li>
                            <li><b>Occurrence</b>: how likely is the risk to happen, ranked from 1 to 5.</li>
                            <li><b>Impact</b>: how impactful is the risk, ranked from 1 to 5.</li>
                            <li><b>Action</b>: how difficult it is to execute a response plan, ranked from 1 to 5.</li>
                            <li><b>Urgency</b>: how urgent it is to respond to the plan, ranked from 1 to 5.</li>
                            <li><b>Financial Impact</b>: the monetary cost of dealing with the risk.</li>
                            <li><b>Schedule Impact</b>: the ammount of days needed to dealing with the risk.</li>
                        </ul>
                    </div>
                    The table also automatically calculates 3 KPIs:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Risk Priority Number (RPN)</b>: the product of Occurrence, Impact, Action and Urgency. Risks with the most RPN should receive the most attention.</li>
                            <li><b>Estimated Monetary Value (EMV)</b>: Financial Impact * Occurence / 5. It is an indicator of how much money should be reserved for dealing with this risk. The sum of EMVs for each WBS area is automatically added to the Ideal Scenario + Reserves graph in 
                            <Link href="/pags/resources/acquisition_planning"> Resource Acquisition Planning</Link></li>
                            <li><b>Estimated Time Impact (ETI)</b>: Schedule Impact * Occurence / 5. It is an indicator of how many days should be reserved for dealing with this risk. The sum of ETIs for each WBS item is automatically added to the Schedule with contingencies in
                            <Link href="pags/timeline/timeline_plan"> Estimated Timeline</Link></li>
                        </ul>
                    </div>
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;