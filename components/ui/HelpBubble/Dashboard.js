import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
  return (
    <div className="overlay">
      <div className="modalHelp">
        <div>
          <h2>Help</h2>
          The <b>Dashboard</b> is a quick summary of the project.<br/><br/>
          By selecting the interval, the user may change the range of the analysis of certain areas of the Dashboard.<br/><br/>
          The areas of the Dashboard are:
          <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
            <ul>
              <li><b>Project Completion</b>: Comparison between the total number of tasks (registered in the <Link href="/pags/timeline/timeline_plan">Estimated Timeline</Link>) and the finished tasks.</li>
              <li><b>WBS Execution Summary</b>: Comparison between the total number of tasks (registered in the <Link href="/pags/timeline/timeline_plan">Estimated Timeline</Link>) and the initiated tasks.</li>
              <li><b>Executed vs. Planned in Interval</b>: List of tasks completed and planned within the interval.</li>
              <li><b>Schedule Summary</b>: Description of the status of the tasks.</li>
              <li><b>Schedule Delay</b>: List of tasks with delayed start or finish, with the responsible team member (registered in <Link href="/pags/responsibilities/raci">RACI Matrix</Link>).</li>
              <li><b>Active Risks</b>: List of active (related to tasks in execution) threats and opportunities.</li>
              <li><b>Budget Summary</b>: Comparison between the planned budget and the actual costs (both registered in <Link href="/pags/resources/acquisition_planning">Resource Acquisition Planning</Link>)</li>
              <li><b>Resources nearing acquisition date</b>: List of resources nearing (within the interval) the expected or critical acquisition dates (registered in <Link href="/pags/resources/acquisition_planning">Resource Acquisition Planning</Link>).</li>
              <li><b>Financial Releases Summary</b>: Incomes and costs (registered in <Link href="/pags/finances/finances/table">Financial Releases Data</Link>).</li>
            </ul>
          </div>
        </div>
        <button className='botao-padrao'onClick={()=> setShowHelp(false)}>Back</button>
      </div>
    </div>
  );
}

export default HelpBubble;