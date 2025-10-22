import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
  return (
    <div className="overlay">
      <div className="modalHelp">
        <div>
          <h2>Help</h2>
          The <b>WBS Dictionary</b> is an extension of the WBS.<br/><br/>
          Here, you define details regarding each item of your project, including the acceptance criteria.<br/><br/>
          This table should only be used after registering the WBS in <Link href="/pags/wbs/wbs">WBS</Link>.<br /><br />
          The fields are as follows: <br/>
          <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
            <ul>
              <li><b>Area and item</b>: Select the item in question.</li>
              <li><b>Description</b>: Describe the activities related to this item.</li>
              <li><b>Purpose</b>: Describe the purpose this item and its activities serve for the project.</li>
              <li><b>Premises</b>: List the premises associated with this item.</li>
              <li><b>Restrictions</b>: List the restrictions associated with this item.</li>
              <li><b>Expected Resources</b>: List the resources this item and its activities require.</li>
              <li><b>Acceptance Criteria</b>: Describe the requirements the activities in this item should meet to be considered of acceptable quality.</li>
              <li><b>Verification</b>: Describe how should the acceptance criteria be verified.</li>
              <li><b>Timing</b>: Describe when should the acceptance criteria be verified.</li>
              <li><b>Responsible</b>: Choose the individual responsible for achieving the acceptance criteria.</li>
              <li><b>Responsible for Approval</b>: Choose the individual responsible for accepting the activities and approving their quality.</li>
            </ul>
          </div>
        </div>
        <button className='botao-padrao'onClick={()=> setShowHelp(false)}>Back</button>
      </div>
    </div>
  );
}

export default HelpBubble;