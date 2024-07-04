import React from 'react';
import { FaArrowUp, FaArrowDown, FaCircle } from 'react-icons/fa';

const getColor = (value, type) => {
    if (type === 'high') {
        return value > 80 ? 'green' : value > 40 ? 'yellow' : 'red';
    }
    if (type === 'low') {
        return value < -12 ? 'red' : value < -7 ? 'yellow' : 'green';
    }
    if (type === 'decimal') {
        return value > 0.80 ? 'green' : value > 0.40 ? 'yellow' : 'red';
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

export const columns = [
    {
        Header: 'Cover',
        accessor: 'album_cover',
        Cell: ({ value }) => value ? <img src={value} alt="Album Cover" style={{ width: '50px' }} /> : 'No Cover',
    },
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
                {value.toFixed(0)}
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
                {(value*100).toFixed(1)}
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
                {(value*100).toFixed(1)}
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
                {value.toFixed(2)}
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
                {(value*100).toFixed(0)}
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
    // {
    //     Header: 'Banger',
    //     accessor: 'banger',
    //     Cell: ({ row }) => {
    //         const { tempo, energy, danceability, loudness, valence } = row.original;
    //         return isBanger(tempo, energy, danceability, loudness, valence) ? 'Yes' : 'No';
    //     },
    //     sortType: (a, b) => {
    //         const aValue = isBanger(a.original.tempo, a.original.energy, a.original.danceability, a.original.loudness, a.original.valence) ? 1 : 0;
    //         const bValue = isBanger(b.original.tempo, b.original.energy, b.original.danceability, b.original.loudness, b.original.valence) ? 1 : 0;
    //         return aValue - bValue;
    //     },
    // },
    {
        Header: 'Genre',
        accessor: 'genre',
        Cell: ({ value }) => value || 'N/A',
    },
];
