# Member 2 – Doctor Management Service & Medical Report Management Service
## SE3020 Distributed Systems – MEDIGO Healthcare Platform

---

## Services Overview

| Service | Port | Description |
|---|---|---|
| doctor-service | 5005 | Doctor profiles, availability, prescriptions, appointments |
| medical-report-service | 5006 | Upload, view, download, share medical reports |

---

## Doctor Service API

Base URL: `http://localhost:5005`

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/doctors/register` | Register new doctor |
| GET | `/api/doctors` | Get all active doctors |
| GET | `/api/doctors/search?specialty=&name=` | Search doctors |
| GET | `/api/doctors/:id` | Get doctor by ID |
| GET | `/api/availability/:doctorId` | Get doctor availability |

### Doctor Endpoints (JWT required, role: doctor)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors/me/profile` | View own profile |
| PUT | `/api/doctors/me/profile` | Update profile |
| GET | `/api/doctors/me/appointments` | View own appointments |
| PUT | `/api/doctors/appointments/:id/status` | Accept/reject appointment |
| GET | `/api/availability/me` | View own availability |
| PUT | `/api/availability/me` | Update availability |
| POST | `/api/prescriptions` | Issue prescription |
| GET | `/api/prescriptions/my` | View issued prescriptions |
| GET | `/api/prescriptions/patient/:patientId` | View patient prescriptions |
| PUT | `/api/prescriptions/:id` | Update prescription |

### Admin Endpoints (JWT required, role: admin)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors/admin/all` | Get all doctors |
| PUT | `/api/doctors/admin/:id/verify` | Verify doctor |
| PUT | `/api/doctors/admin/:id/toggle` | Activate/deactivate |

---

## Medical Report Service API

Base URL: `http://localhost:5006`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/reports/upload` | patient, doctor | Upload report (multipart/form-data) |
| GET | `/api/reports/my` | all | View own reports |
| GET | `/api/reports/patient/:patientId` | doctor, admin | View patient reports |
| GET | `/api/reports/appointment/:appointmentId` | all | Reports by appointment |
| GET | `/api/reports/:id` | all | Get single report |
| GET | `/api/reports/:id/download` | all | Download file |
| PUT | `/api/reports/:id/share` | patient | Share with doctor |
| PUT | `/api/reports/:id/notes` | doctor, admin | Add doctor notes |
| DELETE | `/api/reports/:id` | patient, admin | Delete report |

---

## Setup

```bash
# Doctor Service
cd doctor-service
npm install
cp .env.example .env  # fill in your values
npm run dev           # runs on port 5005

# Medical Report Service
cd medical-report-service
npm install
cp .env.example .env
npm run dev           # runs on port 5006
```

---

## Register a Test Doctor (Postman)

```
POST http://localhost:5005/api/doctors/register
Content-Type: application/json

{
  "fullName": "Dr. Kamal Perera",
  "email": "doctor@healthcare.lk",
  "password": "Doctor@1234",
  "phone": "0771234567",
  "specialty": "Cardiology",
  "qualifications": "MBBS, MD",
  "hospital": "Colombo General Hospital",
  "experience": 14,
  "fee": 2500,
  "slmcNumber": "SLMC-12345"
}
```

---

## Upload a Medical Report (Postman)

```
POST http://localhost:5006/api/reports/upload
Authorization: Bearer <patient_token>
Content-Type: multipart/form-data

Fields:
  report     → file (PDF/JPG/PNG)
  title      → "Blood Test Report"
  reportType → "blood_test"
  description→ "Routine blood test results"
```
