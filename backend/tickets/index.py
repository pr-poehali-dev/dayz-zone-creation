"""Тикеты поддержки: создание пользователями, ответы и управление статусами администратором"""
import json
import os
import uuid
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p72153263_dayz_zone_creation')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
    return {'id': row[0], 'username': row[1], 'isAdmin': row[2]} if row else None


def get_replies(ticket_id, cur):
    cur.execute(
        f"SELECT author, text, is_admin, created_at FROM {SCHEMA}.ticket_replies "
        f"WHERE ticket_id = %s ORDER BY created_at ASC",
        (ticket_id,)
    )
    return [{'author': r[0], 'text': r[1], 'isAdmin': r[2], 'date': r[3].strftime('%d.%m.%Y %H:%M')} for r in cur.fetchall()]


def row_to_ticket(row, replies):
    return {
        'id': row[0], 'userId': row[1], 'clientName': row[2],
        'subject': row[3], 'message': row[4], 'status': row[5],
        'createdAt': row[6].strftime('%d.%m.%Y') if row[6] else '',
        'replies': replies,
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
        user = get_session_user(session_id, conn)

        # GET /tickets — все (для админа) или свои (для клиента)
        if method == 'GET':
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Unauthorized'})}
            if user['isAdmin']:
                cur.execute(
                    f"SELECT id, user_id, client_name, subject, message, status, created_at "
                    f"FROM {SCHEMA}.tickets ORDER BY created_at DESC"
                )
            else:
                cur.execute(
                    f"SELECT id, user_id, client_name, subject, message, status, created_at "
                    f"FROM {SCHEMA}.tickets WHERE user_id = %s ORDER BY created_at DESC",
                    (user['id'],)
                )
            rows = cur.fetchall()
            result = []
            for row in rows:
                replies = get_replies(row[0], cur)
                result.append(row_to_ticket(row, replies))
            cur.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'tickets': result})}

        # POST /tickets — создать тикет
        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            ticket_id = f"TK-{uuid.uuid4().hex[:6].upper()}"
            user_id = user['id'] if user else None
            client_name = user['username'] if user else body.get('clientName', 'Гость')
            cur.execute(
                f"INSERT INTO {SCHEMA}.tickets (id, user_id, client_name, subject, message) "
                f"VALUES (%s, %s, %s, %s, %s) "
                f"RETURNING id, user_id, client_name, subject, message, status, created_at",
                (ticket_id, user_id, client_name, body.get('subject', ''), body.get('message', ''))
            )
            row = cur.fetchone()
            conn.commit()
            cur.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ticket': row_to_ticket(row, [])})}

        # PUT /tickets — добавить ответ или изменить статус
        if method == 'PUT':
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Unauthorized'})}
            body = json.loads(event.get('body') or '{}')
            ticket_id = body.get('id', '')

            if body.get('reply'):
                cur.execute(
                    f"INSERT INTO {SCHEMA}.ticket_replies (ticket_id, author, text, is_admin) VALUES (%s, %s, %s, %s)",
                    (ticket_id, user['username'], body['reply'], user['isAdmin'])
                )
                new_status = 'answered' if user['isAdmin'] else 'open'
                cur.execute(
                    f"UPDATE {SCHEMA}.tickets SET status=%s, updated_at=NOW() WHERE id=%s",
                    (new_status, ticket_id)
                )

            if body.get('status') and user['isAdmin']:
                cur.execute(
                    f"UPDATE {SCHEMA}.tickets SET status=%s, updated_at=NOW() WHERE id=%s",
                    (body['status'], ticket_id)
                )

            conn.commit()

            cur.execute(
                f"SELECT id, user_id, client_name, subject, message, status, created_at "
                f"FROM {SCHEMA}.tickets WHERE id = %s",
                (ticket_id,)
            )
            row = cur.fetchone()
            replies = get_replies(ticket_id, cur)
            cur.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ticket': row_to_ticket(row, replies)})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()
