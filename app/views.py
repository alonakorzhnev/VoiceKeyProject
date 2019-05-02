import os
import json
import scipy.io.wavfile as wav
from django.conf import settings
from django.shortcuts import render
from speakerRecognition import gmm
from django.http.response import HttpResponse, HttpResponseNotFound
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.shortcuts import redirect
import smtplib

flagUser = False
secretName = ''

@ensure_csrf_cookie
def signIn(request):
    return render(request, 'app/signIn.html', {'nbar': 'signIn'})


@ensure_csrf_cookie
def signUp(request):
    return render(request, 'app/signUp.html', {'nbar': 'signUp'})


@ensure_csrf_cookie
def forgot(request):
    return render(request, 'app/forgot.html')


@ensure_csrf_cookie
def signOut(request):
    global flagUser
    global secretName
    flagUser = False
    secretName = ''
    return redirect('/signIn/')


@ensure_csrf_cookie
def secretPage(request):
    global flagUser
    global secretName
    if flagUser and len(secretName):
        return render(request, 'app/secretPage.html', {'userName': secretName, 'nbar': 'secret'})
    return redirect('/signIn/')


@csrf_exempt
def handleSignIn(request):
    global flagUser
    global secretName
    if request.method == 'POST':
        try:
            userData = json.loads(request.POST['userName'])
            userName = userData['userName']

            #if not os.path.isdir(os.path.join(settings.MEDIA_ROOT, userName)):
                #return HttpResponse("ERROR: Username or audio data are not correct")

            try:
                os.mkdir(os.path.join(settings.DATA_ROOT, 'whoIsIt'))
            except:
                pass

            path = os.path.join(settings.DATA_ROOT, 'whoIsIt', 'audio.wav')

            with open(path, 'wb') as destination:
                for chunk in request.FILES['audio'].chunks():
                    destination.write(chunk)

            fs, audio = wav.read(path)
            wav.write(path, fs, audio)

            """r = sr.Recognizer()
            testAudio = sr.AudioFile(path)
            with testAudio as source:
                audio = r.record(source)

            phrase = r.recognize_google(audio)"""

            winner = gmm.test()
            if winner == userName:
                flagUser = True
                secretName = userName
                msg = "Successful SignIn"
            else:
                flagUser = False
                msg = "SignIn failed. User name or voice password is incorrect. Please try again!"
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
                os.mkdir(os.path.join(settings.DATA_ROOT, 'usersData', userName))
            except Exception as err:
                return HttpResponse("UserName is already exist")

            path = os.path.join(settings.DATA_ROOT, 'usersData', userName)
            file = open(os.path.join(path, 'info.txt'), 'w')
            file.write('Name: ' + userName + '\n')
            file.write('Email: ' + email + '\n')
            file.write('Secret Phrase: ' + phrase)
            file.close()

            for file in request.FILES:
                try:
                    os.mkdir(os.path.join(settings.DATA_ROOT, 'usersData', userName, 'wav'))
                except:
                    pass

                path = os.path.join(settings.DATA_ROOT, 'usersData', userName, 'wav', file + ".wav")

                with open(path, 'wb') as destination:
                    for chunk in request.FILES[file].chunks():
                        destination.write(chunk)

                fs, audio = wav.read(path)
                wav.write(path, fs, audio)

            gmm.train(userName)
            msg = "Successful SignUp"
        except Exception as err:
            msg = str(err)
        return HttpResponse(msg)


@csrf_exempt
def handleForgot(request):
    if request.method == 'POST':
        try:
            userData = json.loads(request.POST['userData'])
            userName = userData['userName']
            email = userData['email']
            path = os.path.join(settings.DATA_ROOT, 'usersData', userName)
            file = open(os.path.join(path, 'info.txt'), 'r')
            text = file.read()
            fileLines = text.splitlines()

            userCheck = fileLines.__getitem__(0)
            userCheck = userCheck.split(' ').__getitem__(1)
            emailCheck = fileLines.__getitem__(1)
            emailCheck = emailCheck.split(' ').__getitem__(1)
            if userName != userCheck or email != emailCheck:
                raise Exception("ERROR: There is a problem with User Name or Email!")
            phraseParts = fileLines.__getitem__(2).split(' ')

            phrase = phraseParts.__getitem__(2)
            for i in range(3,phraseParts.__len__()):
                phrase += " "+phraseParts.__getitem__(i)
            file.close()

            systemUser = 'systemvoice2@gmail.com'
            systemPassword = '*OrAlona123'

            sent_from = systemUser
            to = email
            subject = 'Phrase Restoring'
            body = 'Dear ' + userName + ',\nThe system noticed that you requested to restore your secret phrase.\nYour secret phrase is:\n'+phrase+'\n\nYours,\nVoice System Security'

            mailText = """From: %s\nTo: %s\nSubject: %s\n%s""" % (sent_from, to, subject, body)

            server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
            server.ehlo()
            server.login(systemUser, systemPassword)
            server.sendmail(sent_from, to, mailText)
            server.close()

            msg = "Secret phrase is successfully sent to your email"
        except Exception as err:
            msg = str(err)
        return HttpResponse(msg)





