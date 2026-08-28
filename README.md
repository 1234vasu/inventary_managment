# AI-Driven Smart Retail Management System Using MERN Stack
### M.Tech Final Year Thesis Project

This repository contains the complete implementation of an **AI-Driven Smart Retail Management System** built on the MERN stack with a Python analytical module running Scikit-Learn Linear Regression.

---

## Project Structure
```
smart-retail-system/
├── backend/            # Express REST API (Node.js)
├── frontend/           # React.js UI Console (Vite + Tailwind)
├── ai-module/          # Linear Regression forecasting engine (Python)
└── docs/               # M.Tech Thesis & IEEE Conference report
```

---

## Tech Stack Overview
* **Frontend:** React.js, Vite, Tailwind CSS, React Router, Axios, Recharts
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (using Mongoose ODM)
* **Authentication:** JWT, BcryptJS
* **AI Module:** Python, Pandas, NumPy, Scikit-Learn (Linear Regression)
* **Reporting Utilities:** PDFKit (PDF export), ExcelJS (Excel spreadsheet export)

---

## Installation & Setup

### Prerequisites
Ensure you have the following installed on your local system:
1. [Node.js](https://nodejs.org/) (v18.x or above)
2. [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on port `27017`)
3. [Python](https://www.python.org/downloads/) (v3.10 or above, with `pip` configured on PATH)

---

### Step 1: Database Setup & Seeding
1. Open a terminal and navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Seed the database (Clears existing collections, registers Cashiers, Admin, Managers, Products, Categories, Suppliers, and inserts 12 months of daily product sales to train the AI model):
   ```bash
   npm run seed
   ```

---

### Step 2: AI Python Module Configurations
1. Navigate to the `ai-module/` folder:
   ```bash
   cd ../ai-module
   ```
2. Install python packages (Pandas, Numpy, Scikit-Learn):
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: If you run into a download timeout error, use `pip install --default-timeout=1000 -r requirements.txt`)*

---

### Step 3: Run Express Back-End Server
1. Navigate back to the `backend/` folder:
   ```bash
   cd ../backend
   ```
2. Start the Express API server in development mode:
   ```bash
   npm run dev
   ```
   *(Server starts running at [http://localhost:5000](http://localhost:5000))*

---

### Step 4: Run React Front-End UI
1. Open a new terminal window and navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *(Client UI launches at [http://localhost:5173](http://localhost:5173))*

---

## Credentials for Testing
Use the following seeded accounts to test the Role-Based Access Control (RBAC):

| Role | Email | Password | Allowed Sections |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@retail.com` | `admin123` | All pages, including User Registration and Catalog Deletions. |
| **Store Manager** | `manager@retail.com` | `manager123` | Dashboard, POS, Products, Inventory, Suppliers, AI forecasting, PDF/Excel Exports. |
| **Cashier** | `cashier@retail.com` | `cashier123` | Dashboard (view metrics), POS billing checkouts, Profile settings. |

---

## Verification Checklist

### 1. AI Integration check
Log in as `manager@retail.com` and navigate to **AI Analytics**. On load, the system triggers the Python script. If successful, you will see a comparison bar chart illustrating demand forecast vs current stock, alongside a table detailing:
* **Predicted Sales** for next month.
* **Trend direction** (Upward, Downward, Stable).
* **Recommended replenishment order** quantities.

### 2. POS Bill Printing
1. Go to **POS Billing**.
2. Type barcode `5449000000996` (Coke) or search "lays" in the input box and add it to the cart.
3. Type Customer details, select a payment mode, and click **Finalize & Checkout**.
4. Upon invoice generation, click **Print Bill** inside the receipt modal. The browser will open the native printer dialogue formatted as a clean paper invoice receipt.

### 3. Report Exports
Go to **Reports**, choose date ranges, and click **Export Excel** or **Download PDF**. Check your local Downloads folder to verify files open correctly.
