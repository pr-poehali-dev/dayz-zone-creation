"""Управление новостями: получение, создание, редактирование (только для админа)"""
import json
import os
import uuid
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p72153263_dayz_zone_creation')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_session_user(session_id, conn):
    if not session_id:
        return None
    cur = conn.cursor()
    cur.execute(
        f"SELECT u.id, u.username, u.is_admin FROM {SCHEMA}.sessions s "
        f"JOIN {SCHEMA}.users u ON s.user_id = u.id "
        f"WHERE s.id = %s AND s.expires_at > NOW()",
        (session_id,)
    )
    row = cur.fetchone()
    cur.close()
    if not row:
        return None
    return {'id': row[0], 'username': row[1], 'isAdmin': row[2]}


def row_to_news(row):
    return {
        'id': row[0], 'title': row[1], 'content': row[2],
        'tag': row[3], 'color': row[4], 'authorName': row[5],
        'createdAt': row[6].strftime('%d.%m.%Y') if row[6] else '',
        'updatedAt': row[7].strftime('%d.%m.%Y') if row[7] else '',
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers', {}) or {}
    session_id = headers.get('X-Session-Id', '')

    conn = get_conn()
    try:
        cur = conn.cursor()

        # GET — список новостей
        if method == 'GET':
            cur.execute(
                f"SELECT id, title, content, tag, color, author_name, created_at, updated_at "
                f"FROM {SCHEMA}.news ORDER BY created_at DESC LIMIT 20"
            )
            rows = cur.fetchall()
            cur.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'news': [row_to_news(r) for r in rows]})}

        # POST — создать новость (только админ)
        if method == 'POST':
            user = get_session_user(session_id, conn)
            if not user or not user['isAdmin']:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Forbidden'})}
            body = json.loads(event.get('body') or '{}')
            news_id = f"news-{uuid.uuid4().hex[:8]}"
            cur.execute(
                f"INSERT INTO {SCHEMA}.news (id, title, content, tag, color, author_name) "
                f"VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, title, content, tag, color, author_name, created_at, updated_at",
                (news_id, body.get('title', ''), body.get('content', ''),
                 body.get('tag', 'Новость'), body.get('color', '#00ff88'), user['username'])
            )
            row = cur.fetchone()
            conn.commit()
            cur.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'news': row_to_news(row)})}

        # PUT — обновить новость (только админ)
        if method == 'PUT':
            user = get_session_user(session_id, conn)
            if not user or not user['isAdmin']:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Forbidden'})}
            body = json.loads(event.get('body') or '{}')
            news_id = body.get('id', '')
            cur.execute(
                f"UPDATE {SCHEMA}.news SET title=%s, content=%s, tag=%s, color=%s, updated_at=NOW() "
                f"WHERE id=%s RETURNING id, title, content, tag, color, author_name, created_at, updated_at",
                (body.get('title'), body.get('content'), body.get('tag'), body.get('color'), news_id)
            )
            row = cur.fetchone()
            conn.commit()
            cur.close()
            if not row:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'news': row_to_news(row)})}

        # DELETE — удалить новость (только админ)
        if method == 'DELETE':
            user = get_session_user(session_id, conn)
            if not user or not user['isAdmin']:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Forbidden'})}
            body = json.loads(event.get('body') or '{}')
            news_id = body.get('id', '')
            cur.execute(f"DELETE FROM {SCHEMA}.news WHERE id=%s", (news_id,))
            conn.commit()
            cur.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()