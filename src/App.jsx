import { useEffect, useState } from "react";
import Die from "./components/Die";
import nanoId from "nano-id";

import Confetti from "react-confetti";
import Scoreboard from "./components/Scoreboard";

export default function App() {
  const [dice, setDice] = useState(allNewDice());
  const [isWon, setIsWon] = useState(false);
  const [rollsCount, setRollsCount] = useState(0);
  const [bestRolls, setBestRolls] = useState(
    JSON.parse(localStorage.getItem("bestRolls")) || 0
  );
  const [bestTime, setBestTime] = useState(
    JSON.parse(localStorage.getItem("bestTime")) || 0
  );
  const [time, setTime] = useState(0);
  const [start, setStart] = useState(true);

  useEffect(() => {
    let interval = null;
    if (start) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [start]);

  useEffect(() => {
    const allDieHeld = dice.every((die) => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every((die) => die.value === firstValue);

    if (allDieHeld && allSameValue) {
      setIsWon(true);
      setRollsCount(0);
      setStart(false);
      setRecords();
    }
  }, [dice]);

  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoId(),
    };
  }

  function allNewDice() {
    const newDice = [];
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDie());
    }
    return newDice;
  }

  function newGame() {
    setIsWon(false);
    setStart(true);
    setDice(allNewDice());
    setRollsCount(0);
    setTime(0);
  }

  function setRecords() {
    // Check if bestRolls doesn't exist or newest rolls are better than bestRolls if so reassign the variable
    if (!bestRolls || rollsCount < bestRolls) {
      setBestRolls(rollsCount);
    }

    // WHY (time / 10) ?
    const timeFloored = Math.floor(time / 10);
    // Check if bestTime doesn't exist or newest time is lower than bestTime if so reassign the variable
    if (!bestTime || timeFloored < bestTime) {
      setBestTime(timeFloored);
    }
  }

  // Set bestRolls to localStorage every item bestRolls changes
  useEffect(() => {
    localStorage.setItem("bestRolls", JSON.stringify(bestRolls));
  }, [bestRolls]);

  // Set bestTime to localStorage every item bestTime changes
  useEffect(() => {
    localStorage.setItem("bestTime", JSON.stringify(bestTime));
  }, [bestTime]);

  function rollDice() {
    setDice((oldDice) =>
      oldDice.map((die) => {
        return die.isHeld ? die : generateNewDie();
      })
    );
    setRollsCount((prevRollsCount) => prevRollsCount + 1);
  }

  function holdDice(id) {
    setDice((oldDice) =>
      oldDice.map((die) => {
        return die.id === id ? { ...die, isHeld: !die.isHeld } : die;
      })
    );
  }

  const diceEl = dice.map((die) => (
    <Die
      value={die.value}
      key={die.id}
      isHeld={die.isHeld}
      holdDice={() => holdDice(die.id)}
    />
  ));

  document.addEventListener(
    "keydown",
    function (e) {
      if (e.keyCode == 123) {
        return false;
      } else if (e.ctrlKey && e.shiftKey && e.keyCode == 73) {
        return false;
      } else if (e.ctrlKey && e.keyCode == 85) {
        return false;
      }
    },
    false
  );

  if (document.addEventListener) {
    document.addEventListener(
      "contextmenu",
      function (e) {
        e.preventDefault();
      },
      false
    );
  } else {
    document.attachEvent("oncontextmenu", function () {
      window.e.returnValue = false;
    });
  }

  return (
    <>
      <div className="app-container shadow-shorter unselectable">
        {/* Render Confetti component if `tenzies` is true*/}
        {isWon && <Confetti />}
        <main>
          {!isWon ? <h1 className="title">Tenzies</h1> : ""}
          {isWon ? (
            <p className="instructions">
              <p className="winner gradient-text">
                <b>TENZI</b> YOU WON!
              </p>
              To play new game press New Game
            </p>
          ) : (
            <p className="instructions">
              Roll until all dice are of same number.
              <br />
              Click each die to freeze it then roll for the new one.
            </p>
          )}{" "}
          {!isWon ? (
            <div className="stats-container">
              <p>Rolls: {rollsCount}</p>
              <p>
                {/* divide the time by 10 because that is the value of a millisecond
            then modulo 1000. Now we will append this to a zero so that when the time starts
            there will be a zero already instead of just one digit. 
            Finally we will slice and pass in a parameter of -2 so that when the 
            number becomes two digits the zero will be removed */}
                Timer: {("0" + Math.floor((time / 1000) % 60)).slice(-2)}:
                {("0" + ((time / 10) % 1000)).slice(-2)}
              </p>
            </div>
          ) : (
            ""
          )}
          <div className="dice-container">{diceEl}</div>
          {isWon ? (
            <button className="roll-dice" onClick={newGame}>
              New Game
            </button>
          ) : (
            <button className="roll-dice" onClick={rollDice}>
              Roll
            </button>
          )}
          <Scoreboard bestRolls={bestRolls} bestTime={bestTime} />
        </main>
      </div>
    </>
  );
}
