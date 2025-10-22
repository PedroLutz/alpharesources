import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Stakeholder Engagement Matrix</b> is used for evaluating all stakeholders' engagement.<br /><br />
                    This table should only be used after registering all stakeholders in <Link href="/pags/communication/stakeholders">Stakeholder Identification</Link>. All data from Stakeholder Groups is automatically registered in this table, and deletions in Stakeholder Groups are deleted here.<br /><br />
                    Power and interest are automatically gathered from <Link href="/pags/communication/stakeholders">Stakeholder Identification</Link> and used to generate the power-interest mapping.
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>High Power, High Interest</b>: Close management</li>
                        <li><b>High Power, Low Interest</b>: Keep satisfied</li>
                        <li><b>Low Power, High Interest</b>: Keep informed</li>
                        <li><b>Low Power, Low Interest</b>: Monitor</li>
                    </ul>
                    </div>
                    Obs: for more information, research the Power-Interest matrix.<br/><br/>
                    Current and expected engagement level are used to define the level of involvement of the stakeholder. The team should define an expected engagement level and strategies to reach it with said stakeholder.<br/>
                    
                    
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;