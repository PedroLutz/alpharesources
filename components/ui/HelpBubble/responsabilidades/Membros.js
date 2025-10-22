const HelpBubble = ({ setShowHelp }) => {
    return (
        <div className="overlay">
            <div className="modalHelp">
                <div>
                    <h2>Help</h2>
                    <b>Team members</b> is used for registering team members.<br /><br />
                    The fields are as follows:
                    <div style={{textAlign: 'justify', marginLeft: '2rem', marginRight: '2rem'}}>
                    <ul>
                        <li><b>Name</b>: the name of the member.</li>
                        <li><b>Softskills</b>: the softskills the member already possesses, relevant or not to his positions.</li>
                        <li><b>Hardskills</b>: the hardskills the member already possesses, relevant or not to his positions.</li>
                    </ul>
                    </div>
                </div>
                <button className='botao-padrao' onClick={() => setShowHelp(false)}>Back</button>
            </div>
        </div>
    );
}

export default HelpBubble;