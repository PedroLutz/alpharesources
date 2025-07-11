const Loading = () => {
    return (
        <div className="overlay">
            <div className="modal centered-container">
                <img src='/images/alphie.png' style={{width: '300px', height: '200px', objectFit: 'cover'}}/>
                <p>Wait a little while we set things up...</p>
            </div>
        </div>
    );
}

export default Loading;