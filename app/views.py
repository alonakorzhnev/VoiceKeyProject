from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http.response import HttpResponse
import scipy.io.wavfile as wav


@ensure_csrf_cookie
def index(request):
    return render(request, 'app/index.html')


def registration(request):
    return render(request, 'app/registration.html')

@csrf_exempt
def handle_audio(request):
    try:
        data = request.body
        with open("file_name", 'wb') as f:
            f.write(data)

        fs, audio = wav.read("file_name")
        wav.write("file_name2", fs, audio)

        msg = "ok"
    except Exception as err:
        msg = "failed"
    return HttpResponse(msg)
