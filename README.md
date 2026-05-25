# TripGenie AI

TripGenie AI is a production-style MERN travel assistant that turns uploaded travel documents and freeform trip inputs into structured Gemini-powered itineraries.

It includes JWT auth, MongoDB Atlas persistence, OCR extraction, AI itinerary generation, public share pages, PDF export, and a polished dark SaaS interface designed for mobile and desktop.

## Features

- JWT authentication with protected user flows
- Upload and OCR processing for travel documents
- Structured Gemini itinerary generation in JSON only
- Day-wise itinerary timeline and trip detail views
- Public shareable itinerary pages
- Copy-share-link and PDF export actions
- MongoDB Atlas persistence for uploads and itineraries
- Premium dark SaaS UI with responsive layouts and motion
- Clean controller/service/model architecture

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Framer Motion, Axios, React Hot Toast
- Backend: Node.js, Express, Mongoose, JWT, Multer, PDFKit
- AI: Gemini Generative Language API
- Storage: MongoDB Atlas

## Architecture

The backend follows a controller → service → model structure.

- Controllers handle request validation and response formatting.
- Services build prompts, normalize Gemini output, persist records, and generate PDFs.
- Models define persisted uploads, users, and itineraries.

The frontend keeps UI concerns separated into pages, components, and API helpers.

## Screenshots

Add product screenshots here after deployment.

- Dashboard
- Itinerary generator
- Itinerary detail timeline
- Public share page

## Installation

```bash
npm install
```

## Environment Variables

### Server

Create `server/.env`:

```bash
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_strong_secret
CLIENT_URL=http://localhost:4173
CLIENT_URLS=http://localhost:4173
OCR_SPACE_API_KEY=your_ocr_space_api_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=models/gemini-2.5-flash
```

### Client

Create `client/.env`:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Run Locally

Start both apps:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev --workspace server
npm run dev --workspace client
```

## API Flow

1. Upload a travel document or enter trip details.
2. OCR extracts travel signals and stores the upload.
3. Gemini generates a structured itinerary JSON payload.
4. The backend normalizes and persists the itinerary in MongoDB.
5. The client renders the itinerary in a timeline/detail view.
6. Users can create a public share link or export a PDF.

### Core Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/uploads`
- `POST /api/uploads`
- `GET /api/itineraries`
- `POST /api/itineraries/generate`
- `GET /api/itineraries/:itineraryId`
- `POST /api/itineraries/:itineraryId/share`
- `GET /api/itineraries/:itineraryId/pdf`
- `GET /api/itineraries/share/:shareId`
- `GET /api/itineraries/share/:shareId/pdf`

## Deployment

### Frontend on Vercel

1. Import the `client` folder as a Vercel project.
2. Set `VITE_API_URL` to your deployed backend URL.
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend on Render

1. Import the `server` service using `render.yaml`.
2. Set the production environment variables.
3. Deploy with `npm start`.
4. Point `CLIENT_URL` and `CLIENT_URLS` to the deployed frontend domain.

### Deployment Links

- Frontend: replace with your Vercel URL
- Backend: replace with your Render URL

## Future Improvements

- Add authentication-protected share management for revoking public links
- Add richer PDF styling with a branded cover page
- Add server-side pagination and search for itinerary history
- Add email sharing and social preview cards
- Add analytics for itinerary generation and share usage
