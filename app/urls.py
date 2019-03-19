from django.urls.conf import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('handleaudio/', views.handle_audio, name='handleaudio'),
    path('registration.html/', views.registration, name='registration'),
    path('index.html/', views.index, name='index')
]