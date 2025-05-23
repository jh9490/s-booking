# ANC FM — Mobile Service Booking App

ANC FM is a mobile application built with React Native and Expo, designed for field technicians, supervisors, and customers to manage service requests efficiently. This project is currently in its second sprint with core features implemented.

---

## 🚀 Features (Sprint 2 Complete)

### ✅ Technician Module

* View assigned bookings
* Filter by status: Scheduled, Pending, Done, Canceled
* View detailed request info
* Add technician notes and update request status
* Preview attached images (with full-screen modal)

### ✅ File Upload & Management

* Users can attach one or multiple images to service requests
* Uploaded images are stored in Directus and linked via many-to-many relation
* Technicians can preview these files in the detail screen

### ✅ Supervisor Module

* Assign technicians to requests
* Choose preferred date and time range
* Internal chat between supervisor and technician

### ✅ UI Enhancements

* Color-coded filters and buttons
* Improved cards and layout spacing
* Mobile-friendly and responsive design

---

## 📦 Tech Stack

* **Frontend**: React Native, Expo, NativeWind, TailwindCSS
* **Backend**: Directus (headless CMS + REST API)
* **Database**: PostgreSQL (via Directus)
* **Auth**: JWT (custom login endpoint)
* **Storage**: Directus Files API

---

## 📂 Project Structure

```bash
app/
  ├── (tabs)/
  ├── (supervisorTabs)/
  ├── technician/
  ├── booking/
  ├── services/
  ├── login.tsx
  └── +not-found.tsx

api/
context/
assets/
components/
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start Expo server
npm start
```

> You must wrap your root layout in `GestureHandlerRootView`.

---

## 📤 Creating a Release

1. Push all changes
2. Go to GitHub → Releases → "Draft a new release"
3. Tag with something like `v2.0.0` or `sprint-2-complete`
4. Describe the sprint deliverables
5. Click **Publish release**

---

## 📅 Sprint 3 Goals (planned)

* Customer ratings and reviews
* Technician location tracking
* Multi-language support (i18n)
* Push notifications

---

## 🙏 Credits

Developed and maintained by the ANC FM team with ❤️ and a focus on real-world field service needs.
