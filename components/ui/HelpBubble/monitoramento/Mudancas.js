import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Change Log</b> is used for registering changes in any area of the project.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Date</b>: the date of the change request.</li>
                            <li><b>Area</b>: the WBS Area that is affected by the change.</li>
                            <li><b>Type of change</b>: the nature of the change.</li>
                            <li><b>Configurated item</b>: the item that received the change (may be a process or a product, for example).</li>
                            <li><b>Change</b>: a description of the change.</li>
                            <li><b>Reasoning</b>: the reasoning for changing the item.</li>
                            <li><b>Decision</b>: if the change was approved or rejected the responsible for approval.</li>
                            <li><b>Status</b>: if approved, the current status of the change.</li>
                            <li><b>Applicant</b>: the individual that requested the change (may be internal or external).</li>
                            <li><b>Applicant</b>: the individual that approves the change (may be internal or external).</li> 
                        </ul>
                    </div>
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;