import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Cost Breakdown Structure (CBS)</b> is a table compiling all relevant data regarding resource acquisition planning.<br /><br />
                    This page should only be viewed after registering all resource acquisition plans in <Link href="/pags/resources/acquisition_planning">Resource Acquisition Planning</Link>.<br /><br />
                    This table automatically collects the ideal cost and essential cost for each item (using the formula <b>(2 * [value of plan a] + [value of plan B])/3</b>), the contingency (as planned in <Link href={'/pags/risk/analysis'}>Risk Analysis</Link>) and the real cost (if registered in Resource Acquisition Planning).<br/><br/>
                    The site also automatically compares the real cost to both scenarios and the contingency. If the difference is positive, it means the real cost was bigger than planned; if it is negative, the real cost was smaller than planned.<br/><br/>
                    Obs: <b>"Real cost"</b> comes from the result section of <Link href="/pags/resources/acquisition_planning">Resource Acquisition Planning</Link>, <b>NOT</b> from Financial Releases.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;