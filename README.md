# VibeTravels

[![Project Status: MVP Development](https://img.shields.io/badge/status-MVP%20Development-blue)](.) <!-- Placeholder status badge -->

## Table of Contents

1.  [Project Description](#project-description)
2.  [Tech Stack](#tech-stack)
3.  [Getting Started Locally](#getting-started-locally)
4.  [Available Scripts](#available-scripts)
5.  [Project Scope (MVP)](#project-scope-mvp)
6.  [Project Status](#project-status)
7.  [License](#license)

## Project Description

VibeTravels aims to simplify the initial, often challenging, phase of travel planning. Many users have scattered ideas and inspirations for future trips but struggle to consolidate them into concrete plans. This application allows users to capture these initial thoughts as simple text notes.

The core feature leverages AI (via Openrouter.ai) to analyze these user-created notes and generate new, descriptive travel suggestions or outlines, turning fragmented ideas into actionable starting points for planning.

This repository contains the Minimum Viable Product (MVP) version of VibeTravels, focusing on validating the core note-taking and AI suggestion generation functionalities.

## Tech Stack

-   **Frontend:**
    -   [Astro 5](https://astro.build/): For building fast, content-focused websites with less client-side JavaScript.
    -   [React 19](https://react.dev/): For interactive UI components.
    -   [TypeScript 5](https://www.typescriptlang.org/): For static typing and improved developer experience.
    -   [Tailwind CSS 4](https://tailwindcss.com/): Utility-first CSS framework for styling.
    -   [Shadcn/ui](https://ui.shadcn.com/): Re-usable UI components built with Radix UI and Tailwind CSS.
-   **Backend & Database:**
    -   [Supabase](https://supabase.com/): Open-source Firebase alternative providing PostgreSQL database, authentication, and BaaS SDKs.
-   **AI Integration:**
    -   [Openrouter.ai](https://openrouter.ai/): Access to a wide variety of LLMs (OpenAI, Anthropic, Google, etc.) for generating travel suggestions.
-   **CI/CD:**
    -   [GitHub Actions](https://github.com/features/actions): For setting up automated build and deployment pipelines.

## Getting Started Locally

Follow these steps to set up and run the project on your local machine:

1.  **Prerequisites:**
    -   Node.js: Version specified in the `.nvmrc` file. We recommend using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager).
        ```bash
        nvm install
        nvm use
        ```
    -   npm (usually comes with Node.js)

2.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd 10xDevs-travel
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Environment Variables:**
    -   Create a `.env` file in the project root.
    -   Add the necessary environment variables for Supabase and Openrouter.ai. You'll need:
        -   `PUBLIC_SUPABASE_URL`: Your Supabase project URL.
        -   `PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project anonymous key.
        -   `OPENROUTER_API_KEY`: Your API key from Openrouter.ai.
    ```env
    # .env example
    PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
    ```
    *Note: Refer to Supabase and Openrouter documentation for obtaining these keys.*

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application should now be running locally, typically at `http://localhost:4321`.

## Available Scripts

The following scripts are available via npm:

-   `npm run dev`: Starts the Astro development server with HMR (Hot Module Replacement).
-   `npm run start`: Starts the Astro development server (similar to `dev`).
-   `npm run build`: Builds the application for production.
-   `npm run preview`: Starts a local server to preview the production build.
-   `npm run astro ...`: Allows running Astro CLI commands directly.
-   `npm run check`: Runs Astro's diagnostic checks (e.g., type checking).

## Project Scope (MVP)

The current MVP includes the following core functionalities:

-   **User Authentication:** Simple user registration and login.
-   **Note Management:** Users can Create, Read, Update (Edit), and Delete their own text-based travel notes.
-   **AI Suggestion Generation:**
    -   Users can trigger an AI process.
    -   The AI analyzes *all* of the user's current notes.
    -   A new, descriptive travel suggestion is generated as a text note.
    -   The AI-generated note is automatically saved to the user's note list.

**Out of Scope for MVP:**

-   Sharing notes/plans between users.
-   Multimedia support in notes (text only).
-   Advanced planning features (logistics, budgeting, scheduling).
-   Editing of AI-generated notes.
-   Data export.
-   User profiles or storing user preferences to influence AI.
-   Usage analytics or success metric tracking.
-   Data backup mechanisms.
-   Public API.

## Project Status

This project is currently in the **Minimum Viable Product (MVP) development phase**. Core features are being built and refined.

## License

This project is currently unlicensed. Consider adding a license file (e.g., `LICENSE.md` with the MIT License) to clarify usage rights.