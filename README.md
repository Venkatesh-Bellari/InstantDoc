# InstantDoc - AI Health Companion

InstantDoc is an AI-powered health assistant offering a range of features including health Q&A, visual symptom checking, lab report analysis, mental health support, and more. It utilizes the Gemini API for its intelligent functionalities.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18.x or higher is recommended)
- npm (which comes with Node.js) or yarn

## Setup Instructions

1.  **Clone the Repository (if you haven't already):**
    If you've downloaded the source code as a ZIP, extract it. Otherwise, if it's a Git repository:
    ```bash
    git clone <https://github.com/Venkatesh-Bellari/InstantDoc>
    cd instantdoc-ai-health-companion
    ```

2.  **Install Dependencies:**
    Navigate to the project's root directory in your terminal and run:
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

3.  **Set Up Environment Variables (Crucial for AI Features):**
    The application requires a Google Gemini API Key to enable its AI-powered features.
    
    *   Create a new file named `.env` in the root directory of the project (alongside `package.json` and `vite.config.ts`).
    *   Add your Gemini API key to this `.env` file as follows:

        ```env
        API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
        ```
    *   Replace `YOUR_ACTUAL_GEMINI_API_KEY` with the real API key you obtained from Google AI Studio.

    **Note:** The `vite.config.ts` file is already configured to load this `API_KEY` from the `.env` file and make it available as `process.env.API_KEY` within the application's client-side code. **Do not commit your `.env` file to version control if this is a public repository.**

## Running the Application

1.  **Start the Development Server:**
    Once dependencies are installed and the `.env` file is configured, run the following command in the project's root directory:
    Using npm:
    ```bash
    npm run dev
    ```
    Or using yarn:
    ```bash
    yarn dev
    ```
    This command will start the Vite development server. It will typically open the application automatically in your default web browser at `http://localhost:3000` (or another port if 3000 is in use). You'll see messages in your terminal indicating the server is running.

2.  **Access the Application:**
    Open your web browser and navigate to the local URL provided by Vite (usually `http://localhost:3000`).

## Building for Production

If you need to create an optimized build of the application for deployment:

1.  **Run the Build Command:**
    Using npm:
    ```bash
    npm run build
    ```
    Or using yarn:
    ```bash
    yarn build
    ```
    This will compile the TypeScript code, bundle the assets, and create a `dist` folder in the project root. This `dist` folder contains the static files ready for deployment to a web server or hosting platform.

## Key Features

- **AI Health Q&A:** Ask health-related questions and get AI-powered answers. Supports Google Search grounding for up-to-date information.
- **Visual Symptom Checker:** Upload images of symptoms for AI analysis.
- **Lab Report Analysis:** Upload medical documents (like lab reports) for simplified explanations.
- **Mental Health Support:** A space for users to discuss feelings and get empathetic responses.
- **Meal & Fitness Plans:** Generate personalized meal and workout suggestions.
- **Nutritional Insights:** Get nutritional breakdowns from meal descriptions or photos.
- **General AI Chat:** For general health and wellness inquiries.
- **Emergency Alert System:** AI can detect potential emergencies and guide users to contact services or saved contacts. Includes location sharing.
- **User Authentication & Profile:** Secure login/signup and personal health profile management.
- **Emergency Contacts:** Users can save emergency contacts for quick actions during alerts and emergency situations.
- **Medicine Reminders:** Set reminders for medications with desktop notification support.
- **Multilingual Support:** Chat interface supports multiple languages for AI interaction and Text-to-Speech output.
- **Responsive Design:** Adapts to various screen sizes.

## Technology Stack

- **Frontend:** React, TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **AI Integration:** Google Gemini API (`@google/genai`)
- **State Management:** React Hooks (useState, useEffect, useCallback)
- **Routing:** Implicit (view management within App.tsx)
- **Browser APIs:** Geolocation, Notification API, SpeechSynthesis API

---

Enjoy using InstantDoc! If you encounter any issues, please double-check the API key setup and ensure all dependencies are correctly installed.
