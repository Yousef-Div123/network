from django.shortcuts import render
from time import asctime
from .models import User, Post
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.decorators import login_required
from .serializer import PostSerializer
from django.core.paginator import Paginator
# Create your views here.

NUM_OF_POSTS = 10

@api_view(['GET'])
def get_posts(request, page_num):
    posts = Post.objects.all().order_by('-upload_date')
    p = Paginator(posts, NUM_OF_POSTS)
    if page_num > p.num_pages:
        return Response('Out of pages')
    serilaizer = PostSerializer(p.page(page_num), many = True)
    data = serilaizer.data

    # changing the user field from user id to username
    for post in data:
        current_post = Post.objects.get(id = post['id'])
        time = current_post.upload_date.ctime()[:-8]
        user = request.user


        if User.objects.filter(id = user.id ,liked_posts = current_post).count() == 1:
            post['liked_by_current_user'] = True
        else:
            post['liked_by_current_user'] = False


        post['user'] = current_post.user.username

        if post['user'] == user.username:
            post['posted_by_current_user'] = True
        else:
            post['posted_by_current_user'] = False

        post['upload_date'] = time
        post['Number_of_pages'] = p.num_pages

    return Response(serilaizer.data)


@api_view(['GET'])
def get_user_posts(request, username, page_num):
    user = User.objects.get(username = username)
    posts = Post.objects.filter(user = user).order_by('-upload_date')
    p = Paginator(posts, NUM_OF_POSTS)
    if page_num > p.num_pages:
        return Response('Out of pages')
    serilaizer = PostSerializer(p.page(page_num), many = True)
    data = serilaizer.data

    # changing the user field from user id to username
    for post in data:
        current_post = Post.objects.get(id = post['id'])
        time = current_post.upload_date.ctime()[:-8]
        user = request.user


        if User.objects.filter(id = user.id ,liked_posts = current_post).count() == 1:
            post['liked_by_current_user'] = True
        else:
            post['liked_by_current_user'] = False


        post['user'] = current_post.user.username
        post['upload_date'] = time
        post['Number_of_pages'] = p.num_pages

        if post['user'] == user.username:
            post['posted_by_current_user'] = True
            
        else:
            post['posted_by_current_user'] = False

    return Response(serilaizer.data)

@api_view(['GET'])
def get_following_post(request, page_num):
    current_user = request.user
    current_user_followings = current_user.followings.all()
    posts = Post.objects.filter( user__in = current_user_followings).order_by('-upload_date')
    p = Paginator(posts, NUM_OF_POSTS)
    if page_num > p.num_pages:
        return Response('Out of pages')
    serilaizer = PostSerializer(p.page(page_num), many = True)
    data = serilaizer.data

    # changing the user field from user id to username
    for post in data:
        current_post = Post.objects.get(id = post['id'])
        time = current_post.upload_date.ctime()[:-8]
        user = request.user


        if User.objects.filter(id = user.id ,liked_posts = current_post).count() == 1:
            post['liked_by_current_user'] = True
        else:
            post['liked_by_current_user'] = False

        post['user'] = current_post.user.username
        post['upload_date'] = time
        post['Number_of_pages'] = p.num_pages

        if post['user'] == user.username:
            post['posted_by_current_user'] = True
            
        else:
            post['posted_by_current_user'] = False

    return Response(serilaizer.data)


@api_view(['POST'])
def like_post(request, post_id):
    try:
        post = Post.objects.get(id = post_id)
        user = request.user

        if User.objects.filter(id = user.id ,liked_posts = post).count() == 1:
            user.liked_posts.remove(post)
            post.likes -= 1

            message = 'Post unliked'
        else:
            post.likes += 1
            user.liked_posts.add(post)

            message = 'Post liked'

        user.save()
        post.save()

        return Response(message)
    except:
        return Response('Not allowed')
    
@api_view(['POST'])
def follow_user(request, user):
    user_followed = User.objects.get(username = user)
    current_user = request.user
    
    if user_followed in current_user.followings.all():
        current_user.followings.remove(user_followed)
        user_followed.followers.remove(current_user)

        return Response("Unfollowed")
    else:
        current_user.followings.add(user_followed)
        user_followed.followers.add(current_user)
        return Response("Followed")

    current_user.save()
    user_followed.save()

@api_view(['POST'])
def edit_post(request):
    post = Post.objects.get(id = request.data['post_id'])
    if request.user == post.user:
        new_body = request.data['body']

        post.body = new_body

        post.save()

        return Response(new_body)
    else:
        return Response('You are not allowed to edit this post.')