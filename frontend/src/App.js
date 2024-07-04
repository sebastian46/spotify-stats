import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import PlaylistTable from './components/PlaylistTable';
import StatsWidget from './components/StatsWidget';
import GenresWidget from './components/GenresWidget';
import PlaylistWidget from './components/PlaylistWidget';

function App() {
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('Fetching playlists');
        axios.get('http://localhost:5000/playlists', { withCredentials: true })
            .then(response => {
                console.log('Playlists received:', response);
                setPlaylists(response.data);
            })
            .catch(error => {
                console.error('Error fetching playlists:', error);
                if (error.response && error.response.status === 302) {
                    window.location.href = 'http://localhost:5000/login';
                } else {
                    setError('Failed to fetch playlists. Please try again later.');
                }
            });
    }, []);

    const fetchStats = (playlistId) => {
        console.log(`Fetching stats for playlist ${playlistId}`);
        axios.get(`http://localhost:5000/stats/${playlistId}`, { withCredentials: true })
            .then(response => {
                console.log('Playlist stats received:', response);
                setSelectedPlaylist(response.data);
            })
            .catch(error => {
                console.error('Error fetching playlist stats:', error);
                setError('Failed to fetch playlist stats. Please try again later.');
            });
    };

    const shufflePlaylist = (playlistId) => {
        console.log(`Shuffling playlist ${playlistId}`);
        axios.get(`http://localhost:5000/playlist/shuffle/${playlistId}`, { withCredentials: true })
            .then(response => {
                console.log('Shuffled playlist received:', response);
                setSelectedPlaylist(response.data);
            })
            .catch(error => {
                console.error('Error shuffling playlist:', error);
                setError('Failed to shuffle playlist. Please try again later.');
            });
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Spotify Playlist Stats</h1>
            </header>
            <div>
                {error && <p>{error}</p>}
                <h2>Playlists</h2>
                <div className="playlist-container">
                    <div className="playlist-widget">
                        {playlists.map((playlist, index) => (
                            <PlaylistWidget
                                key={index}
                                playlist={playlist}
                                onView={fetchStats}
                                onShuffle={shufflePlaylist}
                            />
                        ))}
                    </div>
                </div>
                {/* <h2>Playlists</h2>
                <ul>
                    {playlists.map((playlist, index) => (
                        <li key={index}>
                            <button onClick={() => fetchStats(playlist.id)}>{playlist.name}</button>
                            <button onClick={() => shufflePlaylist(playlist.id)}>Shuffle</button>
                        </li>
                    ))}
                </ul> */}
                {selectedPlaylist && (
                    <div>
                        <h2>{selectedPlaylist.name}</h2>
                        <div className="widgets-container">
                            <StatsWidget stats={selectedPlaylist.stats[0]} />
                            <GenresWidget genres={selectedPlaylist.genres} />
                            <PlaylistTable data={selectedPlaylist.tracks} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
