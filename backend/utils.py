import random

# Function to determine if a song is a banger
def is_banger(tempo, energy, danceability, loudness, valence):
    return (tempo > 100 and energy > 0.7 and danceability > 0.7 and loudness > -5 and valence > 0.7)

# Function to categorize songs based on their characteristics
def categorize_songs(tracks):
    bangers = []
    slow_songs = []
    happy_songs = []
    neutral_songs = []

    for track in tracks:
        tempo = track['tempo']
        energy = track['energy']
        danceability = track['danceability']
        loudness = track['loudness']
        valence = track['valence']
        
        if is_banger(tempo, energy, danceability, loudness, valence):
            bangers.append(track)
        elif energy < 0.3 and valence < 0.3:
            slow_songs.append(track)
        elif valence > 0.7:
            happy_songs.append(track)
        else:
            neutral_songs.append(track)
    
    return bangers, slow_songs, happy_songs, neutral_songs

# Function to interleave songs from different categories
def interleave_songs(*categories):
    interleaved = []
    while any(categories):
        for category in categories:
            if category:
                interleaved.append(category.pop(0))
    return interleaved
