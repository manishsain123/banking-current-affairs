# BankDCA - Daily Current Affairs for Banking & Insurance Exams

A complete, production-ready Web Application and Automation System specifically engineered for aspirants of **Indian Banking and Insurance Examinations** (SBI PO, SBI Clerk, IBPS PO, IBPS Clerk, RBI Grade B, RBI Assistant, IBPS RRB, LIC AAO, and SEBI Grade A).

---

## 1. System Architecture & Tech Stack

```
                                  +------------------------------------+
                                  |     Angular 18 Frontend (SPA)      |
                                  |  - Bilingual (EN, Hindi, Dual)     |
                                  |  - Date Archive & Calendar         |
                                  |  - Student Bookmarks / Revision    |
                                  |  - Admin CRUD & Trigger Controls   |
                                  +-----------------+------------------+
                                                    |
                                          HTTP / RESTful JSON
                                                    v
+-----------------------------+   +------------------------------------+
|  Google Gemini / OpenAI LLM |<--|     .NET 8 Web API (Backend)       |
|  - Financial Summarization  |   |  - Clean Layered Architecture      |
|  - Bilingual Translation    |   |  - Entity Framework Core           |
|  - Banking Takeaways & GK   |   |  - Hangfire Background Automation  |
+-----------------------------+   +-----------------+------------------+
                                                    |
                                            EF Core / Npgsql / Sqlite
                                                    v
                                  +------------------------------------+
                                  | Database (PostgreSQL / SQLite)     |
                                  |  - Daily Digests & Metrics         |
                                  |  - Current Affairs & Bullet Points |
                                  |  - Categories & Bookmarks          |
                                  +------------------------------------+
```

