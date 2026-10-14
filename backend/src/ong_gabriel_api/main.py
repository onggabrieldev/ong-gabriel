import uvicorn
from fastapi import FastAPI

app = FastAPI(title='ONG Gabriel')


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


def main() -> None:
    uvicorn.run('ong_gabriel_api.main:app', host='127.0.0.1', port=8000)
