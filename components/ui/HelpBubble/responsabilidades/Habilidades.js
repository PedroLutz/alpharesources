import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Skill evaluation</b> is used for registering all skills and planning development actions.<br /><br />
                    This table should only be used after registering all roles in <Link href="/pags/responsibilities/roles">Roles</Link>.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Role</b>: the role that the skill is needed for.</li>
                        <li><b>Skill</b>: the skill itself.</li>
                        <li><b>Current/Desired Skill Level</b>: scored from 1 to 5, the level of proficiency in the skill.</li>
                        <li><b>Development Action</b>: the actions the person responsible for the role, and by extension, the skill, should take to increase the skill level.</li>
                    </ul>
                    </div>
                    The table also includes, for each role, the related areas and the person responsible.
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;