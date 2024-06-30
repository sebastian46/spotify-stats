import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { useTable, useSortBy } from 'react-table';
import { FaArrowUp, FaArrowDown, FaCircle } from 'react-icons/fa';

const getColor = (value, type) => {
    if (type === 'high') {
        return value > 75 ? 'green' : value > 25 ? 'yellow' : 'red';
    }
    if (type === 'low') {
        return value < -12 ? 'red' : value < -7 ? 'yellow' : 'green';
    }
    if (type === 'decimal') {
        return value > 0.75 ? 'green' : value > 0.25 ? 'yellow' : 'red';
    }
    return 'gray';
};

const getVibe = (tempo, energy, danceability, loudness, valence) => {
    if (energy > 0.7 && valence > 0.7) {
        return "Happy";
    } else if (energy > 0.7 && valence < 0.3) {
        return "Intense";
    } else if (energy < 0.3 && valence > 0.7) {
        return "Chill";
    } else if (energy < 0.3 && valence < 0.3) {
        return "Melancholic";
    } else if (tempo > 120 && danceability > 0.7) {
        return "Danceable";
    } else if (loudness > -5 && energy > 0.5) {
        return "Energetic";
    } else {
        return "Neutral";
    }
};

const isBanger = (tempo, energy, danceability, loudness, valence) => {
    return (
        tempo > 70 &&
        energy > 0.7 &&
        danceability > 0.7 &&
        loudness > -7 &&
        valence > 0.7
    );
};

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

    const columns = React.useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Artist',
                accessor: 'artist',
            },
            {
                Header: 'Album',
                accessor: 'album',
            },
            {
                Header: 'Duration (min)',
                accessor: 'duration_ms',
                Cell: ({ value }) => (value / 60000).toFixed(2),
                sortType: (a, b) => parseFloat(a.original.duration_ms) - parseFloat(b.original.duration_ms),
            },
            {
                Header: 'Popularity',
                accessor: 'popularity',
                Cell: ({ value }) => (
                    <span>
                        <FaCircle style={{ color: getColor(value, 'high') }} />
                        {value}
                    </span>
                ),
                sortType: (a, b) => parseFloat(a.original.popularity) - parseFloat(b.original.popularity),
            },
            {
                Header: 'Tempo',
                accessor: 'tempo',
                Cell: ({ value }) => (
                    <span>
                        <FaCircle style={{ color: getColor(value, 'high') }} />
                        {value}
                    </span>
                ),
                sortType: (a, b) => parseFloat(a.original.tempo) - parseFloat(b.original.tempo),
            },
            {
                Header: 'Energy',
                accessor: 'energy',
                Cell: ({ value }) => (
                    <span>
                        <FaCircle style={{ color: getColor(value, 'decimal') }} />
                        {value}
                    </span>
                ),
                sortType: (a, b) => parseFloat(a.original.energy) - parseFloat(b.original.energy),
            },
            {
                Header: 'Danceability',
                accessor: 'danceability',
                Cell: ({ value }) => (
                    <span>
                        <FaCircle style={{ color: getColor(value, 'decimal') }} />
                        {value}
                    </span>
                ),
                sortType: (a, b) => parseFloat(a.original.danceability) - parseFloat(b.original.danceability),
            },
            {
                Header: 'Loudness',
                accessor: 'loudness',
                Cell: ({ value }) => (
                    <span>
                        <FaCircle style={{ color: getColor(value, 'low') }} />
                        {value}
                    </span>
                ),
                sortType: (a, b) => parseFloat(a.original.loudness) - parseFloat(b.original.loudness),
            },
            {
                Header: 'Valence',
                accessor: 'valence',
                Cell: ({ value }) => (
                    <span>
                        <FaCircle style={{ color: getColor(value, 'decimal') }} />
                        {value}
                    </span>
                ),
                sortType: (a, b) => parseFloat(a.original.valence) - parseFloat(b.original.valence),
            },
            {
                Header: 'Vibe',
                accessor: 'vibe',
                Cell: ({ row }) => {
                    const { tempo, energy, danceability, loudness, valence } = row.original;
                    return getVibe(tempo, energy, danceability, loudness, valence);
                },
            },
            {
                Header: 'Banger',
                accessor: 'banger',
                Cell: ({ row }) => {
                    const { tempo, energy, danceability, loudness, valence } = row.original;
                    return isBanger(tempo, energy, danceability, loudness, valence) ? 'Yes' : 'No';
                },
                sortType: (a, b) => {
                    const aValue = isBanger(a.original.tempo, a.original.energy, a.original.danceability, a.original.loudness, a.original.valence) ? 1 : 0;
                    const bValue = isBanger(b.original.tempo, b.original.energy, b.original.danceability, b.original.loudness, b.original.valence) ? 1 : 0;
                    return aValue - bValue;
                },
            },
        ],
        []
    );

    const data = React.useMemo(() => selectedPlaylist?.tracks || [], [selectedPlaylist]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data }, useSortBy);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Spotify Playlist Stats</h1>
            </header>
            <div>
                {error && <p>{error}</p>}
                <h2>Playlists</h2>
                <ul>
                    {playlists.map((playlist, index) => (
                        <li key={index}>
                            <button onClick={() => fetchStats(playlist.id)}>{playlist.name}</button>
                            <button onClick={() => shufflePlaylist(playlist.id)}>Shuffle</button>
                        </li>
                    ))}
                </ul>
                {selectedPlaylist && (
                    <div>
                        <h2>{selectedPlaylist.name}</h2>
                        <table {...getTableProps()} className="table">
                            <thead>
                                {headerGroups.map(headerGroup => {
                                    const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                                    return (
                                        <tr key={headerGroupKey} {...headerGroupProps}>
                                            {headerGroup.headers.map(column => {
                                                const { key: columnKey, ...columnProps } = column.getHeaderProps(column.getSortByToggleProps());
                                                return (
                                                    <th key={columnKey} {...columnProps}>
                                                        {column.render('Header')}
                                                        <span>
                                                            {column.isSorted
                                                                ? column.isSortedDesc
                                                                    ? <FaArrowDown />
                                                                    : <FaArrowUp />
                                                                : ''}
                                                        </span>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {rows.map(row => {
                                    prepareRow(row);
                                    const { key: rowKey, ...rowProps } = row.getRowProps();
                                    return (
                                        <tr key={rowKey} {...rowProps}>
                                            {row.cells.map(cell => {
                                                const { key: cellKey, ...cellProps } = cell.getCellProps();
                                                return (
                                                    <td key={cellKey} {...cellProps}>
                                                        {cell.render('Cell')}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
