import os
import json
import scipy.io.wavfile as wav
from django.conf import settings
from django.shortcuts import render
from utils import trainModel, testVoice
from django.http.response import HttpResponse, HttpResponseRedirect
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt


@ensure_csrf_cookie
def signIn(request):
    return render(request, 'app/signIn.html')


def signUp(request):
    return render(request, 'app/signUp.html')


@ensure_csrf_cookie
def secretPage(request):

    return render(request, 'app/secretPage.html')


@csrf_exempt
def handleSignIn(request):
    if request.method == 'POST':
        try:
            userData = json.loads(request.POST['userName'])
            userName = userData['userName']

            #if not os.path.isdir(os.path.join(settings.MEDIA_ROOT, userName)):
                #return HttpResponse("ERROR: Username or audio data are not correct")

            try:
                os.mkdir(os.path.join(settings.MEDIA_ROOT, 'whoIsIt'))
            except:
                pass

            path = os.path.join(settings.MEDIA_ROOT, 'whoIsIt', 'audio')

            with open(path, 'wb') as destination:
                for chunk in request.FILES['audio'].chunks():
                    destination.write(chunk)

            fs, audio = wav.read(path)
            wav.write(path, fs, audio)

            winner = testVoice.test()

            #if winner == userName:
                #return HttpResponseRedirect('/secretPage/')

            msg = winner
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
            phrase = userData['phrase']

            try:
                os.mkdir(os.path.join(settings.MEDIA_ROOT, userName))
            except Exception as err:
                return HttpResponse(err)

            path = os.path.join(settings.MEDIA_ROOT, userName)
            file = open(os.path.join(path, 'info.txt'), 'w')
            file.write('Name: ' + userName + '\n')
            file.write('Email: ' + email + '\n')
            file.write('Secret Phrase: ' + phrase)
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

            trainModel.train(userName)

            msg = "ok"
        except Exception as err:
            msg = str(err)
        return HttpResponse(msg)




