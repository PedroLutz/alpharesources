import Link from "next/link";

const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Lessons Learned</b> is used for registering all lessons learned throughout the project.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                        <ul>
                            <li><b>Date</b>: the date of the lesson.</li>
                            <li><b>Type</b>: can be explicit (easy to document, based on documents and processes) or tacit (hard to document, based on socio-emotional values).</li>
                            <li><b>Situation</b>: the situation that caused the lesson to be learned.</li>
                            <li><b>Lesson learned</b>: a description of the lesson learned.</li>
                            <li><b>Action taken</b>: what the team decided to do based on the lesson learned.</li>
                        </ul>
                    </div>
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;