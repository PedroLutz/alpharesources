import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Resource Identification</b> is used for registering all resources (financial, physical or human) needed for the project.<br /><br />
                    This table should only be used after registering the WBS in <Link href="/pags/wbs/wbs">WBS</Link>.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Area and item</b>: The item in which the resource is used.</li>
                        <li><b>Resource</b>: the resource itself.</li>
                        <li><b>Usage</b>: a short description of how the resource is meant to be used.</li>
                        <li><b>Type</b>: can be financial (monetary), physical (products and services) or human (external individuals that provide certain services).</li>
                        <li><b>Essential?</b>: essential resources are integral for the development of the project, as in the work cannot be completed without them. Non-essential resources are important, but are not necessary for the project's completion.</li>
                    </ul>
                    </div>
                    The table also automatically uses the planned start date of the WBS item the resource is used in for the <b>Utilization Forecast</b> column.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;