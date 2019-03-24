from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http.response import HttpResponse
import scipy.io.wavfile as wav
import json


@ensure_csrf_cookie
def signIn(request):
    return render(request, 'app/signIn.html')


def signUp(request):
    return render(request, 'app/signUp.html')


@csrf_exempt
def handle_audio(request):
    if request.method == 'POST':
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


@csrf_exempt
def handle_userName(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(data['userName'])

            msg = "ok"
        except Exception as err:
            msg = "failed"
        return HttpResponse(msg)


@csrf_exempt
def handle_userNameEmail(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(data['userName'])
            print(data['email'])

            msg = "ok"
        except Exception as err:
            msg = "failed"
        return HttpResponse(msg)
