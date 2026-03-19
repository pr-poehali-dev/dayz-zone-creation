"""Управление заказами: создание клиентами, просмотр и управление статусами администратором"""
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


def get_order_reports(order_id, cur):
    cur.execute(
        f"SELECT author, text, created_at FROM {SCHEMA}.order_reports WHERE order_id = %s ORDER BY created_at ASC",
        (order_id,)
    )
    return [{'author': r[0], 'text': r[1], 'date': r[2].strftime('%d.%m.%Y %H:%M')} for r in cur.fetchall()]


def row_to_order(row, reports):
    return {
        'id': row[0], 'clientId': row[1], 'clientName': row[2],
        'category': row[3], 'title': row[4], 'status': row[5],
        'budget': row[6], 'deadline': row[7], 'details': row[8] or {},
        'createdAt': row[9].strftime('%d.%m.%Y') if row[9] else '',
        'reports': reports,
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

        # GET /orders — все заказы (для админа) или свои (для клиента)
        if method == 'GET' and not path.endswith('/admin'):
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Unauthorized'})}
            if user['isAdmin']:
                cur.execute(
                    f"SELECT id, client_id, client_name, category, title, status, budget, deadline, details, created_at "
                    f"FROM {SCHEMA}.orders ORDER BY created_at DESC"
                )
            else:
                cur.execute(
                    f"SELECT id, client_id, client_name, category, title, status, budget, deadline, details, created_at "
                    f"FROM {SCHEMA}.orders WHERE client_id = %s ORDER BY created_at DESC",
                    (user['id'],)
                )
            rows = cur.fetchall()
            result = []
            for row in rows:
                reports = get_order_reports(row[0], cur)
                result.append(row_to_order(row, reports))
            cur.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'orders': result})}

        # POST /orders — создать заказ
        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            order_id = f"ZN-{uuid.uuid4().hex[:6].upper()}"
            client_id = user['id'] if user else None
            client_name = user['username'] if user else body.get('clientName', 'Гость')
            cur.execute(
                f"INSERT INTO {SCHEMA}.orders (id, client_id, client_name, category, title, budget, deadline, details) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s) "
                f"RETURNING id, client_id, client_name, category, title, status, budget, deadline, details, created_at",
                (order_id, client_id, client_name, body.get('category', ''),
                 body.get('title', 'Новый заказ'), body.get('budget', ''),
                 body.get('deadline', ''), json.dumps(body.get('details', {})))
            )
            row = cur.fetchone()
            conn.commit()
            cur.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'order': row_to_order(row, [])})}

        # PUT /orders — обновить статус + добавить отчёт (только админ)
        if method == 'PUT':
            if not user or not user['isAdmin']:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Forbidden'})}
            body = json.loads(event.get('body') or '{}')
            order_id = body.get('id', '')

            if body.get('status'):
                cur.execute(
                    f"UPDATE {SCHEMA}.orders SET status=%s, updated_at=NOW() WHERE id=%s",
                    (body['status'], order_id)
                )

            if body.get('report'):
                cur.execute(
                    f"INSERT INTO {SCHEMA}.order_reports (order_id, author, text) VALUES (%s, %s, %s)",
                    (order_id, 'Admin', body['report'])
                )

            conn.commit()

            cur.execute(
                f"SELECT id, client_id, client_name, category, title, status, budget, deadline, details, created_at "
                f"FROM {SCHEMA}.orders WHERE id = %s",
                (order_id,)
            )
            row = cur.fetchone()
            reports = get_order_reports(order_id, cur)
            cur.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'order': row_to_order(row, reports)})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()
