from django.db import models


class Todo(models.Model):
    text = models.TextField()
    completed = models.BooleanField(default=False)
