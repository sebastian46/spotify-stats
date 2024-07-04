import React from 'react';

const GenresWidget = ({ genres }) => {
    return (
        <div className="widget">
            <h3>Genres</h3>
            <div className="genres-list">
                {genres.map(([genre, count]) => (
                    <span key={genre} className="genre-item">
                        {genre} ({count})
                    </span>
                ))}
            </div>
        </div>
    );
};

export default GenresWidget;
