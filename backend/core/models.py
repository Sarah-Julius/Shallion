from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_CHOICES = [('client', 'Client'), ('volunteer', 'Volunteer')]
    REGISTRANT_CHOICES = [('self', 'Myself'), ('carer', 'Carer/Family Member')]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    profile_photo = models.ImageField(upload_to='photos/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Client specific
    registrant_type = models.CharField(max_length=20, choices=REGISTRANT_CHOICES, blank=True)
    carer_name = models.CharField(max_length=200, blank=True)
    carer_relationship = models.CharField(max_length=100, blank=True)
    gp_certificate = models.FileField(upload_to='certificates/', blank=True, null=True)
    has_paid = models.BooleanField(default=False)

    # Volunteer specific
    pvg_number = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.full_name} ({self.role})"


class Interest(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class UserInterest(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    interest = models.ForeignKey(Interest, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'interest')


class Availability(models.Model):
    DAY_CHOICES = [
        ('monday', 'Monday'), ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'), ('thursday', 'Thursday'),
        ('friday', 'Friday'), ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    TIME_CHOICES = [
        ('morning', 'Morning (8am-12pm)'),
        ('afternoon', 'Afternoon (12pm-5pm)'),
        ('evening', 'Evening (5pm-9pm)'),
    ]

    volunteer = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    day = models.CharField(max_length=20, choices=DAY_CHOICES)
    time_slot = models.CharField(max_length=20, choices=TIME_CHOICES)

    class Meta:
        unique_together = ('volunteer', 'day', 'time_slot')

    def __str__(self):
        return f"{self.volunteer.full_name} - {self.day} {self.time_slot}"


class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('matched', 'Matched'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    SERVICE_CHOICES = [
        ('companionship', 'Companionship & Social Visits'),
        ('daily_tasks', 'Help with Daily Tasks'),
        ('medication', 'Medication Reminders'),
        ('transportation', 'Transportation'),
        ('music', 'Music & Activities'),
        ('walking', 'Outdoor Walks'),
        ('reading', 'Reading & Conversation'),
        ('other', 'Other'),
    ]

    client = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    service_type = models.CharField(max_length=50, choices=SERVICE_CHOICES)
    description = models.TextField()
    date_needed = models.DateField()
    time_needed = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.full_name} - {self.service_type}"


class Application(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')]

    request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE)
    volunteer = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.volunteer.full_name} → {self.request}"


class Message(models.Model):
    sender = models.ForeignKey(UserProfile, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(UserProfile, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.full_name} → {self.receiver.full_name}"


class Booking(models.Model):
    STATUS_CHOICES = [('upcoming', 'Upcoming'), ('completed', 'Completed'), ('cancelled', 'Cancelled')]

    client = models.ForeignKey(UserProfile, related_name='client_bookings', on_delete=models.CASCADE)
    volunteer = models.ForeignKey(UserProfile, related_name='volunteer_bookings', on_delete=models.CASCADE)
    service_type = models.CharField(max_length=50)
    date = models.DateField()
    time = models.TimeField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.full_name} + {self.volunteer.full_name} on {self.date}"


class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    reviewer = models.ForeignKey(UserProfile, related_name='reviews_given', on_delete=models.CASCADE)
    reviewee = models.ForeignKey(UserProfile, related_name='reviews_received', on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reviewer.full_name} → {self.reviewee.full_name}: {self.rating}★"