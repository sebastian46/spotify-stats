import os
import time
import logging
import random
from flask import Flask, redirect, session, url_for, jsonify, request
from spotipy.oauth2 import SpotifyOAuth, SpotifyOauthError
import spotipy
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv
from shuffle import create_balanced_playlist, fetch_audio_features_with_retry, fetch_all_tracks, create_bell_curve_playlist
from utils import is_banger, categorize_songs, interleave_songs

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

FRONTEND_URL = os.getenv('FRONTEND_URL')

# Properly configure CORS to allow credentials and specify allowed origins
CORS(app, supports_credentials=True, origins=[FRONTEND_URL])

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
    return redirect(auth_url)

@app.route('/callback')
def callback():
    logging.debug('Callback route accessed')
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session['token_info'] = token_info
    logging.debug(f'Token info: {token_info}')
    return redirect(FRONTEND_URL)

@app.route('/playlists')
def get_playlists():
    logging.debug('Playlists route accessed')
    token_info = session.get('token_info', None)
    if not token_info:
        logging.debug('No token info found, redirecting to login')
        return redirect(url_for('login'))

    try:
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
        if sp_oauth.is_token_expired(token_info):
            logging.debug('Token expired, refreshing token')
            token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
            session['token_info'] = token_info

        sp = spotipy.Spotify(auth=token_info['access_token'])
        tracks = fetch_all_tracks(sp, playlist_id)
        if not tracks:
            logging.error(f'No tracks fetched for playlist_id: {playlist_id}')
            return "No tracks found", 404

        logging.debug(f'Total tracks fetched: {len(tracks)}')
        track_ids = [track['track']['id'] for track in tracks if track['track']]
        features = fetch_audio_features_with_retry(sp, track_ids)

        tracks_with_features = []
        for track, feature in zip(tracks, features):
            track_info = track['track']
            tracks_with_features.append({
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
            })

        playlist_data = {
            'name': sp.playlist(playlist_id)['name'],
            'tracks': tracks_with_features
        }

        return jsonify(playlist_data)
    except SpotifyOauthError as e:
        logging.error(f"Spotify OAuth error: {e}")
        return redirect(url_for('login'))

@app.route('/playlist/shuffle/<playlist_id>')
def shuffle_playlist(playlist_id):
    logging.debug('Shuffle playlist route accessed')
    token_info = session.get('token_info', None)
    if not token_info:
        logging.debug('No token info found, redirecting to login')
        return redirect(url_for('login'))

    try:
        if sp_oauth.is_token_expired(token_info):
            logging.debug('Token expired, refreshing token')
            token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
            session['token_info'] = token_info

        sp = spotipy.Spotify(auth=token_info['access_token'])
        tracks = fetch_all_tracks(sp, playlist_id)
        if not tracks:
            logging.error(f'No tracks fetched for playlist_id: {playlist_id}')
            return "No tracks found", 404

        logging.debug(f'Total tracks fetched: {len(tracks)}')
        track_ids = [track['track']['id'] for track in tracks if track['track']]
        features = fetch_audio_features_with_retry(sp, track_ids)

        tracks_with_features = []
        for track, feature in zip(tracks, features):
            track_info = track['track']
            tracks_with_features.append({
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
            })

        # new_playlst = create_balanced_playlist(tracks_with_features)
        new_playlst = create_bell_curve_playlist(tracks_with_features)
        playlist_data = {
            'name': sp.playlist(playlist_id)['name'],
            'tracks': new_playlst
        }

        return jsonify(playlist_data)
    except SpotifyOauthError as e:
        logging.error(f"Spotify OAuth error: {e}")
        return redirect(url_for('login'))

if __name__ == '__main__':
    logging.debug(f"Client ID: {SPOTIPY_CLIENT_ID}")
    logging.debug(f"Client Secret: {SPOTIPY_CLIENT_SECRET}")
    app.run(debug=True)
