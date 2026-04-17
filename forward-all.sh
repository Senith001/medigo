#!/bin/bash

echo "🔌 Starting Port Forwarding for all MediGo services..."

# This 'trap' catches when you press Ctrl+C and kills all the background port-forwards safely
trap 'echo -e "\n🛑 Stopping all port forwards..."; kill $(jobs -p) 2>/dev/null; exit' SIGINT SIGTERM

echo "🌐 Forwarding Frontend (Port 30000)..."
kubectl port-forward service/frontend-service 30000:80 &

echo "🔐 Forwarding Auth Service (Port 5001)..."
kubectl port-forward service/auth-service-network 5001:5001 &

echo "🧑‍⚕️ Forwarding Patient Service (Port 5002)..."
kubectl port-forward service/patient-service-network 5002:5002 &

echo "🗂️ Forwarding Admin Service (Port 5003)..."
kubectl port-forward service/admin-service-network 5003:5003 &

echo "🩺 Forwarding Doctor Service (Port 5004)..."
kubectl port-forward service/doctor-service-network 5004:5004 &

echo "📅 Forwarding Appointment Service (Port 5005)..."
kubectl port-forward service/appointment-service-network 5005:5005 &

echo "📅 Forwarding Medical Report Service (Port 5006)..."
kubectl port-forward service/medicalreport-service-network 5006:5006 &

echo "📅 Forwarding Payment Service (Port 5007)..."
kubectl port-forward service/payment-service-network 5007:5007 &

echo "📅 Forwarding Telemedicine Service (Port 5008)..."
kubectl port-forward service/telemedicine-service-network 5008:5008 &

echo "📅 Forwarding Notification Service (Port 5009)..."
kubectl port-forward service/notification-service-network 5009:5009 &

echo "======================================================"
echo "✅ All ports are now forwarding in the background!"
echo "⚠️  KEEP THIS TERMINAL OPEN. PRESS CTRL+C TO STOP ⚠️"
echo "======================================================"

# This command keeps the script alive so the background jobs don't die
wait