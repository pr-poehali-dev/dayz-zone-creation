"""Промокоды и общий чат: CRUD промокодов для админа, чат для авторизованных"""
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
MAX_MSG_LEN = 500


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_session_user(session_id, conn):
    if not session_id:
        return None
    cur = conn.cursor()
    cur.execute(
        f"SELECT u.id, u.username, u.avatar, u.is_admin FROM {SCHEMA}.sessions s "
        f"JOIN {SCHEMA}.users u ON s.user_id = u.id "
        f"WHERE s.id = %s AND s.expires_at > NOW()",
        (session_id,)
    )
    row = cur.fetchone()
    cur.close()
    return {'id': row[0], 'username': row[1], 'avatar': row[2], 'isAdmin': row[3]} if row else None


def row_to_promo(row):
    return {
        'id': row[0], 'code': row[1], 'description': row[2] or '',
        'discountType': row[3], 'discountValue': row[4],
        'maxUses': row[5], 'usesCount': row[6], 'isActive': row[7],
        'expiresAt': row[8].strftime('%d.%m.%Y') if row[8] else None,
        'createdAt': row[9].strftime('%d.%m.%Y') if row[9] else '',
    }


def row_to_msg(row):
    return {
        'id': row[0], 'userId': row[1], 'username': row[2], 'avatar': row[3] or '',
        'text': row[4],
        'createdAt': row[5].strftime('%H:%M') if row[5] else '',
        'fullDate': row[5].strftime('%d.%m.%Y %H:%M') if row[5] else '',
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers_data = event.get('headers', {}) or {}
    session_id = headers_data.get('X-Session-Id', '')

    conn = get_conn()
    try:
        user = get_session_user(session_id, conn)
        cur = conn.cursor()

        # ============ CHAT ============
        if '/chat' in path:
            if method == 'GET':
                cur.execute(
                    f"SELECT id, user_id, username, avatar, text, created_at "
                    f"FROM {SCHEMA}.chat_messages ORDER BY created_at DESC LIMIT 50"
                )
                rows = cur.fetchall()
                rows = list(reversed(rows))
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'messages': [row_to_msg(r) for r in rows]})}

            if method == 'POST':
                if not user:
                    return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Войдите через Discord'})}
                body = json.loads(event.get('body') or '{}')
                text = body.get('text', '').strip()
                if not text:
                    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Пустое сообщение'})}
                if len(text) > MAX_MSG_LEN:
                    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': f'Максимум {MAX_MSG_LEN} символов'})}
                cur.execute(
                    f"INSERT INTO {SCHEMA}.chat_messages (user_id, username, avatar, text) "
                    f"VALUES (%s, %s, %s, %s) RETURNING id, user_id, username, avatar, text, created_at",
                    (user['id'], user['username'], user['avatar'], text)
                )
                row = cur.fetchone()
                conn.commit()
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'message': row_to_msg(row)})}

            if method == 'DELETE':
                if not user or not user['isAdmin']:
                    return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Forbidden'})}
                body = json.loads(event.get('body') or '{}')
                cur.execute(f"DELETE FROM {SCHEMA}.chat_messages WHERE id=%s", (body.get('id'),))
                conn.commit()
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # ============ PROMOCODES ============
        if method == 'GET':
            if 'check' in path:
                params = event.get('queryStringParameters') or {}
                code = params.get('code', '').strip().upper()
                if not code:
                    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажите код'})}
                cur.execute(
                    f"SELECT id, code, description, discount_type, discount_value, max_uses, uses_count, is_active, expires_at, created_at "
                    f"FROM {SCHEMA}.promocodes WHERE UPPER(code) = %s", (code,)
                )
                row = cur.fetchone()
                if not row:
                    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Промокод не найден'})}
                promo = row_to_promo(row)
                if not promo['isActive']:
                    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Промокод неактивен'})}
                if promo['maxUses'] and promo['usesCount'] >= promo['maxUses']:
                    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Промокод исчерпан'})}
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'promo': promo, 'valid': True})}

            if user and user['isAdmin']:
                cur.execute(
                    f"SELECT id, code, description, discount_type, discount_value, max_uses, uses_count, is_active, expires_at, created_at "
                    f"FROM {SCHEMA}.promocodes ORDER BY created_at DESC"
                )
            else:
                cur.execute(
                    f"SELECT id, code, description, discount_type, discount_value, max_uses, uses_count, is_active, expires_at, created_at "
                    f"FROM {SCHEMA}.promocodes WHERE is_active = TRUE ORDER BY created_at DESC"
                )
            rows = cur.fetchall()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'promocodes': [row_to_promo(r) for r in rows]})}

        if method == 'POST':
            if not user or not user['isAdmin']:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Forbidden'})}
            body = json.loads(event.get('body') or '{}')
            code = body.get('code', '').strip().upper()
            if not code:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Укажите код'})}
            promo_id = f"promo-{uuid.uuid4().hex[:8]}"
            cur.execute(
                f"INSERT INTO {SCHEMA}.promocodes (id, code, description, discount_type, discount_value, max_uses, is_active) "
                f"VALUES (%s, %s, %s, %s, %s, %s, TRUE) "
                f"RETURNING id, code, description, discount_type, discount_value, max_uses, uses_count, is_active, expires_at, created_at",
                (promo_id, code, body.get('description', ''),
                 body.get('discountType', 'percent'), int(body.get('discountValue', 10)),
                 body.get('maxUses') or None)
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'promo': row_to_promo(row)})}

        if method == 'PUT':
            if not user or not user['isAdmin']:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Forbidden'})}
            body = json.loads(event.get('body') or '{}')
            cur.execute(
                f"UPDATE {SCHEMA}.promocodes SET code=%s, description=%s, discount_type=%s, discount_value=%s, "
                f"max_uses=%s, is_active=%s WHERE id=%s "
                f"RETURNING id, code, description, discount_type, discount_value, max_uses, uses_count, is_active, expires_at, created_at",
                (body.get('code', '').upper(), body.get('description', ''),
                 body.get('discountType', 'percent'), int(body.get('discountValue', 10)),
                 body.get('maxUses') or None, body.get('isActive', True), body.get('id', ''))
            )
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'promo': row_to_promo(row)})}

        if method == 'DELETE':
            if not user or not user['isAdmin']:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Forbidden'})}
            body = json.loads(event.get('body') or '{}')
            cur.execute(f"DELETE FROM {SCHEMA}.promocodes WHERE id=%s", (body.get('id', ''),))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()
