# Nightclub Payment Tracking

Streamline nightclub payment processing by offloading start.gg queries.

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Vite
- Firebase (Cloud Firestore)

## Prerequisites

- Node.js (v14 or later)
- npm
- Git
- start.gg developer account
- Firebase account

## How to Use

1. Clone the repository
   ```bash
   git clone https://your-repo-url.git
   cd nightclub-payment-tracking
   ```

2. Install dependencies
   ```bash
   npm ci
   ```

3. Set up start.gg API
   - Obtain a start.gg API key (full documentation on [start.gg](https://developer.start.gg/docs/authentication/))
   - Rename `example.env` to `.env`
   - Add your developer key to the `.env` file:
     ```
     VITE_START_GG_API_KEY=your_api_key_here
     ```

4. Set up Firebase
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Cloud Firestore in your project
   - In the Firebase Console, go to Project Settings > General > Your apps
   - Click "Add app" and choose "Web"
   - Register your app and copy the configuration object
   - Edit `src/firebase.tsx` and replace the existing config with your own:
     ```typescript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)
