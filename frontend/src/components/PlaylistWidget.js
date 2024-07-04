import React from 'react';

const PlaylistWidget = ({ playlist, onView, onShuffle }) => {
    return (
        <div className="playlist-item">
            <span className="playlist-name">{playlist.name}</span>
            <button onClick={() => onView(playlist.id)}>View</button>
            <button onClick={() => onShuffle(playlist.id)}>Shuffle</button>
        </div>
    );
};

export default PlaylistWidget;
