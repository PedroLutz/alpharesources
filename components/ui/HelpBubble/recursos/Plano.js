import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Resource Acquisition Plan</b> is used for registering how each resource is planned to be acquired.<br /><br />
                    This table should only be used after registering the WBS in <Link href="/pags/wbs/wbs">WBS</Link> and all resources in <Link href="/pags/resources/identification">Resource Identification</Link>.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Resource</b>: the resource itself.</li>
                        Each resource receives two procurement strategies (Plan A and B). For each plan:
                        <li><b>Method</b>: how the product is going to be acquired (purchase, rental, borrowing or outsourcing).</li>
                        <li><b>Supplier</b>: the name of the supplier (company, store or individual).</li>
                        <li><b>Details</b>: any relevant details to the acquisition, such as quantities and unit value.</li>
                        <li><b>Value</b>: the <b>total</b> value of the acquisition (<b>not</b> the individual value of individual parts of the acquisition).</li><br/>
                        For each resource, it is needed to define milestones:
                        <li><b>Expected date</b>: the date where the resource should be acquired.</li>
                        <li><b>Critical date</b>: the limit date for acquiring the product before harming the schedule.</li>
                        
                        <br/>
                        <b>Optionally</b>, results can be registered:
                        <li><b>Actual strategy</b>: a description of how the purchase happened in reality.</li>
                        <li><b>Date, value</b>: the real date and value of the purchase.</li>
                    </ul>
                    </div>
                    If the results are registered, the table automatically compares the date and the value of the acquisition with the plans.<br/><br/>
                    Below the table, graphs are generated based on the plans, one with the essential scenario (only essential items) and the other with the ideal scenario (all items). Clicking on <b>View reserves</b> adds financial reserves based on data from <Link href={'/pags/risk/analysis'}>Risk Analysis</Link>.<br/><br/>
                    Each graph displays, for each scenario and each area, the sums of the weighed averages of the value of each plan, using the formula <b>(2 * [value of plan a] + [value of plan B])/3</b>. This is to allow the generation of a single graph for clarity, but still give more weight to Plan A (as it is the most likely to happen).
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;