from app.models.user import User


def find_by_email(email):
    return User.objects(email=email).first()


def find_by_id(user_id):
    return User.objects(id=user_id).first()


def save(user):
    user.save()
    return user


def create(email, name, avatar):
    user = User(email=email, name=name, avatar=avatar)
    user.save()
    return user
