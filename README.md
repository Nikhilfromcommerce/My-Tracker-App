MindTrack: A Personalized AI Wellness Tracker

This project was built for the Hackarena hackathon.

Live Deployed Link: https://my-tracker-app-kappa.vercel.app/


🚀 The Problem

Many people want to build better daily habits (exercise, journaling, meditation) but fail to stay consistent due to a lack of reminders, personalization, and motivation.

✨ The Solution

MindTrack is a personalized wellness app that helps users track their habits, goals, and daily inspiration. It uses AI to provide suggestions and breaks down large goals into small, actionable daily habits.

💻 Tech Stack

1. Frontend: React

Built as a single-page application using React with Functional Components and Hooks.

Styling: Tailwind CSS for a responsive, mobile-first design.

Routing: Simple conditional rendering (no router library) to switch between views.

Deployment: Hosted on Vercel, automatically deployed from the main GitHub branch.

2. Backend: Firebase (BaaS)

Instead of a traditional backend (like Node.js or Django), this project uses Firebase as its Backend-as-a-Service.

Database: Cloud Firestore is used to store all user data in real-time, including habits, daily logs, challenges, and settings.

Authentication: Firebase Authentication is used to sign users in anonymously and provide a secure userId for their data.

3. APIs: Google (Gemini)

The AI features are powered by the Google Gemini API.

AI Habit Coach: Suggests new habits based on the user's current ones.

AI Goal Breakdown: Takes a large, vague goal (like "reduce stress") and breaks it into concrete, trackable habits.

Daily Challenge: Generates a unique, simple challenge for the user every day.

🔐 Security

All API keys (for both Firebase and Google Gemini) are kept secure.

Local Development: Keys are stored in an untracked .env.local file.

Live Deployment: Keys are securely stored as Environment Variables in Vercel, ensuring they are never exposed in the public GitHub repository. GitHub's "Secret scanning" alerts are clear.