import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Roles</b> is used for registering all functions inside the team.<br /><br />
                    This table should only be used after registering the WBS in <Link href="/pags/wbs/wbs">WBS</Link> and all team members in <Link href="/pags/responsibilities/raci">Team members</Link>.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Role</b>: the name of the role.</li>
                        <li><b>Description</b>: a small paragraph describing the functions this role executes.</li>
                        <li><b>Required skills</b>: a list of all skills necessary to be responsible for this role.</li>
                        <li><b>Responsible</b>: the team member responsible for this role.</li>
                        <li><b>WBS area</b>: all areas connected to the role.</li>
                    </ul>
                    </div>
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;