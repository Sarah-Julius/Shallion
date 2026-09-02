# Shallion

A community-support platform designed to connect people living with dementia and their carers with suitable local volunteers.

> **Project status:** Portfolio-ready full-stack release. The core client-to-volunteer journey, payments integration, automated tests and production deployment configuration are implemented.

## Overview

Shallion explores how a secure digital service can make community support easier to access and coordinate. Clients or carers can create an account, identify the support they need, record interests, and provide verification information. The planned matching workflow connects them with volunteers based on availability, interests, and requested services.

## Key features

- Complete client and volunteer role-based registration
- JWT-based registration, login, and protected routes
- Role-based client and volunteer data model
- Support requests, volunteer applications, bookings, messages, and reviews
- Interest and availability records to support future matching
- GP certificate and profile document fields
- Stripe PaymentIntent integration scaffold
- Verified-volunteer matching based on shared interests
- Volunteer applications with client acceptance and automatic booking creation
- Booking status management and matched-user messaging
- Reviews for completed bookings
- Stripe PaymentIntents, signed webhooks and payment history
- Responsive React interface styled with Tailwind CSS
- Django administration interface for managing platform records

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Axios, Tailwind CSS |
| Backend | Python, Django, Django REST Framework |
| Authentication | Simple JWT |
| Data | SQLite locally, PostgreSQL in production, Django ORM |
| Payments | Stripe |
| Tooling | ESLint, npm, Git, GitHub |

## Repository structure

```text
Shallion/
├── backend/
│   ├── core/          # Domain models, API views, admin and migrations
│   ├── myapp/         # Django project configuration and URL routing
│   └── manage.py
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/       # Axios configuration
│       ├── context/   # Authentication state
│       └── pages/     # Application screens
├── .env.example
├── .gitignore
├── README.md
└── requirements.txt
```

## Local setup

### Prerequisites

- Python 3.11 or later
- Node.js 20 or later
- npm

### 1. Clone the repository

```bash
git clone https://github.com/Sarah-Julius/Shallion.git
cd Shallion
```

### 2. Configure and start the backend

```bash
python -m venv backend/venv
source backend/venv/bin/activate
pip install -r requirements.txt
cp .env.example backend/.env
cd backend
python manage.py migrate
python manage.py runserver
```

On Windows PowerShell, activate the environment with:

```powershell
backend\venv\Scripts\Activate.ps1
```

The API will be available at `http://127.0.0.1:8000/`.

### 3. Configure and start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173/`.

## Main API routes

| Route | Purpose |
|---|---|
| `POST /api/auth/register/` | Create an account |
| `POST /api/auth/login/` | Obtain JWT access and refresh tokens |
| `POST /api/auth/refresh/` | Refresh an access token |
| `GET /api/auth/me/` | Return the authenticated user |
| `GET/POST /api/requests/` | Manage support requests |
| `GET/POST /api/applications/` | Manage volunteer applications |
| `POST /api/applications/:id/accept/` | Accept a volunteer and create a booking |
| `GET/PATCH /api/bookings/` | View and update bookings |
| `GET/POST /api/messages/` | Message matched users |
| `GET/POST /api/reviews/` | Review completed bookings |
| `GET /api/matches/` | View ranked verified volunteers |
| `POST /api/payments/create-intent/` | Create a server-priced Stripe PaymentIntent |
| `POST /api/payments/webhook/` | Process signed Stripe payment events |

## Quality checks

```bash
cd backend
python manage.py check
python manage.py test

cd ../frontend
npm run lint
npm run build
```

## Production deployment

The repository includes a Render Blueprint in `render.yaml`. It provisions a PostgreSQL database, Django API service and React static service. Before launching, configure the Stripe secret key, webhook secret and frontend public key in Render, then register the deployed webhook URL in Stripe.

## Future enhancements

- Email and in-app notifications
- Durable cloud object storage for verification uploads
- Background checks and safeguarding workflow integrations
- Calendar reminders and recurring bookings
- Expanded accessibility and end-to-end browser testing

## Privacy and safeguarding

This repository is an educational prototype and is not ready to process real medical, identity, payment, or safeguarding data. Production use would require a formal security, privacy, accessibility, and safeguarding review.

## Project contribution

This repository represents Sarah Julius's work on the full-stack application structure, including React user flows, Django data modelling, authentication integration, and the initial payment workflow.

## Author

**Sarah Julius**  
MSc Information Technology graduate with interests in full-stack development, data, systems design, and technology-led service improvement.

## Licence

No open-source licence has been assigned. All rights are reserved unless the repository owner states otherwise.
