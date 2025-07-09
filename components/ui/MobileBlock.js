const MobileBlock = () => {
    return (
        <div className="overlay" style={{background: 'rgba(255, 255, 255, 1)'}}>
            <div className="modal centered-container">
                <h2 style={{color: '#ff00e3'}}>Please access this website through your computer or on fullscreen!</h2>
                <p>For a better experience, please navigate the Alpha Management app on a bigger screen. That way, we can guarantee that you're utilizing the website in the best way possible.</p>
                <h3>Sorry for the inconvenience!</h3>
                <img src='/images/logo.png' style={{width: '200px', height: '200px', objectFit: 'cover'}}/>
                
            </div>
        </div>
    );
}

export default MobileBlock;