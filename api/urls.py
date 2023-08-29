from django.urls import path
from . import views

urlpatterns = [
    path('posts/<int:page_num>', views.get_posts, name='get_posts'),
    path('like/<int:post_id>', views.like_post, name='like_post'),
    path('posts/<str:username>/<int:page_num>', views.get_user_posts, name='get_current_user_posts'),
    path('follow/<str:user>', views.follow_user, name='follow_user'),
    path('following/<int:page_num>', views.get_following_post, name='followings_api'),
    path('edit/', views.edit_post, name = 'edit_api')
]
