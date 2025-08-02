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
    const bgPref = localStorage.getItem("bgMusicOn") !== "false";
    const sfxPref = localStorage.getItem("sfxOn") !== "false";

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
    setMessage(
      `🔢 Guess a number between ${minVal} and ${maxVal}.\n🎯 You have ${chances} chances.`
    );
    setMessage(
      `🔢 Guess between ${minVal} and ${maxVal}.\n🎯 You have ${chances} chances.`
    );
    setRangeSet(true);
    sfxOn && startRef.current?.play();
    if (bgMusicOn && bgMusicRef.current) {
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play().catch(() => {});
    }
  };

  const handleGuess = () => {
    sfxOn && clickRef.current?.play();
    if (!rangeSet) return;

    if (guessCount >= maxChances) {
      setMessage("⚠️ No more chances left!");
      return;
    }

    const userGuess = parseInt(guess);
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
      setShowSummary(true);
    } else {
      sfxOn && wrongRef.current?.play();
      if (guessCount + 1 >= maxChances) {
        const newLosses = losses + 1;
        setLosses(newLosses);
        setCurrentStreak(0);
        localStorage.setItem("losses", newLosses.toString());
        localStorage.setItem("currentStreak", "0");
        setMessage(`❌ ${userGuess} is incorrect! The number was ${randomNumber}.`);
        setLastGameResult("loss");
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
    setShowSummary(false);
  };

  const toggleBgMusic = () => {
    const newState = !bgMusicOn;
    setBgMusicOn(newState);
    localStorage.setItem("bgMusicOn", newState.toString());
    newState ? bgMusicRef.current?.play().catch(() => {}) : bgMusicRef.current?.pause();
  };

  const toggleSfx = () => {
    const newState = !sfxOn;
    setSfxOn(newState);
    localStorage.setItem("sfxOn", newState.toString());
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 relative animated-bg">
      <audio ref={bgMusicRef} src="/sounds/background.mp3" />
      <audio ref={clickRef} src="/sounds/click.mp3" />
      <audio ref={correctRef} src="/sounds/correct.mp3" />
      <audio ref={wrongRef} src="/sounds/wrong.mp3" />
      <audio ref={resetRef} src="/sounds/reset.mp3" />
      <audio ref={startRef} src="/sounds/start.mp3" />

      <button
        onClick={() => setShowStatsMenu((prev) => !prev)}
        className="absolute top-4 right-4 text-3xl hover:text-yellow-400"
        title="Show Stats"
      >
        ☰
      </button>

      {showStatsMenu && (
        <div className="absolute top-16 right-4 bg-gray-800 border border-gray-700 rounded p-4 w-64 shadow-lg z-50">
          <h3 className="text-xl font-bold mb-2">📊 Your Stats</h3>
          <ul className="text-sm space-y-2 mb-4">
            <li>✅ Wins: {wins}</li>
            <li>❌ Losses: {losses}</li>
            <li>🔥 Streak: {currentStreak}</li>
            <li>🏆 Best: {bestStreak}</li>
          </ul>
          <hr className="border-gray-600 my-2" />
          <label className="flex justify-between items-center text-sm">
            🎵 Music <input type="checkbox" checked={bgMusicOn} onChange={toggleBgMusic} />
          </label>
          <label className="flex justify-between items-center text-sm mt-2">
            🔊 SFX <input type="checkbox" checked={sfxOn} onChange={toggleSfx} />
          </label>
          <button
            onClick={() => setShowStatsMenu(false)}
            className="mt-4 bg-white text-black px-3 py-1 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      )}

      {/* Game Title or Started Status */}
      {!rangeSet ? (
        <>
          <h1 className="text-3xl font-bold mb-2 text-center">🎯 Number Guessing Game</h1>
          <p className="text-center text-gray-300 max-w-xl mb-6">
            🔢 Set a range, solve the logic — beat the number before chances vanish! ⚡
          </p>
        </>
      ) : (
        <h1 className="text-3xl font-bold mb-6 text-center">🎮 Game Started!</h1>
      )}

      <div className="flex gap-4 mb-2">
        <input type="number" placeholder="Min" className="text-white p-2 rounded bg-gray-800 w-24" value={min} onChange={(e) => setMin(e.target.value)} />
        <input type="number" placeholder="Max" className="text-white p-2 rounded bg-gray-800 w-24" value={max} onChange={(e) => setMax(e.target.value)} />
      </div>

      {!rangeSet && (
        <button
          onClick={startGame}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition mb-4"
        >
          Start Game
        </button>
      )}

      {rangeSet && (
        <>
          <div className="flex items-center gap-4 mb-2">
            <input
              type="number"
              placeholder="Enter your guess"
              className="text-white p-2 rounded w-64 bg-gray-800"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
            />
            <div className="bg-gray-700 text-white px-3 py-2 rounded text-sm font-semibold">
              Chances : {maxChances - guessCount}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-2 mb-2">
            <button
              onClick={handleGuess}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Guess
            </button>

            <button
              onClick={resetGame}
              className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700 transition"
            >
              Restart
            </button>
          </div>
        </>
      )}

      <p className="mt-6 text-lg text-center max-w-md">{message}</p>

      {/* Result Summary */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded text-center shadow-lg w-[90%] max-w-sm">
            <h2 className="text-2xl font-bold mb-2">
              {lastGameResult === "win" ? "🎉 You Won!" : "😢 You Lost"}
            </h2>
            <p className="mb-4">
              {lastGameResult === "win" ? `Total Wins: ${wins}` : `Total Losses: ${losses}`}
            </p>
            <button
              onClick={() => setShowSummary(false)}
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
