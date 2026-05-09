import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Status Report Generator</b> is used for quickly generating a summary of the project's performance.<br /><br />
                    Firstly, select the <b>Interval</b>. The interval is the range of the dates of the information gathered for generating the report. For example: if the interval is 1 month, then <b>Tasks Initiated</b> lists all tasks initiated in the last month.<br/><br/>
                    The Project Manager should, ideally, decide on an interval in the beginning of the project and generating reports based on this interval. For example: if the interval decided on is 1 month, then the Project Manager should generate reports every month.<br/><br/>
                    After filling out the fields of the report, click <b>Export</b> to automatically download a PDF file of the report. <b>This will make the page reload automatically</b>, and information written manually by the user will not be retained, 
                    so <b>please check the data BEFORE exporting</b>.<br/><br/>
                    The areas of the report are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Project Information</b>: basic project information.</li>
                            <li><b>Task Analysis</b>: tasks initiated, in execution, and finished within the interval selected; all threats and opportunities related to tasks in execution; and a field to register issues encountered during the interval.</li>
                            <li><b>Work Completed Versus Resources Used</b>: if any tasks were finished within the interval, this area appears. Each task finished has a field to register the planned resources and the resources used in reality.</li>
                            <li><b>KPI Analysis</b>: fields to determine the state of the project Scope, Schedule, Cost, Risk and Quality. <b>The team should define methods for tracking these KPI</b>.</li>
                            <li><b>Area Analysis</b>: comparison between planned schedule and real timeline, with fields for any relevant comments.</li>
                            <li><b>Project Changes</b>: fields for registering changes and lessons learned during the interval.</li>
                        </ul>
                    </div>
                    The team can also optionally add their own logo to the report.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;