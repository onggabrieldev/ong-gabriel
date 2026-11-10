from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory
from rest_framework.views import APIView


class _ProbeView(APIView):
    def get(self, request: Request) -> Response:
        return Response({'ok': True})


def test_default_permission_denies_anonymous() -> None:
    request = APIRequestFactory().get('/probe')
    response = _ProbeView.as_view()(request)
    assert response.status_code == 403
