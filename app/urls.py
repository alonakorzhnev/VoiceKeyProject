from django.urls.conf import path
from . import views

urlpatterns = [
    path('', views.signIn, name='signIn'),
    path('handleSignIn/', views.handleSignIn, name='handleSignIn'),
    path('handleSignUp/', views.handleSignUp, name='handleSignUp'),
    path('signUp.html/', views.signUp, name='signUp'),
    path('signIn.html/', views.signIn, name='signIn')
]