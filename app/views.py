from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http.response import HttpResponse
import scipy.io.wavfile as wav


@ensure_csrf_cookie
def signIn(request):
    return render(request, 'app/signIn.html')


def signUp(request):
    return render(request, 'app/signUp.html')


@csrf_exempt
def handle_audio(request):
    try:
        print("TEST1")
        data = request.POST['text']
        #print(data)
        print("TEST2")

        #with open("file_name", 'wb') as f:
            #f.write(data)

        #fs, audio = wav.read("file_name")
        #wav.write("file_name2", fs, audio)

        msg = "ok"
    except Exception as err:
        msg = "failed"
    return HttpResponse(msg)
