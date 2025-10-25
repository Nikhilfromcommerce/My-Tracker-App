import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  setLogLevel,
  getDoc
} from 'firebase/firestore';
import { 
  GlassWater, 
  BookOpen, 
  Activity,
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  LayoutDashboard, 
  BarChart3, 
  Sparkles, 
  Check, 
  Trash2, 
  Minus,
  CheckCircle2,
  Loader2,
  Droplet,
  Brain,
  MessageSquare,
  Timer,
  Lightbulb,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Palette,
  ImagePlus, // New Icon
  Send, // New Icon
  Globe, // New Icon
  Trophy, // New Challenge Icon
  Flag, // New Challenge Icon
  Bed, // New Icon
  Bike, // New Icon
  Dumbbell, // New Icon
  Target, // New Icon
  Smile, // New Icon
  Wind, // New Icon
  Notebook, // New Icon
  ArrowLeft // New Icon
} from 'lucide-react';

// --- (1) FIREBASE CONFIGURATION ---

// ❗ PASTE YOUR FIREBASE KEYS FROM STAGE 1 HERE ❗
const firebaseConfig = {
  apiKey: "AIzaSyAcl_LJnIEz690mljIvt5gLW9wtJKTYHek",
  authDomain: "mytrackerapp-5b1a2.firebaseapp.com",
  projectId: "mytrackerapp-5b1a2",
  storageBucket: "mytrackerapp-5b1a2.firebasestorage.app",
  messagingSenderId: "641014244679",
  appId: "1:641014244679:web:1c85b1fcf3037cf7fb9862"
};
// Add this line too, so the app doesn't break
const appId = firebaseConfig.appId;

// --- Icon Map ---
const ICONS = {
  GlassWater: <GlassWater className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />, 
  Droplet: <Droplet className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  MessageSquare: <MessageSquare className="w-5 h-5" />,
  Default: <Check className="w-5 h-5" />,
  Bed: <Bed className="w-5 h-5" />,
  Bike: <Bike className="w-5 h-5" />,
  Dumbbell: <Dumbbell className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Smile: <Smile className="w-5 h-5" />,
  Wind: <Wind className="w-5 h-5" />,
  Notebook: <Notebook className="w-5 h-5" />,
};

const ICON_NAMES = ['GlassWater', 'BookOpen', 'Activity', 'Droplet', 'Brain', 'MessageSquare', 'Bed', 'Bike', 'Dumbbell', 'Target', 'Smile', 'Wind', 'Notebook'];

// --- Utility Functions ---
const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};

const formatDate = (date) => {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0];
};

// --- Wallpaper/Theme Definitions ---
const WALLPAPERS = {
  default: 'bg-gray-50 dark:bg-gray-900',
  sky: 'bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-blue-900 dark:via-gray-900 dark:to-gray-900',
  forest: 'bg-gradient-to-br from-green-100 via-green-50 to-white dark:from-green-900 dark:via-gray-900 dark:to-gray-900',
  sunset: 'bg-gradient-to-br from-orange-100 via-red-50 to-white dark:from-orange-900 dark:via-gray-900 dark:to-gray-900',
  minimal: 'bg-white dark:bg-black',
  dawn: 'bg-gradient-to-br from-purple-100 via-pink-100 to-white dark:from-purple-900 dark:via-pink-900 dark:to-gray-900',
  mint: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-white dark:from-emerald-900 dark:via-teal-900 dark:to-gray-900',
};

// --- Helper Components ---

/**
 * A simple loading spinner
 */
const Spinner = () => (
  <div className="flex justify-center items-center p-4">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
  </div>
);

/**
 * A reusable Modal component
 */
const Modal = ({ isOpen, onClose, title, children, large = false }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 modal-backdrop-fade-in"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full ${large ? 'max-w-lg' : 'max-w-md'} p-6 overflow-y-auto max-h-[90vh] modal-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/**
 * A motivational message component
 */
const MotivationalMessage = () => {
  const messages = [
    "One habit at a time. You've got this!",
    "Consistency is the key to success.",
    "Don't break the chain!",
    "Every check-in is a step forward.",
    "Small progress is still progress.",
    "Believe in yourself and the process."
  ];

  const message = useMemo(() => messages[Math.floor(Math.random() * messages.length)], []);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-200 px-4 py-3 rounded-xl text-center">
      <p className="font-medium">{message}</p>
    </div>
  );
};

/**
 * Daily Quote Modal
 */
