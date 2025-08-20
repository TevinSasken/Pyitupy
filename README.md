# Pyitupy - Decentralized Loan Marketplace

Pyitupy is a decentralized peer-to-peer lending platform that connects **borrowers** and **lenders**.  
Borrowers can request loans, and lenders can fund them using stablecoins (USDT).  
The backend manages loan records and funding logic, while the frontend provides an intuitive interface.

## Features
- Borrowers can create loan requests with purpose, amount, and repayment period.
- Lenders can browse available loans and choose which ones to fund.
- Integration with escrow for secure transactions.
- FastAPI backend with PostgreSQL database.
- React + Vite frontend deployed on Vercel.
- Backend deployed on Render.

---

## Project Structure
Pyitupy/
│
├── backend/ # FastAPI backend
│ ├── app/
│ │ ├── main.py # FastAPI entrypoint
│ │ ├── db.py # Database connection
│ │ ├── routes/ # Routes (KYC, credit_score, loans, etc.)
│ ├── requirements.txt # Python dependencies
│ └── render.yaml # Render deployment config
│
├── frontend/ # React frontend
│ ├── src/pages/ # React pages (Marketplace, LoanFunding, ConnectWallet, etc.)
│ ├── package.json # Frontend dependencies
│ └── vite.config.js # Vite configuration
│
└── README.md # Project documentation



## Tech Stack
- **Frontend**: React + Vite, TailwindCSS  
- **Backend**: FastAPI (Python)  
- **Database**: PostgreSQL  
- **Deployment**: Vercel (frontend), Render (backend)  


## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/TevinSasken/Pyitupy.git
cd pyitupy

##Backend Set-Up
cd backend
python -m venv venv
source venv/bin/activate   # (Linux/Mac)
venv\Scripts\activate      # (Windows)

pip install -r requirements.txt

##Start the server
uvicorn app.main:app --reload

##Backend will run on
http://127.0.0.1:8000

##Frontend Set-Up
cd frontend
npm install
npm run dev

##Frontend will run on
http://localhost:5173

Deployment

Backend (Render)

Connect backend repo to Render

Add environment variables (DB credentials)

Deploy automatically on push

Frontend (Vercel)

Connect frontend repo to Vercel

Set API base URL to Render backend URL

Contributors: Tevin Sasken
Email address: mwauratevin@gmail.com
X: @Sasken_t