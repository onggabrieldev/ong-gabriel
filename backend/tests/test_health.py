from django.test import Client


def test_health(client: Client) -> None:
    response = client.get('/health')

    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_health_accepts_loopback_host(client: Client) -> None:
    response = client.get('/health', HTTP_HOST='127.0.0.1')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}
