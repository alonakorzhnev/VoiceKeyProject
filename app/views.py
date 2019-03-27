from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http.response import HttpResponse
import scipy.io.wavfile as wav
import json
from django.conf import settings
import os

@ensure_csrf_cookie
def signIn(request):
    return render(request, 'app/signIn.html')


def signUp(request):
    return render(request, 'app/signUp.html')


@csrf_exempt
def handleSignIn(request):
    if request.method == 'POST':
        try:
            userData = json.loads(request.POST['userName'])
            userName = userData['userName']
            print(userName)

            try:
                os.mkdir(os.path.join(settings.MEDIA_ROOT, 'testVoice'))
            except:
                pass

            path = os.path.join(settings.MEDIA_ROOT, 'testVoice', 'audio')

            with open(path, 'wb') as destination:
                for chunk in request.FILES['audio'].chunks():
                    destination.write(chunk)

            fs, audio = wav.read(path)
            wav.write(path, fs, audio)

            msg = "ok"
        except Exception as err:
            msg = str(err)
        return HttpResponse(msg)


@csrf_exempt
def handleSignUp(request):
    if request.method == 'POST':
        try:
            userData = json.loads(request.POST['userData'])
            userName = userData['userName']
            email = userData['email']

            try:
                os.mkdir(os.path.join(settings.MEDIA_ROOT, userName))
            except Exception as err:
                return HttpResponse(err)

            path = os.path.join(settings.MEDIA_ROOT, userName)
            file = open(os.path.join(path, 'info.txt'), 'w')
            file.write('Name: ' + userName + '\n')
            file.write('Email: ' + email)
            file.close()

            for file in request.FILES:
                try:
                    os.mkdir(os.path.join(settings.MEDIA_ROOT, userName, 'wav'))
                except:
                    pass

                path = os.path.join(settings.MEDIA_ROOT, userName, 'wav', file)

                with open(path, 'wb') as destination:
                    for chunk in request.FILES[file].chunks():
                        destination.write(chunk)

                fs, audio = wav.read(path)
                wav.write(path, fs, audio)

            msg = "ok"
        except Exception as err:
            msg = str(err)
        return HttpResponse(msg)




