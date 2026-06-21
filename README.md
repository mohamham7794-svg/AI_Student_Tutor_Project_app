# Student Project AI Tutor 🎓

An AI-powered FastAPI backend that acts as an academic tutor. Given a student's assignment prompt and an optional rubric, it returns a structured **project plan**, **report outline**, **tutor guidance**, and a **quality checklist** — without writing the report for the student.

Built for the **DDS Building AI Application Challenge (June 2026)**.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Python 3.11+ · FastAPI |
| AI | Gemini 1.5 Pro via Google AI Studio |
| SDK | `google-genai` |
| Hosting | Vercel (serverless) |

---

## Local Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/student-ai-tutor.git
cd student-ai-tutor
pip install -r requirements.txt
```

### 2. Set your API key

```bash
cp .env.example .env
# Edit .env and paste your Google AI Studio key:
# GEMINI_API_KEY=your_key_here
```

Get a free key at: https://aistudio.google.com/app/apikey

### 3. Run locally

```bash
uvicorn main:app --reload
```

Visit **http://localhost:8000/docs** for the interactive Swagger UI.

---

## API Reference

### `POST /tutor/generate`

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `assignment_prompt` | string | ✅ Yes | The full assignment question/prompt |
| `rubric_text` | string | No | Rubric pasted as plain text |
| `rubric_file` | `.txt` file | No | Rubric uploaded as a `.txt` file (UTF-8) |
| `grade_level` | string | No | e.g. `"Grade 10"`, `"University Year 2"` |
| `deadline` | string | No | e.g. `"2 weeks"`, `"June 30 2025"` |
| `report_type` | string | No | e.g. `"research report"`, `"lab report"` |

> **Note:** If both `rubric_text` and `rubric_file` are provided, `rubric_file` content overwrites `rubric_text`.  
> `rubric_file` must be `.txt` — other formats return HTTP 400.

---

## Example curl Requests

### With `rubric_text` (inline text)

```bash
curl -X POST http://localhost:8000/tutor/generate \
  -F "assignment_prompt=Write a report explaining the causes and impacts of climate change on local ecosystems. Include an introduction, background, 3 causes, 3 impacts, and mitigation strategies. Conclude with a summary." \
  -F "rubric_text=Rubric: The report should (1) include all required sections, (2) clearly explain causes and impacts, (3) provide mitigation strategies, (4) has logical flow and correct grammar, (5) appropriate citation of sources if used (if no citations are provided, mark as unknown)." \
  -F "grade_level=Grade 10" \
  -F "deadline=2 weeks"
```

### With `rubric_file` (.txt upload)

```bash
curl -X POST http://localhost:8000/tutor/generate \
  -F "assignment_prompt=Write a report explaining the causes and impacts of climate change on local ecosystems. Include an introduction, background, 3 causes, 3 impacts, and mitigation strategies. Conclude with a summary." \
  -F "rubric_file=@rubric.txt" \
  -F "grade_level=Grade 10" \
  -F "deadline=2 weeks"
```

> A sample `rubric.txt` file is included in this repo.

### Without rubric (generic checklist)

```bash
curl -X POST http://localhost:8000/tutor/generate \
  -F "assignment_prompt=Analyse the economic causes of the 2008 Global Financial Crisis."
```

---

## Response Schema

```json
{
  "project_plan": [
    {
      "milestone": "string",
      "tasks": ["string"],
      "estimated_time_days": 1
    }
  ],
  "report_outline": [
    {
      "section": "string",
      "subsections": ["string"]
    }
  ],
  "tutor_guidance": {
    "clarifying_questions": ["string"],
    "what_to_do_next": ["string"],
    "improvement_tips": ["string"]
  },
  "quality_checklist": [
    {
      "item": "string",
      "meets_requirement": "yes | no | unknown"
    }
  ]
}
```

See `sample_output.json` for a full example response.

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import on Vercel

- Go to https://vercel.com/new
- Import your GitHub repo
- Framework Preset: **Other**
- Root Directory: `/` (default)

### 3. Set environment variable

In Vercel project → **Settings → Environment Variables**:

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | `your_google_ai_studio_key` |

### 4. Deploy

Click **Deploy**. Vercel uses `vercel.json` to route all requests through `main.py`.

After deploy, test with:

```bash
curl -X POST https://YOUR-APP.vercel.app/tutor/generate \
  -F "assignment_prompt=Write a report on the water cycle." \
  -F "grade_level=Grade 8"
```

---

## Error Responses

| Status | Cause |
|---|---|
| `400` | `rubric_file` is not a `.txt` file |
| `400` | `rubric_file` is not valid UTF-8 |
| `422` | `assignment_prompt` is missing |
| `500` | Gemini returned invalid/empty JSON |
| `502` | Gemini API call failed (check API key / quota) |

---

## Project Structure

```
student-ai-tutor/
├── main.py             # FastAPI app + endpoint + Gemini integration
├── requirements.txt    # Python dependencies
├── vercel.json         # Vercel serverless routing config
├── .env.example        # Template for environment variables
├── .gitignore          # Excludes .env and cache files
├── rubric.txt          # Sample rubric file for testing
├── sample_output.json  # Example API response
├── tests.http          # HTTP test file (REST Client / VS Code)
└── README.md           # This file
```

---

## Tutor Mode Rules

This API is designed to **guide** students, not complete work for them:

- ✅ Returns a project plan with milestones and estimated timelines  
- ✅ Returns a structured report outline  
- ✅ Asks clarifying questions to help students think  
- ✅ Gives "what to do next" guidance  
- ❌ Does **NOT** write the full final report