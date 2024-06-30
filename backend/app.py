import os
from flask import Flask, redirect, session, url_for, jsonify, request
from spotipy.oauth2 import SpotifyOAuth, SpotifyOauthError
import spotipy
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv
import logging
import time

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Properly configure CORS to allow credentials and specify allowed origins
CORS(app, supports_credentials=True, resources={r"/*": {"origins": os.getenv('FRONTEND_URL')}})

SPOTIPY_CLIENT_ID = os.getenv('SPOTIPY_CLIENT_ID')
SPOTIPY_CLIENT_SECRET = os.getenv('SPOTIPY_CLIENT_SECRET')
SPOTIPY_REDIRECT_URI = os.getenv('SPOTIPY_REDIRECT_URI')

logging.basicConfig(level=logging.DEBUG)

sp_oauth = SpotifyOAuth(client_id=SPOTIPY_CLIENT_ID,
                        client_secret=SPOTIPY_CLIENT_SECRET,
                        redirect_uri=SPOTIPY_REDIRECT_URI,
                        scope="user-library-read playlist-read-private")

@app.route('/login')
def login():
    logging.debug('Login route accessed')
    auth_url = sp_oauth.get_authorize_url()
    logging.debug(auth_url)
    return redirect(auth_url)

@app.route('/callback')
def callback():
    logging.debug('Callback route accessed')
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session['token_info'] = token_info
    logging.debug(f'Token info: {token_info}')
    return redirect(os.getenv('FRONTEND_URL'))

@app.route('/playlists')
def get_playlists():
    logging.debug('Playlists route accessed')
    token_info = session.get('token_info', None)
    if not token_info:
        logging.debug('No token info found, redirecting to login')
        return redirect(url_for('login'))

    try:
        # Check if the token is expired and refresh it if necessary
        if sp_oauth.is_token_expired(token_info):
            logging.debug('Token expired, refreshing token')
            token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
            session['token_info'] = token_info

        sp = spotipy.Spotify(auth=token_info['access_token'])
        playlists = sp.current_user_playlists()

        playlist_data = [{'id': playlist['id'], 'name': playlist['name']} for playlist in playlists['items']]
        return jsonify(playlist_data)
    except SpotifyOauthError as e:
        logging.error(f"Spotify OAuth error: {e}")
        return redirect(url_for('login'))

@app.route('/stats/<playlist_id>')
def stats(playlist_id):
    logging.debug('Stats route accessed')
    token_info = session.get('token_info', None)
    if not token_info:
        logging.debug('No token info found, redirecting to login')
        return redirect(url_for('login'))

    try:
        # Check if the token is expired and refresh it if necessary
        if sp_oauth.is_token_expired(token_info):
            logging.debug('Token expired, refreshing token')
            token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
            session['token_info'] = token_info

        sp = spotipy.Spotify(auth=token_info['access_token'])
        
        # Fetch only the first 5 tracks
        tracks = sp.playlist_tracks(playlist_id)
        track_ids = [track['track']['id'] for track in tracks['items']]
        
        # Function to fetch audio features with retry mechanism
        def fetch_audio_features_with_retry(track_ids, retries=3, backoff_factor=1):
            for attempt in range(retries):
                try:
                    return sp.audio_features(track_ids)
                except spotipy.exceptions.SpotifyException as e:
                    if e.http_status == 429:
                        retry_after = int(e.headers.get('Retry-After', 1))  # Default to 1 second if not provided
                        logging.warning(f"Rate limited by Spotify API. Retrying after {retry_after} seconds...")
                        time.sleep(retry_after * (2 ** attempt))  # Exponential backoff
                    else:
                        raise e
            raise Exception("Max retries exceeded")

        features = fetch_audio_features_with_retry(track_ids)
        
        playlist_data = {
            'name': sp.playlist(playlist_id)['name'],
            'tracks': []
        }
        for track, feature in zip(tracks['items'], features):
            track_info = track['track']
            playlist_data['tracks'].append({
                'name': track_info['name'],
                'artist': track_info['artists'][0]['name'],
                'album': track_info['album']['name'],
                'duration_ms': track_info['duration_ms'],
                'popularity': track_info['popularity'],
                'tempo': feature['tempo'],
                'energy': feature['energy'],
                'danceability': feature['danceability'],
                'loudness': feature['loudness'],
                'valence': feature['valence'],
                # 'speechiness': feature['speechiness'],
            })

        return jsonify(playlist_data)
    except SpotifyOauthError as e:
        logging.error(f"Spotify OAuth error: {e}")
        return redirect(url_for('login'))

if __name__ == '__main__':
    logging.debug(f"Client ID: {SPOTIPY_CLIENT_ID}")
    logging.debug(f"Client Secret: {SPOTIPY_CLIENT_SECRET}")
    app.run(debug=True)
