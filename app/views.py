from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http.response import HttpResponse
import scipy.io.wavfile as wav
import json
import os
import shutil

@ensure_csrf_cookie
def signIn(request):
    return render(request, 'app/signIn.html')


def signUp(request):
    return render(request, 'app/signUp.html')


@csrf_exempt
def handle_audio(request):
    if request.method == 'POST1':
        try:
            data = request.body

            with open("file_name1", 'wb') as f:
                f.write(data)

            fs, audio = wav.read("file_name1")
            wav.write("file_name2", fs, audio)

            msg = "ok"
        except Exception as err:
            msg = "failed"
        return HttpResponse(msg)

    elif request.method == 'POST2':
        try:
            data = request.body

            with open("file_name3", 'wb') as f:
                f.write(data)

            fs, audio = wav.read("file_name3")
            wav.write("file_name4", fs, audio)

            msg = "ok"
        except Exception as err:
            msg = "failed"
        return HttpResponse(msg)

    elif request.method == 'POST3':
        try:
            data = request.body

            with open("file_name5", 'wb') as f:
                f.write(data)

            fs, audio = wav.read("file_name5")
            wav.write("file_name6", fs, audio)

            msg = "ok"
        except Exception as err:
            msg = "failed"
        return HttpResponse(msg)

    elif request.method == 'POST':
        try:
            data = request.body

            with open("file_name", 'wb') as f:
                f.write(data)

            fs, audio = wav.read("file_name")
            wav.write("file_nameo", fs, audio)

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
            path1 = os.getcwd()
            path2 = "\\"+"app\static"+"\\"+"app"+"\\"
            path3 = data['userName']
            path = path1 + path2 + path3
            print(path)
            # Create target Directory if don't exist
            if not os.path.exists(path):
                os.mkdir(path)
                print("Directory ", data['userName'], " Created ")
                file = open(path+"\\"+"info.txt", "w")
                file.write("Name: "+data['userName']+'\n')
                file.write("Email: "+data['email'])
                file.close()
                shutil.move("file_name1", path+"\\"+"file_name1")
                shutil.move("file_name2", path + "\\" + "file_name2")
                shutil.move("file_name3", path + "\\" + "file_name3")
                shutil.move("file_name4", path + "\\" + "file_name4")
                shutil.move("file_name5", path + "\\" + "file_name5")
                shutil.move("file_name6", path + "\\" + "file_name6")
            else:
                print("Directory ", data['userName'], " already exists")
            msg = "ok"

        except Exception as err:
            msg = "failed"
        return HttpResponse(msg)
