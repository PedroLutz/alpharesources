import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Risk Impact Analysis</b> is used for identifying the impact of the risk in areas of the project.<br /><br />
                    This table should only be used after registering all risks in <Link href="/pags/risk/risks">Risk Identification</Link>.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Risk</b>: the risk itself.</li>
                            <li><b>Area of Impact</b>: one of the areas impacted by the risk.</li>
                            <li><b>Score</b>: how impactful is the risk in that area, ranked from 1 to 5.</li>
                            <li><b>Description</b>: a description of how the risk impacts the selected area.</li>
                        </ul>
                    </div>
                    The Project Manager should register, for every single risk, multiple areas of impact, as this helps create response plans.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;