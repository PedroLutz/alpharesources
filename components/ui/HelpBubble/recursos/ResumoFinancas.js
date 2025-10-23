import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Financial Report</b> is a compilation of the results of financial movements compared to the resource acquisition plan.<br /><br />
                    This page should only be viewed after registering all resource acquisition plans in <Link href="/pags/resources/acquisition_planning">Resource Acquisition Planning</Link>.<br /><br />
                    The areas of this report include:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>General information</b>: current cash value, largest and total incomes and expenses.</li>
                            <li><b>KPIs per Area</b>: for each area, using the planned cost, the planned schedule and the actual cost, the website automatically calculates two KPIs: 
                                <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                                    <ul>
                                        <li><b>Aggregated value</b> (Percentage of execution multiplied by the planned cost), a estimation of how much should have been spent at the moment of visualization.</li>
                                        <li><b>Cost Performance Index (CPI)</b> (Aggregated value divided by Real cost), comparing planned cost and real cost. CPI {`>`} 1 means that the area is spending less than planned, and CPI {`<`} 1 means that the area is spending more than planned (and so, action needs to be taken).</li>
                                    </ul>
                                </div>
                            </li>
                            <li><b>Monthly Cash Flow</b>: a summary of monthly total incomes, expenses, movement and final balance.</li>
                            <li><b>Releases per area</b>: a visual summary of financial releases per area.</li>
                            <li><b>S Curve</b>: a comparison between planned costs, aggregated value and real costs during time. Ideally, the green line (representing real cost) should be below the red and blue lines (representing planned cost and aggregated value, respectively).</li>
                            <li><b>Releases per month</b>: a visual summary of financial releases per month.</li>
                            <li><b>Cash value per month</b>: a visual history of the cash available at the end of every month.</li>
                            <li><b>Cost growth per month</b>: a visual history of the total expenses every month.</li>
                        </ul>
                    </div>
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;