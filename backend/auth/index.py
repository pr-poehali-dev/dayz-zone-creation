"""Авторизация через Discord OAuth2 и управление сессиями"""
import json
import os
import uuid
import psycopg2
import urllib.request
import urllib.parse


SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p72153263_dayz_zone_creation')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

DISCORD_CLIENT_ID = os.environ.get('1484510235124170842', '')
DISCORD_CLIENT_SECRET = os.environ.get('UqAqivxtpIEiz56IJl2opGXw_kXNzqXJ', '')
DISCORD_REDIRECT_URI = os.environ.get('zonedayz.ru', '')


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_session_user(session_id, conn):
    if not session_id:
        return None
    cur = conn.cursor()
    cur.execute(
        f"SELECT u.id, u.username, u.avatar, u.bio, u.email, u.is_admin, u.discord_id "
        f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON s.user_id = u.id "
        f"WHERE s.id = %s AND s.expires_at > NOW()",
        (session_id,)
    )
    row = cur.fetchone()
    cur.close()
    if not row:
        return None
    return {
        'id': row[0], 'username': row[1], 'avatar': row[2],
        'bio': row[3], 'email': row[4], 'isAdmin': row[5], 'discordId': row[6]
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers', {}) or {}
    session_id = headers.get('X-Session-Id', '')

    # GET /auth/config — публичный endpoint для получения Discord CLIENT_ID
    if method == 'GET' and path.endswith('/config'):
        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({'clientId': DISCORD_CLIENT_ID})
        }

    conn = get_conn()
    try:
        # GET /auth/me — получить текущего пользователя
        if method == 'GET' and path.endswith('/me'):
            user = get_session_user(session_id, conn)
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Unauthorized'})}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'user': user})}

        # POST /auth/discord — обмен кода на токен
        if method == 'POST' and path.endswith('/discord'):
            body = json.loads(event.get('body') or '{}')
            code = body.get('code', '')
            if not code:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'No code'})}

            # Обмен кода на access_token
            data = urllib.parse.urlencode({
                'client_id': DISCORD_CLIENT_ID,
                'client_secret': DISCORD_CLIENT_SECRET,
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': DISCORD_REDIRECT_URI,
            }).encode()
            req = urllib.request.Request('https://discord.com/api/oauth2/token', data=data,
                                          headers={'Content-Type': 'application/x-www-form-urlencoded'})
            with urllib.request.urlopen(req) as resp:
                token_data = json.loads(resp.read())

            access_token = token_data.get('access_token')
            if not access_token:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Token exchange failed'})}

            # Получить данные пользователя Discord
            req2 = urllib.request.Request('https://discord.com/api/users/@me',
                                           headers={'Authorization': f'Bearer {access_token}'})
            with urllib.request.urlopen(req2) as resp2:
                discord_user = json.loads(resp2.read())

            discord_id = discord_user['id']
            username = discord_user.get('global_name') or discord_user.get('username', 'User')
            avatar_hash = discord_user.get('avatar')
            avatar = f"https://cdn.discordapp.com/avatars/{discord_id}/{avatar_hash}.png" if avatar_hash else ''

            # Upsert пользователя
            user_id = f"user-{discord_id}"
            cur = conn.cursor()
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (id, discord_id, username, avatar) "
                f"VALUES (%s, %s, %s, %s) "
                f"ON CONFLICT (discord_id) DO UPDATE SET username=EXCLUDED.username, avatar=EXCLUDED.avatar "
                f"RETURNING id, username, avatar, bio, email, is_admin",
                (user_id, discord_id, username, avatar)
            )
            row = cur.fetchone()
            conn.commit()

            # Создать сессию
            session_id = str(uuid.uuid4())
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (id, user_id) VALUES (%s, %s)",
                (session_id, row[0])
            )
            conn.commit()
            cur.close()

            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({
                    'sessionId': session_id,
                    'user': {
                        'id': row[0], 'username': row[1], 'avatar': row[2],
                        'bio': row[3], 'email': row[4], 'isAdmin': row[5], 'discordId': discord_id
                    }
                })
            }

        # POST /auth/logout — удалить сессию
        if method == 'POST' and path.endswith('/logout'):
            if session_id:
                cur = conn.cursor()
                cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE id = %s", (session_id,))
                conn.commit()
                cur.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # PUT /auth/profile — обновить профиль
        if method == 'PUT' and path.endswith('/profile'):
            user = get_session_user(session_id, conn)
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Unauthorized'})}
            body = json.loads(event.get('body') or '{}')
            cur = conn.cursor()
            cur.execute(
                f"UPDATE {SCHEMA}.users SET username=%s, bio=%s, email=%s WHERE id=%s "
                f"RETURNING id, username, avatar, bio, email, is_admin",
                (body.get('name', user['username']), body.get('bio', user['bio']),
                 body.get('email', user['email']), user['id'])
            )
            row = cur.fetchone()
            conn.commit()
            cur.close()
            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({'user': {
                    'id': row[0], 'username': row[1], 'avatar': row[2],
                    'bio': row[3], 'email': row[4], 'isAdmin': row[5]
                }})
            }

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()