const DailyQuoteModal = ({ isOpen, onClose }) => {
  const [quote, setQuote] = useState({ text: "Loading quote...", author: "" });

  useEffect(() => {
    if (isOpen) {
      const quotes = [
        { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
        { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant" },
        { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
        { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
        { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" }
      ];
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quote of the Day">
      <div className="text-center">
        <p className="text-lg italic text-gray-800 dark:text-gray-100">"{quote.text}"</p>
        <p className="mt-4 font-medium text-gray-600 dark:text-gray-300">- {quote.author}</p>
        <button
          onClick={onClose}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all active:scale-95"
        >
          Start My Day
        </button>
      </div>
    </Modal>
  );
};

/**
 * Daily Challenge Card
 */
const DailyChallenge = () => {
  const todayISO = getTodayISO();
  const challengeStorageKey = `dailyChallengeText_${todayISO}`;
  const doneStorageKey = `dailyChallengeDone_${todayISO}`;

  const [challenge, setChallenge] = useState("Loading your challenge...");
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get a consistent challenge for the day
  useEffect(() => {
    const storedChallenge = localStorage.getItem(challengeStorageKey);
    const storedDone = localStorage.getItem(doneStorageKey);

    if (storedChallenge) {
      setChallenge(storedChallenge);
      if (storedDone) {
        setIsDone(true);
      }
    } else {
      // No challenge stored for today, fetch one
      fetchDailyChallenge();
    }
  }, [challengeStorageKey, doneStorageKey]);

  const fetchDailyChallenge = async () => {
    setIsLoading(true);
    const systemPrompt = "Act as a wellness coach. Generate one, and only one, short, actionable daily challenge (max 10 words). Example: 'Stretch for 5 minutes.' Do not include any other text, just the challenge.";
    const userQuery = "Give me a new daily challenge.";

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    };

    const apiKey = "AIzaSyBzDa6V3YA7jKpVcogzSkDOP674hdVp3Yg"; // API key is handled by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];
      
      if (candidate && candidate.content?.parts?.[0]?.text) {
        const text = candidate.content.parts[0].text.trim().replace(/"/g, ''); // Clean up response
        setChallenge(text);
        localStorage.setItem(challengeStorageKey, text);
      } else {
        throw new Error("Invalid response structure from API.");
      }
    } catch (e) {
      console.error("Error fetching daily challenge:", e);
      setChallenge("Take 3 deep breaths right now."); // Fallback
      localStorage.setItem(challengeStorageKey, "Take 3 deep breaths right now.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleComplete = () => {
    localStorage.setItem(doneStorageKey, 'true');
    setIsDone(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Daily Challenge</h3>
      {isLoading ? (
        <div className="flex justify-center items-center h-10">
          <Spinner />
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300 mb-3 h-10">{challenge}</p>
      )}
      <button
        onClick={handleComplete}
        disabled={isDone}
        className={`w-full font-medium py-2 px-4 rounded-lg transition-all ${
          isDone 
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
            : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
        }`}
      >
        {isDone ? 'Completed!' : 'Mark as Done'}
      </button>
    </div>
  );
};


// --- Core App Components ---

/**
 * Header: Navigation and User Info
 */
const Header = ({ currentView, setCurrentView, userId }) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'stats', name: 'Stats', icon: BarChart3 },
    { id: 'timer', name: 'Timer', icon: Timer },
    { id: 'inspiration', name: 'Inspiration', icon: Lightbulb },
    { id: 'ai', name: 'AI Coach', icon: Sparkles },
    { id: 'targets', name: 'Targets', icon: Trophy },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-4 sticky top-4 z-10">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          MindTrack
        </h1>
        {userId && (
          <div className="text-xs text-gray-400 mt-2 sm:mt-0">
            User ID: {userId}
          </div>
        )}
      </div>
      <nav className="mt-4">
        <div className="flex justify-center flex-wrap gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col sm:flex-row items-center justify-center space-x-0 sm:space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-all
                ${currentView === item.id 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <item.icon className="w-5 h-5 mb-1 sm:mb-0" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};

/**
 * Dashboard: Today's Habits
 */
const DashboardView = ({ habits, logs, db, userId, appId, todayISO }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [endOfDayModalOpen, setEndOfDayModalOpen] = useState(false);
  const todayLogs = useMemo(() => logs[todayISO] || {}, [logs, todayISO]);

  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [habits]);

  const handleHabitUpdate = async (habit, log, increment) => {
    if (!db || !userId) return;

    const newCompleted = (log ? log.completed : 0) + increment;
    if (newCompleted < 0) return; // Don't go below zero

    const logRefBase = collection(db, 'artifacts', appId, 'users', userId, 'habitLogs');

    try {
      if (log) {
        // Log exists, update it
        const logRef = doc(logRefBase, log.id);
        await updateDoc(logRef, {
          completed: newCompleted
        });
      } else if (increment > 0) {
        // No log, create one
        await addDoc(logRefBase, {
          habitId: habit.id,
          date: todayISO,
          completed: newCompleted,
          goal: habit.goal,
          habitName: habit.name, // Denormalize for easier queries
        });
      }
    } catch (e) {
      console.error("Error updating habit log: ", e);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!db || !userId) return;
    
    // Custom confirmation dialog logic
    const userConfirmed = await customConfirm(`Are you sure you want to delete this habit? This will also delete ALL associated logs.`);
    if (!userConfirmed) {
      return;
    }

    try {
      const batch = writeBatch(db);

      // 1. Delete the habit definition
      const habitRef = doc(db, 'artifacts', appId, 'users', userId, 'habits', habitId);
      batch.delete(habitRef);

      // 2. Query and delete all logs for this habit
      const logsQuery = query(
        collection(db, 'artifacts', appId, 'users', userId, 'habitLogs'),
        where("habitId", "==", habitId)
      );
      
      const logsSnapshot = await getDocs(logsQuery);
      logsSnapshot.forEach((logDoc) => {
        batch.delete(logDoc.ref);
      });

      // 3. Commit the batch
      await batch.commit();
      
    } catch (e) {
      console.error("Error deleting habit and its logs: ", e);
    }
  };

  const customConfirm = (message) => {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.id = 'custom-confirm-modal';
      container.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4';
      
      container.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
          <p class="text-gray-900 dark:text-white mb-4">${message}</p>
          <div class="flex justify-end space-x-3">
            <button id="confirm-cancel" class="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button id="confirm-ok" class="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">Delete</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(container);

      const cleanup = (result) => {
        document.body.removeChild(container);
        resolve(result);
      };

      document.getElementById('confirm-ok').onclick = () => cleanup(true);
      document.getElementById('confirm-cancel').onclick = () => cleanup(false);
      container.onclick = (e) => {
        if (e.target.id === 'custom-confirm-modal') {
          cleanup(false);
        }
      };
    });
  };

  const completedToday = useMemo(() => {
    return habits.filter(h => {
      const log = todayLogs[h.id];
      return log && log.completed >= h.goal;
    }).length;
  }, [habits, todayLogs]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Today's Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">{new Date(todayISO).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl flex items-center space-x-2 transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add Habit</span>
        </button>
      </div>

      <MotivationalMessage />
      
      <DailyChallenge />

      <div className="space-y-3">
        {habits.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10">
            <p>No habits yet. Click "Add Habit" to get started!</p>
          </div>
        )}
        {sortedHabits.map((habit) => {
          const log = todayLogs[habit.id];
          const completed = log ? log.completed : 0;
          const isGoalMet = completed >= habit.goal;
          
          return (
            <div 
              key={habit.id} 
              className={`bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md transition-all ${isGoalMet ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-300 dark:border-gray-600'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`p-2 rounded-full ${isGoalMet ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {ICONS[habit.icon] || ICONS.Default}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{habit.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Goal: {habit.goal} {habit.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isGoalMet && (
                     <CheckCircle2 className="w-7 h-7 text-green-500" />
                  )}
                  <span className="font-bold text-lg text-gray-900 dark:text-white w-12 text-right">
                    {completed}
                  </span>
                  <button
                    onClick={() => handleHabitUpdate(habit, log, -1)}
                    disabled={completed === 0}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded-full enabled:hover:bg-gray-300 dark:enabled:hover:bg-gray-600 disabled:opacity-50"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleHabitUpdate(habit, log, 1)}
                    disabled={isGoalMet}
                    className="bg-blue-600 text-white p-2 rounded-full enabled:hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                   <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {habits.length > 0 && (
        <button
          onClick={() => setEndOfDayModalOpen(true)}
          className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>End of Day Review</span>
        </button>
      )}

      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        db={db}
        userId={userId}
        appId={appId}
      />
      
      <Modal
        isOpen={endOfDayModalOpen}
        onClose={() => setEndOfDayModalOpen(false)}
        title="End of Day Review"
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold dark:text-white">
            Great job today!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            You completed <span className="font-bold">{completedToday}</span> out of <span className="font-bold">{habits.length}</span> habits.
          </p>
          <p className="mt-4 text-gray-800 dark:text-gray-100">
            {completedToday === habits.length ? "Amazing work! You hit all your goals!" : "Keep up the effort. Tomorrow is a new day!"}
          </p>
          <button
            onClick={() => setEndOfDayModalOpen(false)}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all active:scale-95"
          >
            Got it
          </button>
        </div>
      </Modal>
    </div>
  );
};

/**
 * Modal for Adding a New Habit
 */
const AddHabitModal = ({ isOpen, onClose, db, userId, appId }) => {
  const [step, setStep] = useState(1); // 1: Choice, 2: AI, 3: Manual
  const [slideDirection, setSlideDirection] = useState('right');
  const [fromAI, setFromAI] = useState(false);

  // Manual form state
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(1);
  const [unit, setUnit] = useState('times');
  const [icon, setIcon] = useState(ICON_NAMES[0]);
  const [error, setError] = useState('');

  // AI state
  const [vagueGoal, setVagueGoal] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedHabits, setSuggestedHabits] = useState([]);
  const [aiError, setAiError] = useState('');

  const handleClose = () => {
    // Reset manual form
    setName('');
    setGoal(1);
    setUnit('times');
    setIcon(ICON_NAMES[0]);
    setError('');
    // Reset AI form
    setVagueGoal('');
    setSuggestedHabits([]);
    setIsSuggesting(false);
    setAiError('');
    // Reset step state
    setTimeout(() => {
      setStep(1);
      setFromAI(false);
      setSlideDirection('right');
    }, 200); // Wait for modal close animation
    // Call parent onClose
    onClose();
  };

  const nextStep = (targetStep) => {
    setSlideDirection('right');
    setStep(targetStep);
  };

  const prevStep = (targetStep) => {
    setSlideDirection('left');
    setStep(targetStep);
  };
  
  const handleGoalBreakdown = async () => {
    if (!vagueGoal) {
      setAiError('Please enter a goal to break down.');
      return;
    }
    setIsSuggesting(true);
    setAiError('');
    setSuggestedHabits([]);

    const systemPrompt = "You are a helpful assistant that breaks down vague wellness goals into 3-5 concrete, actionable, and trackable daily habits. The user will provide a goal. You will return a JSON array of habit objects. Each object must have 'name' (string, e.g., 'Drink Water'), 'goal' (number, e.g., 8), and 'unit' (string, e.g., 'glasses').";
    const userQuery = `My goal is: "${vagueGoal}"`;
    
    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              goal: { type: "NUMBER" },
              unit: { type: "STRING" }
            },
            required: ["name", "goal", "unit"]
          }
        }
      }
    };

    const apiKey = "AIzaSyBzDa6V3YA7jKpVcogzSkDOP674hdVp3Yg"; // API key is handled by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];
      
      if (candidate && candidate.content?.parts?.[0]?.text) {
        const jsonText = candidate.content.parts[0].text;
        const parsedJson = JSON.parse(jsonText);
        setSuggestedHabits(parsedJson);
      } else {
        throw new Error("Invalid response structure from API.");
      }

    } catch (e) {
      console.error("Error breaking down goal: ", e);
      setAiError("Sorry, I couldn't generate suggestions. Please try again.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSelectSuggestion = (habit) => {
    setName(habit.name);
    setGoal(habit.goal);
    setUnit(habit.unit);
    // Auto-select an icon? For now, just scroll to form
    setFromAI(true);
    nextStep(3); // Go to manual form, pre-filled
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || goal < 1) {
      setError('Please fill in a valid name and goal (at least 1).');
      return;
    }
    if (!db || !userId) {
      setError('Database not ready. Please try again.');
      return;
    }

    try {
      const habitsCollection = collection(db, 'artifacts', appId, 'users', userId, 'habits');
      await addDoc(habitsCollection, {
        name,
        goal: Number(goal),
        unit,
        icon,
        createdAt: new Date().toISOString(),
      });
      // Reset form and close
      handleClose();
    } catch (e) {
      console.error("Error adding habit: ", e);
      setError('Failed to add habit. Please try again.');
    }
  };

  const renderStep = () => {
    const animationClass = slideDirection === 'right' ? 'slide-in-from-right' : 'slide-in-from-left';

    switch (step) {
      // Step 1: Choose AI or Manual
      case 1:
        return (
          <div key={1} className={`space-y-4 ${animationClass}`}>
            <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-white mb-3">How would you like to add?</h3>
            <button
              onClick={() => nextStep(2)}
              className="w-full text-left p-6 bg-purple-50 dark:bg-purple-900/40 rounded-2xl border border-purple-200 dark:border-purple-700 hover:border-purple-400 transition-all hover:shadow-lg"
            >
              <h4 className="text-lg font-bold text-purple-700 dark:text-purple-300 flex items-center"><Sparkles className="w-5 h-5 mr-2" /> AI Quick Add</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Tell us a goal like "reduce stress" and let AI create habits for you.</p>
            </button>
            <button
              onClick={() => nextStep(3)}
              className="w-full text-left p-6 bg-blue-50 dark:bg-blue-900/40 rounded-2xl border border-blue-200 dark:border-blue-700 hover:border-blue-400 transition-all hover:shadow-lg"
            >
              <h4 className="text-lg font-bold text-blue-700 dark:text-blue-300 flex items-center"><Check className="w-5 h-5 mr-2" /> Create Manually</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Set up your own habit, goal, and icon from scratch.</p>
            </button>
          </div>
        );
      
      // Step 2: AI Flow
      case 2:
        return (
          <div key={2} className={`${animationClass}`}>
            <button onClick={() => prevStep(1)} className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">✨ Let AI Help You Start</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Have a general goal like "be healthier" or "reduce stress"? Type it here.
              </p>
              {aiError && <p className="text-red-500 text-sm">{aiError}</p>}
              <textarea
                value={vagueGoal}
                onChange={(e) => setVagueGoal(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Be more mindful"
                rows="2"
              />
              <button
                type="button"
                onClick={handleGoalBreakdown}
                disabled={isSuggesting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSuggesting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                <span>{isSuggesting ? 'Thinking...' : 'Breakdown Goal'}</span>
              </button>

              {suggestedHabits.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-semibold dark:text-white">Suggestions (click to add):</h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestedHabits.map((habit, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => handleSelectSuggestion(habit)}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        {habit.name} ({habit.goal} {habit.unit})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // Step 3: Manual Form
      case 3:
        return (
          <div key={3} className={`${animationClass}`}>
            <button onClick={() => prevStep(fromAI ? 2 : 1)} className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{fromAI ? 'Confirm Your New Habit' : 'Create Manually'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Drink Water"
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Daily Goal
                  </label>
                  <input
                    type="number"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    min="1"
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., glasses, pages"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {ICON_NAMES.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      className={`p-3 rounded-lg border-2 aspect-square flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                        icon === iconName 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                        : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {ICONS[iconName]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all active:scale-95"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 1 ? "Add New Habit" : " "} large={true}>
      <div className="overflow-x-hidden">
        {renderStep()}
      </div>
    </Modal>
  );
};

/**
 * Calendar View: Monthly Progress
 */
const CalendarView = ({ logs, habits }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ...

  const blanks = Array(startingDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const totalHabits = habits.length;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button 
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-medium text-gray-500 dark:text-gray-400 text-sm mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(day => {
          const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayISO = formatDate(dayDate);
          const dayLogs = logs[dayISO] || {};
          
          let completedCount = 0;
          if (totalHabits > 0) {
            completedCount = Object.values(dayLogs).filter(log => log.completed >= log.goal).length;
          }
          
          const isToday = dayISO === getTodayISO();
          const completionRate = totalHabits > 0 ? (completedCount / totalHabits) : 0;
          
          let bgColor = 'bg-gray-50 dark:bg-gray-700';
          if (completionRate > 0) bgColor = 'bg-blue-100 dark:bg-blue-900/40';
          if (completionRate > 0.5) bgColor = 'bg-blue-300 dark:bg-blue-900/60';
          if (completionRate === 1 && totalHabits > 0) bgColor = 'bg-green-400 dark:bg-green-700';
          if (isToday) bgColor = 'bg-blue-500 dark:bg-blue-500';
          
          return (
            <div 
              key={day}
              className={`h-16 sm:h-20 rounded-lg ${bgColor} p-1.5 text-left transition-all
                ${isToday ? 'ring-2 ring-blue-600 dark:ring-blue-300' : ''}
              `}
            >
              <span className={`font-bold ${isToday ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{day}</span>
              {totalHabits > 0 && (
                <div className="text-xs font-medium text-center mt-2">
                  <span className={`${isToday ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {completedCount}/{totalHabits}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Stats View: Streaks and Trends
 */
const StatsView = ({ logs, habits }) => {
  const streaks = useMemo(() => {
    if (habits.length === 0) return [];

    return habits.map(habit => {
      let currentStreak = 0;
      let d = new Date();
      let dateISO = formatDate(d);
      
      while (true) {
        const log = logs[dateISO]?.[habit.id];
        if (log && log.completed >= habit.goal) {
          currentStreak++;
          d.setDate(d.getDate() - 1);
          dateISO = formatDate(d);
        } else {
          // Allow for one missed day *if* it's today and not yet completed
          if (currentStreak > 0 && dateISO === getTodayISO()) {
             d.setDate(d.getDate() - 1);
             dateISO = formatDate(d);
             const yesterdayLog = logs[dateISO]?.[habit.id];
             if (yesterdayLog && yesterdayLog.completed >= habit.goal) {
               // Today is not done, but yesterday was. Streak holds.
             } else {
               // Missed today, and yesterday. Break.
               // Or, just missed yesterday. Break.
               break;
             }
          } else {
            break;
          }
        }
      }

      return {
        id: habit.id,
        name: habit.name,
        streak: currentStreak,
      };
    }).sort((a, b) => b.streak - a.streak);
  }, [logs, habits]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Your Streaks</h2>
      {habits.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Track some habits to see your streaks!</p>
      ) : (
        <div className="space-y-3">
          {streaks.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {item.streak} day{item.streak !== 1 ? 's' : ''} 🔥
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * AI Suggestions View
 */
const AISuggestions = ({ habits }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const getSuggestions = async () => {
    setIsLoading(true);
    setError('');
    setSuggestions([]);

    const habitNames = habits.map(h => h.name).join(', ') || 'none';
    const systemPrompt = "Act as a friendly, encouraging wellness coach. Your goal is to suggest 3 new, simple, and actionable habits. Provide the habit name and a one-sentence reason why it's beneficial. Format the response as a valid JSON array.";
    const userQuery = `I am currently tracking these habits: ${habitNames}. Based on this, suggest 3 new habits I could add to my routine.`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              reason: { type: "STRING" },
            },
            required: ["name", "reason"]
          }
        }
      }
    };

    const apiKey = "AIzaSyBzDa6V3YA7jKpVcogzSkDOP674hdVp3Yg"; // API key is handled by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      const candidate = result.candidates?.[0];
      if (candidate && candidate.content?.parts?.[0]?.text) {
        const jsonText = candidate.content.parts[0].text;
        const parsedJson = JSON.parse(jsonText);
        setSuggestions(parsedJson);
      } else {
        throw new Error("Invalid response structure from API.");
      }

    } catch (e) {
      console.error("Error getting AI suggestions: ", e);
      setError("Sorry, I couldn't fetch suggestions right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">AI Habit Coach</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Feeling stuck? Get some new ideas from your AI coach based on your current habits.
      </p>
      <button
        onClick={getSuggestions}
        disabled={isLoading}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
        <span>{isLoading ? 'Thinking...' : 'Suggest New Habits'}</span>
      </button>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      {suggestions.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold dark:text-white">Here are a few ideas:</h3>
          {suggestions.map((item, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
              <p className="text-gray-700 dark:text-gray-300">{item.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Timer View
 */
const TimerView = () => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(minutes * 60);

  useEffect(() => {
    let interval = null;
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(s => s - 1);
        } else if (minutes > 0) {
          setMinutes(m => m - 1);
          setSeconds(59);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    } else if (isActive && minutes === 0 && seconds === 0) {
      clearInterval(interval);
      setIsActive(false);
      // Optional: Play a sound
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const toggle = () => {
    if (minutes === 0 && seconds === 0) {
      reset();
    }
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setMinutes(Math.floor(totalSeconds / 60));
    setSeconds(totalSeconds % 60);
  };

  const handleMinutesChange = (e) => {
    const newMins = parseInt(e.target.value, 10);
    if (!isNaN(newMins) && newMins >= 0) {
      if (!isActive) {
        setTotalSeconds(newMins * 60);
        setMinutes(newMins);
        setSeconds(0);
      }
    }
  };

  const setPreset = (mins) => {
    if (!isActive) {
      setTotalSeconds(mins * 60);
      setMinutes(mins);
      setSeconds(0);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Focus Timer</h2>
      
      <div className="my-6">
        <span className="text-8xl font-bold tabular-nums text-gray-900 dark:text-white">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="mb-6 flex justify-center space-x-2">
        <button onClick={() => setPreset(5)} className={`px-3 py-1 rounded-lg ${totalSeconds === 300 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>5 min</button>
        <button onClick={() => setPreset(10)} className={`px-3 py-1 rounded-lg ${totalSeconds === 600 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>10 min</button>
        <button onClick={() => setPreset(25)} className={`px-3 py-1 rounded-lg ${totalSeconds === 1500 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>25 min</button>
      </div>

      <div className="flex justify-center items-center space-x-4">
        <button 
          onClick={toggle}
          className={`p-4 rounded-full text-white ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>
        <button 
          onClick={reset}
          className="p-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <RotateCcw className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

/**
 * Inspiration View
 */
const InspirationView = ({ db, userId, appId }) => {
  const [userStories, setUserStories] = useState([]);
  const [storyName, setStoryName] = useState('');
  const [storyText, setStoryText] = useState('');
  const [storyImageUrl, setStoryImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Listener for user-submitted stories
  useEffect(() => {
    if (!db) return;
    // This collection is public, as per instructions for collaboration
    const storiesCollection = collection(db, 'artifacts', appId, 'public/data/userStories');
    const q = query(storiesCollection);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory by creation date, newest first
      stories.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setUserStories(stories);
    }, (err) => {
      console.error("Error fetching stories:", err);
      setError("Could not load community stories.");
    });
    
    return () => unsubscribe();
  }, [db, appId]);

  const handleSubmitStory = async (e) => {
    e.preventDefault();
    if (!storyName || !storyText) {
      setError("Please fill in a name and story.");
      return;
    }
    if (!db || !userId) {
      setError("Database not connected.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const storiesCollection = collection(db, 'artifacts', appId, 'public/data/userStories');
      await addDoc(storiesCollection, {
        name: storyName,
        text: storyText,
        imageUrl: storyImageUrl || null,
        submittedBy: userId,
        createdAt: new Date(),
      });
      // Clear form
      setStoryName('');
      setStoryText('');
      setStoryImageUrl('');
    } catch (err) {
      console.error(err);
      setError("Failed to submit story. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const placeholderImg = (e) => {
    e.target.src = 'https://placehold.co/400x300/666/fff?text=No+Image';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Inspiration</h2>
        <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">Why Build Habits?</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Small, consistent actions are the building blocks of significant change. When you focus on building good habits, you're not just chasing a goal; you're redesigning your identity. You become the person who reads, who exercises, who meditates. The goal isn't to run a marathon, but to become a runner. Your habits shape your future.
        </p>
      </section>
      
      <section>
        <h3 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Stories of Consistency</h3>
        <div className="space-y-6">
          <InspirationStory
            imgSrc="https://placehold.co/400x300/F97316/FFF?text=Sridhar+Vembu"
            imgAlt="Sridhar Vembu"
            name="Sridhar Vembu & Zoho"
            text="Sridhar Vembu, founder of Zoho Corporation, is a prime example of consistency and long-term vision. He famously built his multi-billion dollar software company from a small village in Tamil Nadu, India, completely bootstrapped and without external funding. His habit of focusing on R&D, employee well-being, and rural empowerment, practiced over decades, built a resilient and unique global tech giant."
          />
          <InspirationStory
            imgSrc="https://placehold.co/400x300/EC4899/FFF?text=Kiran+Mazumdar-Shaw"
            imgAlt="Kiran Mazumdar-Shaw"
            name="Kiran Mazumdar-Shaw & Biocon"
            text="Kiran Mazumdar-Shaw started Biocon in 1978 in her garage in Bangalore with just 10,000 rupees. Facing credibility challenges as a woman in a male-dominated industry, she built her biotechnology empire through a relentless daily habit of scientific inquiry and perseverance. Her consistency transformed Biocon from an enzyme manufacturer into India's largest biopharmaceutical company."
          />
          <InspirationStory
            imgSrc="https://placehold.co/400x300/22C55E/FFF?text=Haruki+Murakami"
            imgAlt="Haruki Murakami"
            name="Haruki Murakami & Running"
            text="The famous novelist is also a dedicated marathon runner. He writes, 'For me, running is both exercise and a metaphor. Running day after day, piling up the races, bit by bit I raise the bar, and by clearing each level I elevate myself.' His writing discipline is fueled by his daily physical discipline."
          />
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Community Inspiration</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Share a story of someone who inspires you!</p>
        
        <form onSubmit={handleSubmitStory} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input
            type="text"
            value={storyName}
            onChange={(e) => setStoryName(e.target.value)}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Name of the person"
          />
          <textarea
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Their story of consistency or success..."
            rows="3"
          />
          <input
            type="text"
            value={storyImageUrl}
            onChange={(e) => setStoryImageUrl(e.target.value)}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
            placeholder="Optional: Image URL"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            <span>Submit Story</span>
          </button>
        </form>

        <div className="mt-6 space-y-4">
          {userStories.length === 0 && !isLoading && (
            <p className="text-center text-gray-500 dark:text-gray-400">Be the first to share an inspiring story!</p>
          )}
          {userStories.map(story => (
            <InspirationStory
              key={story.id}
              imgSrc={story.imageUrl}
              imgAlt={story.name}
              name={story.name}
              text={story.text}
              isCommunity={true}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

const InspirationStory = ({ imgSrc, imgAlt, name, text, isCommunity = false }) => {
  const placeholderImg = (e) => {
    e.target.src = `https://placehold.co/400x300/666/fff?text=${encodeURIComponent(imgAlt)}`;
    e.target.onerror = null; // prevent infinite loops
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-hidden flex flex-col sm:flex-row gap-4">
      <img
        src={imgSrc || `https://placehold.co/400x300/666/fff?text=${encodeURIComponent(imgAlt)}`}
        alt={imgAlt}
        onError={placeholderImg}
        className="w-full sm:w-1/3 h-48 sm:h-auto object-cover rounded-md"
        loading="lazy"
      />
      <div className="w-full sm:w-2/3">
        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{name}</h4>
        {isCommunity && <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Community</span>}
        <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}

/**
 * Settings View
 */
const SettingsView = ({ db, userId, appId, currentSettings }) => {
  const [selectedPreset, setSelectedPreset] = useState(currentSettings.wallpaperPreset || 'default');
  const [customUrl, setCustomUrl] = useState(currentSettings.customUrl || '');
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error'

  // Sync state with props when settings change (e.g., after loading)
  useEffect(() => {
    setSelectedPreset(currentSettings.wallpaperPreset || 'default');
    setCustomUrl(currentSettings.customUrl || '');
  }, [currentSettings]);

  const handleSave = async () => {
    if (!db || !userId) return;
    setSaveStatus('saving');
    const settingsRef = doc(db, 'artifacts', appId, 'users', userId, 'settings', 'userSettings');
    try {
      await setDoc(settingsRef, { 
        wallpaperPreset: selectedPreset,
        customUrl: customUrl
      }, { merge: true });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) {
      console.error("Error saving settings: ", e);
      setSaveStatus('error');
    }
  };
  
  const handlePresetSelect = (key) => {
    setSelectedPreset(key);
    setCustomUrl(''); // Clear custom URL when selecting a preset
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Settings</h2>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">App Wallpaper</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-3">Choose a preset theme.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(WALLPAPERS).map(([key, className]) => (
              <button
                key={key}
                onClick={() => handlePresetSelect(key)}
                className={`h-24 rounded-lg border-4 ${
                  selectedPreset === key && !customUrl ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 dark:border-gray-700'
                } ${className} transition-all relative`}
              >
                <span className="capitalize font-medium bg-black/30 text-white px-2 py-0.5 rounded text-sm">
                  {key}
                </span>
                {selectedPreset === key && !customUrl && (
                  <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">Custom Wallpaper</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-3">Or paste an image URL from the web.</p>
          <div className="flex space-x-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-grow rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
              placeholder="https://images.unsplash.com/..."
            />
            {customUrl && (
              <button
                onClick={() => setCustomUrl('')}
                className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </section>
        
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {saveStatus === 'saving' && <Loader2 className="w-5 h-5 animate-spin" />}
          {saveStatus === 'saved' && <CheckCircle2 className="w-5 h-5" />}
          {saveStatus === 'error' && <X className="w-5 h-5" />}
          {saveStatus === '' && <span>Save Settings</span>}
          {saveStatus === 'saving' && <span>Saving...</span>}
          {saveStatus === 'saved' && <span>Saved!</span>}
          {saveStatus === 'error' && <span>Error! Try Again.</span>}
        </button>
      </div>
    </div>
  );
};

/**
 * Target Challenge View
 */
const TargetView = ({ db, userId, appId, activeChallenge, logs, habits }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChallenge = async (days) => {
    if (!db || !userId) return;
    setIsLoading(true);
    try {
      const challengeCollection = collection(db, 'artifacts', appId, 'users', userId, 'challenges');
      await addDoc(challengeCollection, {
        name: `${days} Day Challenge`,
        totalDays: days,
        startDate: getTodayISO(),
        isActive: true,
      });
      // Listener in App component will handle state update
    } catch (e) {
      console.error("Error starting challenge:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelChallenge = async () => {
    if (!db || !userId || !activeChallenge) return;
    
    const userConfirmed = await customConfirm(`Are you sure you want to cancel this challenge? This cannot be undone.`);
    if (!userConfirmed) return;

    setIsLoading(true);
    try {
      const challengeRef = doc(db, 'artifacts', appId, 'users', userId, 'challenges', activeChallenge.id);
      await updateDoc(challengeRef, { isActive: false });
      // Listener in App component will handle state update
    } catch (e) {
      console.error("Error canceling challenge:", e);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Custom confirmation for challenge cancellation
  const customConfirm = (message) => {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.id = 'custom-confirm-modal';
      container.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4';
      
      container.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
          <p class="text-gray-900 dark:text-white mb-4">${message}</p>
          <div class="flex justify-end space-x-3">
            <button id="confirm-cancel" class="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button id="confirm-ok" class="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">Yes, Cancel</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(container);

      const cleanup = (result) => {
        document.body.removeChild(container);
        resolve(result);
      };

      document.getElementById('confirm-ok').onclick = () => cleanup(true);
      document.getElementById('confirm-cancel').onclick = () => cleanup(false);
      container.onclick = (e) => {
        if (e.target.id === 'custom-confirm-modal') {
          cleanup(false);
        }
      };
    });
  };

  if (activeChallenge) {
    return (
      <ActiveChallengeDisplay 
        challenge={activeChallenge} 
        logs={logs} 
        habits={habits} 
        onCancel={handleCancelChallenge}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Start a New Challenge</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Commit to completing 100% of your daily habits for a set period.
      </p>
      <div className="space-y-4">
        <button
          onClick={() => handleStartChallenge(30)}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Flag className="w-5 h-5" />
          <span>Start 30 Day Challenge</span>
        </button>
        <button
          onClick={() => handleStartChallenge(75)}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Flag className="w-5 h-5" />
          <span>Start 75 Day Challenge</span>
        </button>
        <button
          onClick={() => handleStartChallenge(90)}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <Flag className="w-5 h-5" />
          <span>Start 90 Day Challenge</span>
        </button>
      </div>
    </div>
  );
};

const ActiveChallengeDisplay = ({ challenge, logs, habits, onCancel, isLoading }) => {
  const { name, totalDays, startDate } = challenge;
  
  const startDateObj = useMemo(() => {
    const [year, month, day] = startDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  }, [startDate]);
  
  const today = useMemo(() => new Date(), []);
  
  const todayISO = getTodayISO();
  
  const challengeDays = useMemo(() => {
    const days = [];
    const habitsCount = habits.length;
    
    // Calculate current day number
    const diffTime = Math.abs(today.setHours(0,0,0,0) - startDateObj.getTime());
    const currentDayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(startDateObj.getTime());
      dayDate.setDate(startDateObj.getDate() + i - 1);
      const dayISO = formatDate(dayDate);
      
      const dayLogs = logs[dayISO] || {};
      const completedCount = Object.values(dayLogs).filter(log => log.completed >= log.goal).length;
      
      const isComplete = habitsCount > 0 && completedCount === habitsCount;
      const isToday = dayISO === todayISO;
      const isPast = dayDate < today.setHours(0,0,0,0);
      
      let status = 'future'; // future
      if (isComplete) status = 'complete'; // complete
      else if (isToday) status = 'today'; // today
      else if (isPast) status = 'missed'; // missed
      
      days.push({
        day: i,
        status: status
      });
    }
    return { days, currentDayNumber };
  }, [totalDays, startDateObj, logs, habits, today, todayISO]);

  const completedDays = challengeDays.days.filter(d => d.status === 'complete').length;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 dark:text-white">{name}</h2>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            Day {challengeDays.currentDayNumber > totalDays ? totalDays : challengeDays.currentDayNumber} of {totalDays}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            You've completed {completedDays} / {totalDays} days so far.
          </p>
        </div>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-lg flex items-center space-x-1 text-sm disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
      
      <div className={`grid gap-2 ${totalDays === 30 ? 'grid-cols-6' : (totalDays === 75 ? 'grid-cols-10' : 'grid-cols-10')}`}>
        {challengeDays.days.map(({ day, status }) => {
          let colorClass = 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500';
          if (status === 'complete') colorClass = 'bg-green-500 text-white';
          if (status === 'missed') colorClass = 'bg-red-400 text-white';
          if (status === 'today') colorClass = 'bg-blue-500 text-white ring-2 ring-blue-300';
          
          return (
            <div 
              key={day}
              className={`w-full aspect-square rounded-lg flex items-center justify-center font-bold text-sm ${colorClass} ${totalDays > 75 ? 'text-xs' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};


/**
 * Main App Component
 */
export default function App() {
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({}); // { 'YYYY-MM-DD': { habitId: logData } }
  const [activeChallenge, setActiveChallenge] = useState(null); // New state for challenge
  const [settings, setSettings] = useState({ wallpaperPreset: 'default', customUrl: '' });
  const [appWallpaperClass, setAppWallpaperClass] = useState(WALLPAPERS.default);
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState('');
  
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'calendar', 'stats', 'ai', 'timer', 'inspiration', 'settings'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const todayISO = useMemo(() => getTodayISO(), []);

  // 1. Check for Daily Quote Modal
  useEffect(() => {
    const lastShown = localStorage.getItem('lastQuoteShownDate');
    if (lastShown !== todayISO) {
      setIsQuoteModalOpen(true);
      localStorage.setItem('lastQuoteShownDate', todayISO);
    }
  }, [todayISO]);

  // 2. Initialize Firebase and Auth
  useEffect(() => {
    try {
      // Use the firebaseConfig you pasted in Step 1
      if (firebaseConfig && firebaseConfig.apiKey) { 
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setLogLevel('debug');
        setAuth(authInstance);
        setDb(dbInstance);

        const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
          if (user) {
            // User is already signed in
            setUserId(user.uid);
            setIsAuthReady(true);
          } else {
            // User is signed out, sign them in anonymously
            try {
              const userCredential = await signInAnonymously(authInstance);
              setUserId(userCredential.user.uid);
              setIsAuthReady(true);
            } catch (authError) {
              console.error("Error signing in anonymously: ", authError);
              setError("Failed to authenticate. Please refresh.");
            }
          }
        });
        return () => unsubscribe(); // Cleanup on unmount
      } else {
        setError("Firebase config is missing or invalid.");
        setIsLoading(false);
      }
    } catch (e) {
      console.error("Error initializing Firebase: ", e);
      setError("Failed to load app. Invalid Firebase configuration.");
      setIsLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once

  // 3. Inject Custom CSS Animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .view-fade-in {
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .modal-scale-in {
        animation: scaleIn 0.2s ease-out;
      }
      
      @keyframes backdropFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .modal-backdrop-fade-in {
        animation: backdropFadeIn 0.2s ease-out;
      }

      @keyframes slideInFromRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .slide-in-from-right {
        animation: slideInFromRight 0.2s ease-out;
      }

      @keyframes slideInFromLeft {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .slide-in-from-left {
        animation: slideInFromLeft 0.2s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 4. Set up Firestore listeners once auth is ready
  useEffect(() => {
    if (!isAuthReady || !db || !userId) {
      if (isAuthReady) {
        setIsLoading(false); // Auth is ready, but no DB/UserID, stop loading
      }
      return;
    }

    setIsLoading(true);
    setError('');

    // --- Habits Listener ---
    const habitsCollection = collection(db, 'artifacts', appId, 'users', userId, 'habits');
    const habitsQuery = query(habitsCollection);
    const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHabits(habitsData);
      setIsLoading(false); // Stop loading after first data fetch
    }, (err) => {
      console.error("Error fetching habits: ", err);
      setError("Failed to load habits.");
      setIsLoading(false);
    });

    // --- Logs Listener ---
    const logsCollection = collection(db, 'artifacts', appId, 'users', userId, 'habitLogs');
    const logsQuery = query(logsCollection); // Note: For real apps, you'd paginate or limit by date
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = data.date;
        if (!logsData[date]) {
          logsData[date] = {};
        }
        logsData[date][data.habitId] = {
          id: doc.id,
          ...data,
        };
      });
      setLogs(logsData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching logs: ", err);
      setError("Failed to load logs.");
      setIsLoading(false);
    });

    // --- Settings Listener ---
    const settingsRef = doc(db, 'artifacts', appId, 'users', userId, 'settings', 'userSettings');
    const unsubscribeSettings = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const newSettings = doc.data();
        setSettings(newSettings);
        setAppWallpaperClass(WALLPAPERS[newSettings.wallpaperPreset] || WALLPAPERS.default);
        setCustomWallpaperUrl(newSettings.customUrl || '');
      } else {
        // No settings doc, use default
        setAppWallpaperClass(WALLPAPERS.default);
        setCustomWallpaperUrl('');
      }
    }, (err) => {
      console.error("Error fetching settings: ", err);
      // Don't set an error, just use defaults
    });
    
    // --- Active Challenge Listener ---
    const challengeCollection = collection(db, 'artifacts', appId, 'users', userId, 'challenges');
    const challengeQuery = query(challengeCollection, where("isActive", "==", true));
    const unsubscribeChallenge = onSnapshot(challengeQuery, (snapshot) => {
      if (!snapshot.empty) {
        const challengeData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0];
        setActiveChallenge(challengeData);
      } else {
        setActiveChallenge(null);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching challenge: ", err);
      // Don't set error, just means no challenge
      setIsLoading(false);
    });

    return () => {
      unsubscribeHabits();
      unsubscribeLogs();
      unsubscribeSettings();
      unsubscribeChallenge();
    };
  }, [isAuthReady, db, userId]);
  
  // Render logic
  const renderView = () => {
    if (isLoading && !isAuthReady) { // Only show main spinner on initial auth
      return <Spinner />;
    }
    
    switch (currentView) {
      case 'dashboard':
        return <DashboardView habits={habits} logs={logs} db={db} userId={userId} appId={appId} todayISO={todayISO} />;
      case 'calendar':
        return <CalendarView logs={logs} habits={habits} />;
      case 'stats':
        return <StatsView logs={logs} habits={habits} />;
      case 'ai':
        return <AISuggestions habits={habits} />;
      case 'timer':
        return <TimerView />;
      case 'inspiration':
        return <InspirationView db={db} userId={userId} appId={appId} />;
      case 'targets': // New case
        return <TargetView 
                  db={db} 
                  userId={userId} 
                  appId={appId} 
                  activeChallenge={activeChallenge} 
                  logs={logs} 
                  habits={habits} 
                />;
      case 'settings':
        return <SettingsView db={db} userId={userId} appId={appId} currentSettings={settings} />;
      default:
        return <DashboardView habits={habits} logs={logs} db={db} userId={userId} appId={appId} todayISO={todayISO} />;
    }
  };

  return (
    <div 
      className={`min-h-screen text-gray-900 dark:text-white transition-colors duration-500 ${customWallpaperUrl ? '' : appWallpaperClass}`}
      style={customWallpaperUrl ? { 
        backgroundImage: `url(${customWallpaperUrl})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : {}}
    >
      <div className={`min-h-screen p-4 sm:p-6 ${customWallpaperUrl ? 'bg-black/30 backdrop-blur-sm' : 'bg-transparent'}`}>
        <div className="max-w-3xl mx-auto space-y-4">
          <Header 
            currentView={currentView}
            setCurrentView={setCurrentView}
            userId={userId}
          />
          
          <DailyQuoteModal 
            isOpen={isQuoteModalOpen} 
            onClose={() => setIsQuoteModalOpen(false)} 
          />
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          <main key={currentView} className="view-fade-in">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  );
}




