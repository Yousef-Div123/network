from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    liked_posts = models.ManyToManyField('Post', related_name='posts_liked_by_user')
    followers = models.ManyToManyField('User', related_name='user_followers')
    followings = models.ManyToManyField('User', related_name='user_following')



class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    upload_date = models.DateTimeField(auto_now_add=True)
    likes = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f'{self.user}: {self.body}'