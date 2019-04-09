from django.urls.conf import path
from . import views

urlpatterns = [
    path('', views.signIn, name='signIn'),
    path('handleSignIn/', views.handleSignIn, name='handleSignIn'),
    path('handleSignUp/', views.handleSignUp, name='handleSignUp'),
    path('handleForgot/', views.handleForgot, name='handleForgot'),
    path('secretPage/', views.secretPage, name='secretPage'),
    path('signUp/', views.signUp, name='signUp'),
    path('signIn/', views.signIn, name='signIn'),
    path('signOut/', views.signOut, name='signOut'),
    path('forgot/', views.forgot, name='forgot')
]