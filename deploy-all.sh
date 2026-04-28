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

echo "Building Telemedicine Service..."
docker build -t medigo-telemedicine-service:latest backend/services/telemedicine-service

echo "Building Payment Service..."
docker build -t medigo-payment-service:latest backend/services/payment-service

echo "Building Medical Report Service..."
docker build -t medigo-mediaclreport-service:latest backend/services/mediaclreport-service

echo "Building Notification Service..."
docker build -t medigo-notification-service:latest backend/services/notification-service

# --- DEPLOY PHASE ---
echo "========================================="
echo "☸️  PHASE 2: Restarting Kubernetes Pods..."
echo "========================================="

# 1. Apply any changes made to the YAML files
echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/

# 2. Force pods to restart and pull the newly built images
kubectl rollout restart deployment \
  frontend-deployment \
  auth-service-deployment \
  doctor-service-deployment \
  patient-service-deployment \
  appointment-service-deployment \
  admin-service-deployment \
  telemedicine-service-deployment \
  payment-service-deployment \
  medicalreport-service-deployment \
  notification-service-deployment

echo "========================================="
echo "✅ Deployment complete! Run 'kubectl get pods -w' to watch them spin up."
echo "========================================="