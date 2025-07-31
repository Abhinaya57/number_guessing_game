"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [rangeSet, setRangeSet] = useState(false);
  const [guess, setGuess] = useState("");
  const [randomNumber, setRandomNumber] = useState(null);
  const [message, setMessage] = useState("");
  const [guessCount, setGuessCount] = useState(0);
  const [maxChances, setMaxChances] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [lastGameResult, setLastGameResult] = useState("");
  const [showStatsMenu, setShowStatsMenu] = useState(false);

  const [bgMusicOn, setBgMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);

  // Audio refs
  const bgMusicRef = useRef(null);
  const clickRef = useRef(null);
  const correctRef = useRef(null);
  const wrongRef = useRef(null);
  const resetRef = useRef(null);
  const startRef = useRef(null);

  function generateRandomNumber(minVal, maxVal) {
    return Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
  }

  function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  useEffect(() => {
    const w = parseInt(localStorage.getItem("wins")) || 0;
    const l = parseInt(localStorage.getItem("losses")) || 0;
    const c = parseInt(localStorage.getItem("currentStreak")) || 0;
    const b = parseInt(localStorage.getItem("bestStreak")) || 0;
    const bgPref = localStorage.getItem("bgMusicOn") === "false" ? false : true;
    const sfxPref = localStorage.getItem("sfxOn") === "false" ? false : true;

    setWins(w);
    setLosses(l);
    setCurrentStreak(c);
    setBestStreak(b);
    setBgMusicOn(bgPref);
    setSfxOn(sfxPref);

    if (bgPref && bgMusicRef.current) {
      bgMusicRef.current.volume = 1;
      bgMusicRef.current.loop = true;
      bgMusicRef.current.play().catch(() => {});
    }
  }, []);

  const startGame = () => {
    const minVal = parseInt(min);
    const maxVal = parseInt(max);
    if (isNaN(minVal) || isNaN(maxVal)) {
      setMessage("Please enter valid min and max numbers.");
      return;
    }
    if (minVal >= maxVal) {
      setMessage("Min should be less than Max.");
      return;
    }
    const chances = Math.ceil(Math.log2(maxVal - minVal + 1));
    setRandomNumber(generateRandomNumber(minVal, maxVal));
    setGuess("");
    setGuessCount(0);
    setMaxChances(chances);
    setMessage(`Game started! Guess a number between ${minVal} and ${maxVal}. You have ${chances} chances.`);
    setRangeSet(true);
    sfxOn && startRef.current?.play();
    if (bgMusicOn && bgMusicRef.current) {
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play().catch(() => {});
    }
  };

  const handleGuess = () => {
    sfxOn && clickRef.current?.play();
    const userGuess = parseInt(guess);
    if (!rangeSet) return;
    if (isNaN(userGuess)) {
      setMessage("Please enter a valid number!");
      return;
    }
    setGuessCount((prev) => prev + 1);

    if (userGuess === randomNumber) {
      sfxOn && correctRef.current?.play();
      const newWins = wins + 1;
      const newStreak = currentStreak + 1;
      const newBest = Math.max(bestStreak, newStreak);
      setWins(newWins);
      setCurrentStreak(newStreak);
      setBestStreak(newBest);
      localStorage.setItem("wins", newWins.toString());
      localStorage.setItem("currentStreak", newStreak.toString());
      localStorage.setItem("bestStreak", newBest.toString());
      setMessage(`🎉 ${userGuess} is correct! You guessed it in your ${guessCount + 1}${getOrdinal(guessCount + 1)} guess!`);
      setLastGameResult("win");
      setRangeSet(false);
      setShowSummary(true);
    } else {
      sfxOn && wrongRef.current?.play();
      if (guessCount + 1 >= maxChances) {
        const newLosses = losses + 1;
        setLosses(newLosses);
        setCurrentStreak(0);
        localStorage.setItem("losses", newLosses.toString());
        localStorage.setItem("currentStreak", "0");
        setMessage(`❌ ${userGuess} is incorrect! You've used all ${maxChances} chances. The number was ${randomNumber}.`);
        setLastGameResult("loss");
        setRangeSet(false);
        setShowSummary(true);
      } else {
        setMessage(`${userGuess} is too ${userGuess < randomNumber ? "low" : "high"}! Try again. (${maxChances - (guessCount + 1)} left)`);
      }
    }
  };

  const resetGame = () => {
    sfxOn && resetRef.current?.play();
    setMin("");
    setMax("");
    setGuess("");
    setRandomNumber(null);
    setGuessCount(0);
    setMaxChances(0);
    setMessage("");
    setRangeSet(false);
  };

  const toggleBgMusic = () => {
    const newState = !bgMusicOn;
    setBgMusicOn(newState);
    localStorage.setItem("bgMusicOn", newState.toString());
    if (!newState) {
      bgMusicRef.current?.pause();
    } else {
      bgMusicRef.current?.play().catch(() => {});
    }
  };

  const toggleSfx = () => {
    const newState = !sfxOn;
    setSfxOn(newState);
    localStorage.setItem("sfxOn", newState.toString());
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 relative">
      {/* Audio Elements */}
      <audio ref={bgMusicRef} src="/sounds/background.mp3" />
      <audio ref={clickRef} src="/sounds/click.mp3" />
      <audio ref={correctRef} src="/sounds/correct.mp3" />
      <audio ref={wrongRef} src="/sounds/wrong.mp3" />
      <audio ref={resetRef} src="/sounds/reset.mp3" />
      <audio ref={startRef} src="/sounds/start.mp3" />

      {/* Menu Icon */}
      <button
        onClick={() => setShowStatsMenu((prev) => !prev)}
        className="absolute top-4 right-4 text-3xl text-white hover:text-yellow-400"
        title="Show Stats"
      >
        ☰
      </button>

      {/* Stats Menu + Audio Toggles */}
      {showStatsMenu && (
        <div className="absolute top-16 right-4 bg-gray-800 border border-gray-700 rounded p-4 w-64 shadow-lg z-50">
          <h3 className="text-xl font-bold mb-2">📊 Your Stats</h3>
          <ul className="text-sm space-y-2 mb-4">
            <li>✅ Wins: {wins}</li>
            <li>❌ Losses: {losses}</li>
            <li>🔥 Current Streak: {currentStreak}</li>
            <li>🏆 Best Streak: {bestStreak}</li>
          </ul>
          <hr className="border-gray-600 my-2" />
          <div className="flex flex-col space-y-2 text-sm">
            <label className="flex items-center justify-between">
              🎵 Background Music
              <input type="checkbox" checked={bgMusicOn} onChange={toggleBgMusic} />
            </label>
            <label className="flex items-center justify-between">
              🔊 Sound Effects
              <input type="checkbox" checked={sfxOn} onChange={toggleSfx} />
            </label>
          </div>
          <button
            onClick={() => setShowStatsMenu(false)}
            className="mt-4 bg-white text-gray-800 px-3 py-1 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">🎯 Number Guessing Game</h1>

      {/* Game Input */}
      <div className="flex gap-4 mb-4">
        <input type="number" placeholder="Min" className="text-white p-2 rounded bg-gray-800 w-24" value={min} onChange={(e) => setMin(e.target.value)} />
        <input type="number" placeholder="Max" className="text-white p-2 rounded bg-gray-800 w-24" value={max} onChange={(e) => setMax(e.target.value)} />
        <button onClick={startGame} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition">Start Game</button>
        <button onClick={resetGame} className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700 transition">Reset</button>
      </div>

      {/* Guess Input */}
      {rangeSet && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="number"
              placeholder="Enter your guess"
              className="text-white p-2 rounded w-64 bg-gray-800"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
            />
            <div className="bg-gray-700 text-white px-3 py-2 rounded text-sm font-semibold">
              Chances left: {maxChances - guessCount}
            </div>
          </div>
          <button
            onClick={handleGuess}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Guess
          </button>
        </>
      )}

      <p className="mt-6 text-xl text-center">{message}</p>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded text-center shadow-lg w-[90%] max-w-sm">
            <h2 className="text-2xl font-bold mb-2">
              {lastGameResult === "win" ? "🎉 You Won!" : "😢 You Lost"}
            </h2>
            <p className="mb-4">
              {lastGameResult === "win" ? `Total Wins: ${wins}` : `Total Losses: ${losses}`}
            </p>
            <button
              onClick={() => setShowSummary(false)}
              className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
