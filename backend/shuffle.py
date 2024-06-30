import logging
import time
import random
import spotipy
from utils import is_banger, categorize_songs, interleave_songs

# Function to fetch all tracks in a playlist in batches of 100
def fetch_all_tracks(sp, playlist_id):
    offset = 0
    all_tracks = []
    while True:
        logging.debug(f'Fetching tracks with offset: {offset}')
        response = sp.playlist_tracks(playlist_id, limit=100, offset=offset)
        if not response or 'items' not in response:
            logging.error(f'Unexpected response: {response}')
            break
        all_tracks.extend(response['items'])
        if len(response['items']) < 100:
            break
        offset += 100
        time.sleep(0.2)  # Delay of 0.2 second between requests to respect rate limit
    return all_tracks

# Function to fetch audio features with retry mechanism in batches of 100
def fetch_audio_features_with_retry(sp, track_ids, retries=3, backoff_factor=1):
    all_features = []
    for i in range(0, len(track_ids), 100):
        batch = track_ids[i:i + 100]
        for attempt in range(retries):
            try:
                features = sp.audio_features(batch)
                all_features.extend(features)
                break
            except spotipy.exceptions.SpotifyException as e:
                if e.http_status == 429:
                    retry_after = int(e.headers.get('Retry-After', 1))  # Default to 1 second if not provided
                    logging.warning(f"Rate limited by Spotify API. Retrying after {retry_after} seconds...")
                    time.sleep(retry_after * (2 ** attempt))  # Exponential backoff
                else:
                    raise e
        else:
            raise Exception("Max retries exceeded")
        time.sleep(0.2)  # Delay of 0.2 second between requests to respect rate limit
    return all_features

# Function to create a balanced playlist
def create_balanced_playlist(tracks):
    bangers, slow_songs, happy_songs, neutral_songs = categorize_songs(tracks)
    
    # Shuffle each category to ensure randomness within categories
    random.shuffle(bangers)
    random.shuffle(slow_songs)
    random.shuffle(happy_songs)
    random.shuffle(neutral_songs)
    
    # Interleave songs from different categories
    balanced_playlist = interleave_songs(bangers, slow_songs, happy_songs, neutral_songs)
    
    return balanced_playlist

def create_bell_curve_playlist(tracks):
    # Sort tracks by the combined value of energy and valence
    sorted_tracks = sorted(tracks, key=lambda x: x['energy'] + abs(0.5-x['valence']) + x['danceability'])

    # Calculate the number of tracks for each section
    n = len(sorted_tracks)
    low_count = n // 3
    mid_count = n - 2 * low_count

    # Split tracks into low, mid, and high sections
    low_tracks = sorted_tracks[:low_count]
    mid_tracks = sorted_tracks[low_count:low_count + mid_count]
    high_tracks = sorted_tracks[low_count + mid_count:]

    # Shuffle each section to ensure some randomness within each segment
    random.shuffle(low_tracks)
    random.shuffle(mid_tracks)
    random.shuffle(high_tracks)

    # Create the final playlist by arranging the sections in a bell curve
    playlist = low_tracks[:low_count//2] + mid_tracks[:len(mid_tracks)//2] + high_tracks + mid_tracks[len(mid_tracks)//2:] + low_tracks[low_count//2:]
    
    return playlist