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

# Function to generate the vibe pattern
def generate_playlist_vibes(num_songs):
    if num_songs <= 5:
        return ['Low', 'Mid', 'High', 'Mid', 'Low']
    
    pattern = ['Low']
    mid_high_alternation = True  # To control Mid-High alternation in the middle
    songs_placed = 1
    
    while songs_placed < num_songs - 1:
        # Add Low-Mid-High pattern at the start and end
        if songs_placed < num_songs / 4 or songs_placed > num_songs * 3/4:
            if songs_placed % 2 == 0:
                pattern.append('Low')
            else:
                pattern.append('Mid')
            songs_placed += 1
        # Mid-High alternation in the middle
        else:
            if mid_high_alternation:
                pattern.append('High')
                songs_placed += 1
            else:
                if songs_placed % 3 == 0:
                    pattern.append('Low')
                else:
                    pattern.append('Mid')
                songs_placed += 1
            mid_high_alternation = not mid_high_alternation

    # Ensure the pattern ends with Low
    pattern.append('Low')
    
    return pattern