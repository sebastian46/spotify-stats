import React from 'react';

const StatsWidget = ({ stats }) => {
    return (
        <div className="widget">
            <h3>Average Stats</h3>
            <ul>
                <li>Tempo: {stats.averageTempo.toFixed(2)}</li>
                <li>Danceability: {stats.averageDanceability.toFixed(2)}</li>
                <li>Energy: {stats.averageEnergy.toFixed(2)}</li>
                <li>Valence: {stats.averageValence.toFixed(2)}</li>
            </ul>
        </div>
    );
};

export default StatsWidget;
