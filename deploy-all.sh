#!/bin/bash

echo "🚀 Starting MediGo Full System Deployment..."

# --- BUILD PHASE ---
echo "========================================="
echo "📦 PHASE 1: Building Docker Images..."
echo "========================================="

echo "Building Frontend..."
docker build -t medigo-frontend:latest frontend

echo "Building Auth Service..."
docker build -t medigo-auth-service:latest backend/services/auth-service

echo "Building Doctor Service..."
docker build -t medigo-doctor-service:latest backend/services/doctor-service

echo "Building Patient Service..."
docker build -t medigo-patient-service:latest backend/services/patient-service

echo "Building Appointment Service..."
docker build -t medigo-appointment-service:latest backend/services/appointment-service

echo "Building Admin Service..."
docker build -t medigo-admin-service:latest backend/services/admin-service

# --- DEPLOY PHASE ---
echo "========================================="
echo "☸️  PHASE 2: Restarting Kubernetes Pods..."
echo "========================================="

kubectl rollout restart deployment \
  frontend-deployment \
  auth-service-deployment \
  doctor-service-deployment \
  patient-service-deployment \
  appointment-service-deployment \
  admin-service-deployment

echo "========================================="
echo "✅ Deployment complete! Run 'kubectl get pods -w' to watch them spin up."
echo "========================================="