### Technology Highlights:
- **Backend**: .NET 8 Web API (C#), Entity Framework Core 8, Hangfire 1.8 (Scheduler + Dashboard), Swagger / OpenAPI.
- **Background Automation**: Recurring Hangfire worker scheduled daily at `05:00 AM IST` (`0 5 * * *`) with manual trigger API endpoints.
- **AI / LLM Integration**: Google Gemini API (`gemini-1.5-flash`) or OpenAI API (`gpt-4o-mini`) with high-fidelity fallback generator.
- **Database**: PostgreSQL (Npgsql) or SQL Server, with automatic SQLite fallback (`Data Source=banking_current_affairs.db`) for instant zero-dependency local execution.
- **Frontend**: Angular 18 (Standalone Components, Signals, RxJS, Typed Forms), Tailwind CSS, Inter & Noto Sans Devanagari typography.

---

## 2. Core Features

1. **Automated Daily Notes Generation**:
   - Hangfire background scheduler wakes up every morning at 5:00 AM.
   - Synthesizes news categorized into: *Banking & Financial Awareness*, *RBI Circulars & Monetary Policy*, *Economy & GDP Projections*, *Government Schemes*, *Appointments & Leadership*, *MoUs & Mergers*, *National/International Summits*, *Awards & Indexes*, and *Important Days*.
   - Generates bullet points, Banking Exam takeaways (e.g. section numbers, limits, committee names), and Static GK facts.
2. **Bilingual Support (English & Hindi)**:
   - **English Mode (`EN`)**: Standard English text.
   - **Hindi Mode (`हिंदी`)**: High-quality Hindi translation with proper financial terminology.
   - **Dual View Mode (`Dual / द्विभाषी`)**: Side-by-side or stacked presentation for rapid bilingual learning and interview preparation.
3. **Banking & Financial Policy Rates Ticker**:
   - Real-time display of RBI Policy Repo Rate, SDF, MSF, CRR, SLR, and CPI inflation targets.
4. **Calendar & Date-wise Archive**:
   - Interactive calendar widget showing days with published notes.
   - Quick jump between previous and next dates or direct calendar selection.
5. **Exam Revision & Bookmarks**:
   - Save high-probability exam questions with one click.
   - Instant local and backend synchronization for quick revision prior to prelims and mains.
6. **Print & PDF Export**:
   - Dedicated print CSS layout allowing students to save notes as clean revision PDFs.
7. **Admin Dashboard**:
   - Trigger automated AI sync on demand for today or any historical date.
   - Complete CRUD operations for manual adjustments or additions.
   - Real-time Hangfire job history and status tracking.

---

## 3. Project Structure

```
d:\Project\
├── backend\
│   ├── BankingCurrentAffairs.sln
│   └── src\
│       ├── BankingCurrentAffairs.Core\           # Domain entities, enums, DTOs, interfaces
│       ├── BankingCurrentAffairs.Infrastructure\ # EF Core DbContext, Seeder, Hangfire Job, Gemini/OpenAI service
│       └── BankingCurrentAffairs.Api\            # Controllers, Swagger, Hangfire Dashboard, Program.cs
├── frontend\
│   ├── src\
│   │   ├── app\
│   │   │   ├── core\                           # Models & Services (CurrentAffairs, Bookmarks, Admin, Language)
│   │   │   ├── features\
│   │   │   │   ├── daily-digest\               # Main bilingual reader, cards, policy ticker
│   │   │   │   ├── archive-calendar\           # Interactive calendar & date archive
│   │   │   │   ├── bookmarks\                  # Saved revision deck
│   │   │   │   └── admin\                      # Admin dashboard & bilingual edit modal
│   │   │   └── shared\                         # Navbar & Footer
│   │   ├── index.html
│   │   └── styles.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── angular.json
├── docker-compose.yml                          # Optional PostgreSQL container
└── README.md
```

---

## 4. Step-by-Step Setup & Running Guide

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+ or 20+](https://nodejs.org/) & `npm`
- (Optional) Docker for running PostgreSQL

---

### Step 1: Running the .NET 8 Backend API

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend/src/BankingCurrentAffairs.Api
   ```

2. *(Optional)* Configure your LLM API Key in `appsettings.json`:
   ```json
   "AiSettings": {
     "Provider": "Gemini",
     "ApiKey": "YOUR_GEMINI_API_KEY",
     "Model": "gemini-1.5-flash"
   }
   ```
   > **Note**: If you do not provide an API key, the system automatically uses its built-in, curated banking synthesizer, allowing full testing offline!

3. *(Optional)* Database Selection:
   - By default, `DatabaseProvider` is set to `"Sqlite"`, which requires zero installation and creates `banking_current_affairs.db` automatically on startup.
   - To use PostgreSQL, start the container via `docker compose up -d` in the root folder, and change `"DatabaseProvider": "PostgreSql"` in `appsettings.json`.

4. Restore dependencies and run the API:
   ```bash
   dotnet restore
   dotnet run
   ```

5. The API will start on:
   - **Swagger UI**: [http://localhost:5000/swagger](http://localhost:5000/swagger)
   - **Hangfire Dashboard**: [http://localhost:5000/hangfire](http://localhost:5000/hangfire)
   - **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

*On first startup, the database seeder automatically populates the standard banking categories and rich bilingual current affairs for immediate testing.*

---

### Step 2: Running the Angular Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Angular development server:
   ```bash
   npm start
   ```
   *(or `npx ng serve`)*

4. Open your browser and navigate to:
   [http://localhost:4200](http://localhost:4200)

---

### Step 3: 100% Free Production Cloud Deployment (GitHub + Render + Vercel)

Follow these steps to deploy both the backend (with free PostgreSQL) and frontend with automated CI/CD:

#### 1. Push to Your GitHub Repository
```bash
git init
git add .
git commit -m "feat: complete banking current affairs & exam target zone system"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/banking-current-affairs.git
git push -u origin main
```

#### 2. Deploy Backend & PostgreSQL on Render (Zero-Config Blueprint)
1. Sign in to [Render](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render automatically detects [`render.yaml`](file:///d:/Project/render.yaml) and provisions:
   - **PostgreSQL Database (`bankdca-postgres`)**: Free tier database with internal connection strings.
   - **Web API Service (`bankdca-api`)**: Builds from [`backend/Dockerfile`](file:///d:/Project/backend/Dockerfile), binds to `$PORT`, runs EF Core migrations, seeds initial data, and schedules 5:00 AM background jobs.
5. Click **Apply**.
6. When deployment finishes, copy your live backend URL (e.g., `https://bankdca-api.onrender.com`).
   - Swagger Documentation: `https://bankdca-api.onrender.com/swagger`
   - Hangfire Dashboard: `https://bankdca-api.onrender.com/hangfire`

#### 3. Deploy Frontend on Vercel
1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project** and import your GitHub repository.
3. In the configuration screen:
   - **Framework Preset**: Angular
   - **Root Directory**: Click `Edit` and select `frontend`.
4. Click **Deploy**. Vercel uses [`frontend/vercel.json`](file:///d:/Project/frontend/vercel.json) to handle Single-Page Application rewrites so `/exam-zone`, `/archive`, `/bookmarks`, and `/admin` routes work on direct page reloads!
5. Update `frontend/src/environments/environment.prod.ts` with your live Render backend URL:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://bankdca-api.onrender.com/api'
   };
   ```
   Push changes to GitHub and Vercel will auto-deploy the update!

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/currentaffairs/today` | Fetch today's bilingual digest with metrics |
| `GET` | `/api/currentaffairs/date/{date}` | Fetch digest for specific date (`YYYY-MM-DD`) |
| `GET` | `/api/currentaffairs/archive-dates` | Get list of dates having published digests |
| `GET` | `/api/currentaffairs/search` | Search & filter items by category, exam, keyword |
| `GET` | `/api/currentaffairs/items/{id}` | Get item details by GUID |
| `GET` | `/api/categories` | List all banking categories |
| `GET` | `/api/bookmarks/user/{userId}` | Get student's bookmarked revision articles |
| `POST` | `/api/bookmarks/toggle` | Toggle bookmark state for an item |
| `POST` | `/api/jobs/trigger-daily-sync` | Manually trigger AI notes generation for a date |
| `GET` | `/api/jobs/history` | View background automation execution logs |
| `GET` | `/api/examquestions/months` | List available month-years with question counts |
| `GET` | `/api/examquestions` | Get expected questions filtered by month, category, difficulty |
| `GET` | `/api/examquestions/{id}` | Get single expected question details |
| `POST` | `/api/examquestions/generate` | Run AI analysis and generate expected questions for a month |
| `DELETE` | `/api/examquestions/{id}` | Delete expected question |
| `POST` | `/api/admin/items` | Add a new manual current affair note |
| `PUT` | `/api/admin/items/{id}` | Update existing current affair note |
| `DELETE` | `/api/admin/items/{id}` | Delete a current affair note |

---

## 6. License & Examination Disclaimer
Content generated and structured is intended for educational preparation for exams administered by IBPS, SBI, RBI, and related bodies.
