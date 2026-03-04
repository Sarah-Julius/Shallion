from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import (
    UserProfile, Interest, UserInterest,
    Availability, ServiceRequest, Application,
    Message, Booking, Review
)

admin.site.register(UserProfile)
admin.site.register(Interest)
admin.site.register(UserInterest)
admin.site.register(Availability)
admin.site.register(ServiceRequest)
admin.site.register(Application)
admin.site.register(Message)
admin.site.register(Booking)
admin.site.register(Review)