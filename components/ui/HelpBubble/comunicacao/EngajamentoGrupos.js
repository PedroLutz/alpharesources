import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Stakeholder Group Engagement Matrix</b> is used for evaluating all stakeholder groups' engagement.<br /><br />
                    This table should only be used after registering all stakeholder groups in <Link href="/pags/communication/stakeholderGroups">Stakeholder Groups</Link>. All data from Stakeholder Groups is automatically registered in this table, and deletions in Stakeholder Groups are deleted here.<br /><br />
                    This table allows for determining quantitatively the power/interest mapping of stakeholder groups.<br/><br/>
                    In relation to power, all ranked from 1 to 5:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Dependency</b>: how much the team depends on this stakeholder group.</li>
                        <li><b>Influence</b>: how much influence the stakeholder group exerts on the team and the project.</li>
                        <li><b>Resource Control</b>: how much control the stakeholder group has on resources.</li>
                    </ul>
                    </div>
                    In relation to interest, all ranked from 1 to 5:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Impact</b>: how impacted the stakeholder group is by the project.</li>
                        <li><b>Engagement</b>: how involved the stakeholder is in the project.</li>
                        <li><b>Alignment of values</b>: how aligned are the teams values to the group.</li>
                    </ul>
                    </div>
                    Current and expected engagement level are used to define the level of involvement of the stakeholder group. The team should define an expected engagement level and strategies to reach it with said stakeholder group.<br/>
                    The table also generates the power-interest mapping based on the averages of each attribute. An average below 2.5 is low, and above is high. The mapping follows the rule: <br/>
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>High Power, High Interest</b>: Close management</li>
                        <li><b>High Power, Low Interest</b>: Keep satisfied</li>
                        <li><b>Low Power, High Interest</b>: Keep informed</li>
                        <li><b>Low Power, Low Interest</b>: Monitor</li>
                    </ul>
                    </div>
                    Obs: for more information, research the Power-Interest matrix.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;