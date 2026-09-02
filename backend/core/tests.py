from datetime import date, timedelta
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Application, Booking, ServiceRequest, UserProfile


class ShallionWorkflowTests(APITestCase):
    def register(self, email, role):
        response = self.client.post('/api/auth/register/', {'email': email, 'password': 'SafePassword123!', 'role': role, 'full_name': email.split('@')[0].title(), 'location': 'Aberdeen', 'interests': ['Music', 'Walking']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        token = self.client.post('/api/auth/login/', {'username': email, 'password': 'SafePassword123!'}, format='json')
        self.assertEqual(token.status_code, status.HTTP_200_OK)
        return token.data['access']

    def authenticate(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_registration_creates_complete_profile(self):
        self.authenticate(self.register('client@example.com', 'client'))
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'client')
        self.assertEqual(len(response.data['interests']), 2)

    def test_client_volunteer_booking_and_message_workflow(self):
        client_token = self.register('client@example.com', 'client')
        volunteer_token = self.register('volunteer@example.com', 'volunteer')
        volunteer = UserProfile.objects.get(user__username='volunteer@example.com')
        volunteer.is_verified = True
        volunteer.save(update_fields=['is_verified'])
        self.authenticate(client_token)
        request_response = self.client.post('/api/requests/', {'service_type': 'companionship', 'description': 'A friendly weekly visit.', 'date_needed': str(date.today() + timedelta(days=7)), 'time_needed': '10:00'}, format='json')
        self.assertEqual(request_response.status_code, status.HTTP_201_CREATED)
        self.authenticate(volunteer_token)
        application_response = self.client.post('/api/applications/', {'request': request_response.data['id'], 'message': 'I can help.'}, format='json')
        self.assertEqual(application_response.status_code, status.HTTP_201_CREATED)
        self.authenticate(client_token)
        accept_response = self.client.post(f"/api/applications/{application_response.data['id']}/accept/")
        self.assertEqual(accept_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        self.assertEqual(ServiceRequest.objects.get().status, 'matched')
        self.assertEqual(Application.objects.get().status, 'accepted')
        message_response = self.client.post('/api/messages/', {'receiver': volunteer.id, 'content': 'Thank you.'}, format='json')
        self.assertEqual(message_response.status_code, status.HTTP_201_CREATED)

    def test_volunteer_cannot_create_support_request(self):
        self.authenticate(self.register('volunteer@example.com', 'volunteer'))
        response = self.client.post('/api/requests/', {'service_type': 'walking', 'description': 'Not allowed', 'date_needed': str(date.today() + timedelta(days=1)), 'time_needed': '09:00'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
