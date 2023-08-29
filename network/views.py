from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from api.models import Post

from api.models import User


def index(request):
    posts = Post.objects.all().order_by('-upload_date')
    if request.method == 'POST':
        body = request.POST['body']
        user = request.user
        if body != '':
            post = Post(user = user, body =body)
            post.save()
            return render(request, 'network/index.html', {
                'posts':posts
            })

    return render(request, "network/index.html", {
        'posts': posts
    })


def profile(request, username):
    user = User.objects.get(username = username)
    followers = user.followers.count()
    following = user.followings.count()

    current_user = request.user
    try:
        if user in current_user.followings.all():
            followed_by_current_user = True
        else:
            followed_by_current_user = False

        return render(request, 'network/profile.html', {
            'followings' : following,
            'followers' : followers,
            'username' : username,
            'followed_by_current_user' : followed_by_current_user
        })
    except:
        return render(request, 'network/profile.html', {
            'followings' : following,
            'followers' : followers,
            'username' : username
        })

@login_required
def following(request):
    return render(request,'network/following.html')

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
