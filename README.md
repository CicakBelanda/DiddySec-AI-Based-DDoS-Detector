# 🛡️ DiddySec  
**AI-Based Anomaly Detection for DDoS Attack Prevention**

DiddySec is an AI-powered application designed to detect and prevent potential DDoS attacks by analyzing network traffic using anomaly detection techniques. It supports both offline input (via `.pcap` or `.csv` files) and real-time monitoring.

---

## ⚙️ Features

- 🔍 Detects suspicious traffic patterns and DDoS anomalies
- 📁 Accepts input from `.pcap`/`.csv` files or live monitoring
- 🤖 Utilizes AI models for flow-level classification
- 📊 Provides interactive visual results and statistics via web UI

---

## 📦 Requirements

Before running the application, ensure you have installed:

- Python 3.8+
- Node.js and npm
- Git (optional)

---

## 🚀 Getting Started

Follow these steps to run the DiddySec application on your local machine.

### 1. Run the Backend

Open the first terminal and run:

```bash
cd backend
python capture_client.py --interface 4 --interval 1 --api-key "this-is-api-key-lol" --api-url "https://web-production-8fe18.up.railway.app"
```

### 2. Run the Frontend

Open a second terminal:

```bash
cd frontend
npm install   # Run this only once
npm run dev
```

After running, the frontend will be accessible at:
http://localhost:5173

### 3. Login Credentials

Use this credentials to login into the dashboard:

```bash
Username : test@test.com
Password : test
```