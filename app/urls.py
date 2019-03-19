from django.urls.conf import path
from . import views

urlpatterns = [
    path('', views.signIn, name='signIn'),
    path('handleaudio/', views.handle_audio, name='handleaudio'),
    path('signUp.html/', views.signUp, name='signUp'),
    path('signIn.html/', views.signIn, name='signIn')
]