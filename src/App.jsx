import { useState, useEffect, useCallback } from "react";

import "./App.css";
import "./Calendar.css";

import Setup from "./Setup";



import {

  calculateArcDay,

  getLocalDateString,

  parseLocalDate,

  getNextMidnight,

  resetGoalsForNewDay,

  createDayRecord,

  createMissedDayRecord,

  calculateArcStatus,

  getMissedDays,

  TOTAL_DAYS,

} from "./dayEngine";



function readJson(key, fallback) {

  try {

    const raw = localStorage.getItem(key);

    if (raw == null) {

      return fallback;

    }

    return JSON.parse(raw);

  } catch {

    return fallback;

  }

}



function App() {

  const TEST_MODE = false;



  // ==================================

  // SETUP

  // ==================================



  const [isSetupComplete, setIsSetupComplete] = useState(() => {

    return (

      localStorage.getItem("winterArcSetupComplete") === "true"

    );

  });



  const [userData, setUserData] = useState(() => {

    return readJson("winterArcUserData", {

      startingWeight: "--",

      targetWeight: "--",

      startDate: "2026-10-01",

      photo: null,

    });

  });



  // ==================================

  // CORE GOALS

  // ==================================



  const defaultCoreGoals = [

    {

      name: "Workout",

      icon: "🏋️",

      completed: false,

    },

    {

      name: "Walking",

      icon: "🚶",

      completed: false,

    },

    {

      name: "No Junk Food",

      icon: "🍔",

      completed: false,

    },

    {

      name: "No Sugar",

      icon: "🍬",

      completed: false,

    },

  ];



  const [goals, setGoals] = useState(() => {

    return readJson("winterArcGoals", defaultCoreGoals);

  });



  // ==================================

  // OPTIONAL GOALS

  // ==================================



  const [optionalGoals, setOptionalGoals] = useState(() => {

    return readJson("winterArcOptionalGoals", []);

  });



  // ==================================

  // DAY SYSTEM

  // ==================================



  const [currentDay, setCurrentDay] = useState(() => {

    const data = readJson("winterArcUserData", null);



    if (!data?.startDate) return 1;



    return calculateArcDay(data.startDate);

  });



  const [testDay, setTestDay] = useState(null);



  const activeDay =

    TEST_MODE && testDay !== null

      ? testDay

      : currentDay;



  // ==================================

  // DAY RECORDS

  // ==================================



  const [dayRecords, setDayRecords] = useState(() => {

    return readJson("winterArcDayRecords", {});

  });



  // ==================================

  // ARC STATUS

  // ==================================



  const [arcStatus, setArcStatus] = useState(() => {

    const savedStatus =

      localStorage.getItem("winterArcStatus");



    return savedStatus || "active";

  });



  // ==================================

  // HISTORY

  // ==================================



  const [showHistory, setShowHistory] = useState(false);

const [weightEntries, setWeightEntries] = useState(() => {

  return readJson("winterArcWeightEntries", {});

});



const [todayWeight, setTodayWeight] = useState("");

  // ==================================

  // ADD GOAL

  // ==================================



  const [showAddGoal, setShowAddGoal] = useState(false);

  const [newGoalName, setNewGoalName] = useState("");

  const [newGoalIcon, setNewGoalIcon] = useState("🎯");



  // ==================================

  // PERSIST GOALS

  // ==================================



  useEffect(() => {

    localStorage.setItem(

      "winterArcGoals",

      JSON.stringify(goals)

    );

  }, [goals]);



  useEffect(() => {

    localStorage.setItem(

      "winterArcOptionalGoals",

      JSON.stringify(optionalGoals)

    );

  }, [optionalGoals]);

  useEffect(() => {

  localStorage.setItem(

    "winterArcWeightEntries",

    JSON.stringify(weightEntries)

  );

}, [weightEntries]);

  // ==================================

  // PERSIST DAY RECORDS

  // ==================================



  useEffect(() => {

    localStorage.setItem(

      "winterArcDayRecords",

      JSON.stringify(dayRecords)

    );

  }, [dayRecords]);



  // ==================================

  // PERSIST ARC STATUS

  // ==================================



  useEffect(() => {

    localStorage.setItem(

      "winterArcStatus",

      arcStatus

    );

  }, [arcStatus]);



  // ==================================

  // START WINTER ARC

  // ==================================



  const handleStart = (data) => {

    setUserData(data);

    setIsSetupComplete(true);



    localStorage.setItem(

      "winterArcSetupComplete",

      "true"

    );



    localStorage.setItem(

      "winterArcUserData",

      JSON.stringify(data)

    );



    localStorage.removeItem(

      "winterArcDayRecords"

    );



    localStorage.removeItem(

      "winterArcStatus"

    );



    localStorage.removeItem(

      "winterArcLastOpenDay"

    );



    localStorage.removeItem(

      "winterArcWeightEntries"

    );



    setDayRecords({});

    setWeightEntries({});

    setTodayWeight("");

    setArcStatus("active");



    setGoals(

      defaultCoreGoals.map((goal) => ({

        ...goal,

        completed: false,

      }))

    );



    setOptionalGoals((currentGoals) =>

      currentGoals.map((goal) => ({

        ...goal,

        completed: false,

      }))

    );



    const startingDay =

      calculateArcDay(data.startDate);



    setCurrentDay(startingDay);

    setTestDay(null);

  };



  // ==================================

  // CURRENT DAY STATUS

  // ==================================



  const isDaySubmitted =

    dayRecords[activeDay]?.status === "submitted";



  // ==================================

  // TOGGLE CORE GOAL

  // ==================================



  const toggleGoal = (index) => {

    if (isDaySubmitted) return;



    setGoals((currentGoals) =>

      currentGoals.map((goal, i) =>

        i === index

          ? {

              ...goal,

              completed: !goal.completed,

            }

          : goal

      )

    );

  };



  // ==================================

  // TOGGLE OPTIONAL GOAL

  // ==================================



  const toggleOptionalGoal = (id) => {

    if (isDaySubmitted) return;



    setOptionalGoals((currentGoals) =>

      currentGoals.map((goal) =>

        goal.id === id

          ? {

              ...goal,

              completed: !goal.completed,

            }

          : goal

      )

    );

  };



  // ==================================

  // ADD OPTIONAL GOAL

  // ==================================



  const handleAddGoal = () => {

    if (!newGoalName.trim()) {

      alert("Please enter a goal name.");

      return;

    }



    const newGoal = {

      id: Date.now(),

      name: newGoalName.trim(),

      icon: newGoalIcon,

      completed: false,

    };



    setOptionalGoals((currentGoals) => [

      ...currentGoals,

      newGoal,

    ]);



    setNewGoalName("");

    setNewGoalIcon("🎯");

    setShowAddGoal(false);

  };



  // ==================================

  // DELETE OPTIONAL GOAL

  // ==================================



  const deleteOptionalGoal = (id) => {

    if (isDaySubmitted) return;



    setOptionalGoals((currentGoals) =>

      currentGoals.filter(

        (goal) => goal.id !== id

      )

    );

  };



  // ==================================

  // TODAY'S COMPLETION

  // ==================================



  const completedGoals = goals.filter(

    (goal) => goal.completed

  ).length;



  const completion =

    goals.length > 0

      ? Math.round(

          (completedGoals / goals.length) * 100

        )

      : 0;



  const disciplineScore = completion;



  // ==================================

  // 90-DAY ARC PROGRESS

  // ==================================



  const trackedDayRecords =

    Object.values(dayRecords);



  const trackedDays =

    trackedDayRecords.length;



  const totalDailyCompletion =

    trackedDayRecords.reduce(

      (total, record) =>

        total +

        (Number(record.completion) || 0),

      0

    );



  const arcProgress =

    trackedDays > 0

      ? Math.round(

          totalDailyCompletion /

            trackedDays

        )

      : 0;



  // ==================================

  // HISTORY DAYS

  // ==================================



  const historyDays = Array.from(

    { length: TOTAL_DAYS },

    (_, index) => index + 1

  );



const weightDays = Object.keys(weightEntries)
    .map(Number)
    .filter((day) => Number.isFinite(day))
    .sort((a, b) => a - b);

  const totalWeightEntries = weightDays.length;

  const firstWeight =
    totalWeightEntries > 0
      ? Number(weightEntries[weightDays[0]])
      : 0;

  const latestWeightEntry =
    totalWeightEntries > 0
      ? Number(
          weightEntries[weightDays[weightDays.length - 1]]
        )
      : 0;



const weightLost =

  firstWeight > 0 &&

  latestWeightEntry > 0

    ? Number(

        (

          firstWeight -

          latestWeightEntry

        ).toFixed(1)

      )

    : 0;



// ==================================

// STREAK CALCULATIONS

// ==================================



let longestStreak = 0;

let runningStreak = 0;



for (let day = 1; day <= TOTAL_DAYS; day++) {

  const record = dayRecords[day];



  if (record?.status === "submitted") {

    runningStreak += 1;



    if (runningStreak > longestStreak) {

      longestStreak = runningStreak;

    }

  } else {

    runningStreak = 0;

  }

}



let currentStreak = 0;



const streakEndDay =

  dayRecords[activeDay]?.status === "submitted"

    ? activeDay

    : activeDay - 1;



for (let day = streakEndDay; day >= 1; day--) {

  const record = dayRecords[day];



  if (record?.status === "submitted") {

    currentStreak += 1;

  } else {

    break;

  }

}

  // ==================================

  // SUBMIT DAY

  // ==================================



  const handleSubmitDay = () => {

    if (isDaySubmitted) return;



    
    if (
      activeDay < 1 ||
      activeDay > TOTAL_DAYS ||
      arcStatus === "completed"
    ) {
      return;
    }

const record = createDayRecord({

      day: activeDay,

      status: "submitted",

      goals: goals,

      optionalGoals: optionalGoals,

      submittedAt:

        new Date().toISOString(),

    });



    setDayRecords((currentRecords) => ({

      ...currentRecords,

      [activeDay]: record,

    }));



    

  };



  // ==================================

  // DAY ROLLOVER

  // ==================================



  const processDayRollover =

    useCallback(() => {

      if (!userData.startDate) return;



      if (

        TEST_MODE &&

        testDay !== null

      ) {

        return;

      }



      const calculatedDay =

        calculateArcDay(

          userData.startDate

        );



      setDayRecords(

        (currentRecords) => {

          const updatedRecords = {

            ...currentRecords,

          };



          const startDate =

            parseLocalDate(

              userData.startDate

            );



          const todayDate =

            parseLocalDate(

              getLocalDateString()

            );



          startDate.setHours(0, 0, 0, 0);

          todayDate.setHours(0, 0, 0, 0);



          const difference =

            todayDate.getTime() -

            startDate.getTime();



          const daysPassed =

            Math.floor(

              difference /

                (1000 *

                  60 *

                  60 *

                  24)

            );



          const lastCompletedCalendarDay =

            Math.min(

              daysPassed,

              TOTAL_DAYS - 1

            );



          for (

            let day = 1;

            day <=

            lastCompletedCalendarDay;

            day++

          ) {

            if (!updatedRecords[day]) {

              updatedRecords[day] =

                createMissedDayRecord(

                  day,

                  defaultCoreGoals,

                  []

                );

            }

          }



          return updatedRecords;

        }

      );



      setCurrentDay(calculatedDay);

    }, [

      userData.startDate,

      testDay,

    ]);



  // ==================================

  // INITIAL DAY CHECK

  // ==================================



  useEffect(() => {

    if (!isSetupComplete) return;



    if (

      TEST_MODE &&

      testDay !== null

    ) {

      return;

    }



    processDayRollover();

  }, [

    isSetupComplete,

    processDayRollover,

    testDay,

  ]);



  // ==================================

  // MIDNIGHT CHECK

  // ==================================



  useEffect(() => {

    if (!isSetupComplete) return;



    if (

      TEST_MODE &&

      testDay !== null

    ) {

      return;

    }



    const scheduleMidnightCheck =

      () => {

        const midnight =

          getNextMidnight();



        const milliseconds =

          midnight.getTime() -

          new Date().getTime();



        const timeout =

          setTimeout(() => {

            processDayRollover();

            scheduleMidnightCheck();

          }, milliseconds + 100);



        return timeout;

      };



    const timeout =

      scheduleMidnightCheck();



    return () =>

      clearTimeout(timeout);

  }, [

    isSetupComplete,

    processDayRollover,

    testDay,

  ]);



  // ==================================

  // VISIBILITY / FOCUS CHECK

  // ==================================



  useEffect(() => {

    if (!isSetupComplete) return;



    if (

      TEST_MODE &&

      testDay !== null

    ) {

      return;

    }



    const handleVisibilityChange =

      () => {

        if (

          document.visibilityState ===

          "visible"

        ) {

          processDayRollover();

        }

      };



    document.addEventListener(

      "visibilitychange",

      handleVisibilityChange

    );



    window.addEventListener(

      "focus",

      processDayRollover

    );



    return () => {

      document.removeEventListener(

        "visibilitychange",

        handleVisibilityChange

      );



      window.removeEventListener(

        "focus",

        processDayRollover

      );

    };

  }, [

    isSetupComplete,

    processDayRollover,

    testDay,

  ]);



  // ==================================

  // DAILY RESET

  // ==================================



  useEffect(() => {

    if (!isSetupComplete) return;



    if (

      TEST_MODE &&

      testDay !== null

    ) {

      return;

    }



    const savedDay =

      localStorage.getItem(

        "winterArcLastOpenDay"

      );



    if (

      savedDay &&

      Number(savedDay) !==

        currentDay

    ) {

      setGoals((currentGoals) =>

        resetGoalsForNewDay(

          currentGoals

        )

      );



      setOptionalGoals(

        (currentGoals) =>

          resetGoalsForNewDay(

            currentGoals

          )

      );

    }



    localStorage.setItem(

      "winterArcLastOpenDay",

      String(currentDay)

    );

  }, [

    currentDay,

    isSetupComplete,

    testDay,

  ]);



  // ==================================

  // ARC STATUS

  // ==================================



  useEffect(() => {

    const status =

      calculateArcStatus(

        dayRecords,

        activeDay

      );



    setArcStatus(status);

  }, [

    dayRecords,

    activeDay,

  ]);



  const missedDays =

    getMissedDays(dayRecords);

    // ==================================

// ARC STATISTICS

// ==================================



const submittedRecords =

  trackedDayRecords.filter(

    (record) =>

      record.status === "submitted"

  );



const submittedDays =

  submittedRecords.length;



const missedDaysCount =

  missedDays.length;



const bestDayCompletion =

  submittedRecords.length > 0

    ? Math.max(

        ...submittedRecords.map(

          (record) =>

            Number(record.completion) || 0

        )

      )

    : 0;



const averageCompletion =

  trackedDays > 0

    ? Math.round(

        totalDailyCompletion /

          trackedDays

      )

    : 0;





  // ==================================

  // TEST MODE

  // ==================================



  const simulateDay = (day) => {

    if (

      day < 1 ||

      day > TOTAL_DAYS

    ) {

      return;

    }



    setTestDay(day);



    setGoals((currentGoals) =>

      resetGoalsForNewDay(

        currentGoals

      )

    );



    setOptionalGoals(

      (currentGoals) =>

        resetGoalsForNewDay(

          currentGoals

        )

    );

  };



  const simulateNextDay = () => {

    const day = activeDay;



    if (!dayRecords[day]) {

      const missedRecord =

        createMissedDayRecord(

          day,

          goals,

          optionalGoals

        );



      setDayRecords(

        (currentRecords) => ({

          ...currentRecords,

          [day]: missedRecord,

        })

      );

    }



    const nextDay = Math.min(

      day + 1,

      TOTAL_DAYS

    );



    setTestDay(nextDay);



    setGoals((currentGoals) =>

      resetGoalsForNewDay(

        currentGoals

      )

    );



    setOptionalGoals(

      (currentGoals) =>

        resetGoalsForNewDay(

          currentGoals

        )

    );

  };



  // ==================================

  // WEIGHT

  // ==================================



  const startingWeight =

    userData.startingWeight;



  const targetWeight =

    userData.targetWeight;

  const handleWeightSubmit = () => {

  if (

    !todayWeight ||

    Number(todayWeight) <= 0

  ) {

    alert("Please enter a valid weight.");

    return;

  }



  setWeightEntries((currentEntries) => ({

    ...currentEntries,

    [activeDay]: Number(todayWeight),

  }));



  setTodayWeight("");

};



const latestSavedWeight =
    weightDays.length > 0
      ? weightEntries[weightDays[weightDays.length - 1]]
      : null;

  const currentWeight =
    weightEntries[activeDay] ?? latestSavedWeight;



const startWeight = Number(startingWeight);

const goalWeight = Number(targetWeight);

const latestWeight = Number(currentWeight);



let weightProgress = 0;



if (

  startWeight > 0 &&

  goalWeight > 0 &&

  latestWeight > 0 &&

  startWeight !== goalWeight

) {

  weightProgress = Math.round(

    ((startWeight - latestWeight) /

      (startWeight - goalWeight)) *

      100

  );



  weightProgress = Math.max(

    0,

    Math.min(100, weightProgress)

  );

}



  // ==================================

  // ARC STATUS TEXT

  // ==================================



  const getStatusText = () => {

    if (

      arcStatus === "completed"

    ) {

      return "🏆 ARC COMPLETED";

    }



    if (

      arcStatus === "failed"

    ) {

      return "❌ ARC FAILED";

    }



    return "🟢 ARC ACTIVE";

  };

  // ==================================
  // 90-DAY CALENDAR
  // ==================================

  const calendarDays = Array.from(
    { length: TOTAL_DAYS },
    (_, index) => index + 1
  );

  const getCalendarDayClass = (day) => {
    const record = dayRecords[day];

    if (day === activeDay) {
      return "arc-calendar-day today";
    }

    if (record?.status === "submitted") {
      return "arc-calendar-day completed";
    }

    if (record?.status === "missed") {
      return "arc-calendar-day missed";
    }

    if (day < activeDay) {
      return "arc-calendar-day missed";
    }

    return "arc-calendar-day future";
  };

  const getCalendarDayLabel = (day) => {
    const record = dayRecords[day];

    if (record?.status === "submitted") {
      return `${Number(record.completion) || 0}%`;
    }

    if (record?.status === "missed" || day < activeDay) {
      return "Missed";
    }

    if (day === activeDay) {
      return "Today";
    }

    return "Future";
  };




  // ==================================

  // RETURN

  // ==================================



  return (

    <>

      {!isSetupComplete ? (

        <Setup

          onStart={handleStart}

        />

      ) : (

        <div className="app">



          {/* ==================================

              TEST MODE

          ================================== */}



          {TEST_MODE && (

            <div

              style={{

                padding: "15px",

                marginBottom: "20px",

                border:

                  "1px solid #555",

                borderRadius: "10px",

                background: "#151515",

              }}

            >

              <strong>

                🧪 TEST MODE

              </strong>



              <p

                style={{

                  marginTop: "6px",

                }}

              >

                Current Test Day:{" "}

                {String(activeDay).padStart(

                  2,

                  "0"

                )}

              </p>



              <div

                style={{

                  display: "flex",

                  gap: "8px",

                  flexWrap:

                    "wrap",

                  marginTop:

                    "10px",

                }}

              >



                <button

                  onClick={() =>

                    simulateDay(1)

                  }

                >

                  Day 01

                </button>



                <button

                  onClick={() =>

                    simulateDay(2)

                  }

                >

                  Day 02

                </button>



                <button

                  onClick={() =>

                    simulateDay(3)

                  }

                >

                  Day 03

                </button>



                <button

                  onClick={() =>

                    simulateDay(4)

                  }

                >

                  Day 04

                </button>



                <button

                  onClick={() =>

                    simulateDay(90)

                  }

                >

                  Day 90

                </button>



                <button

                  onClick={

                    simulateNextDay

                  }

                >

                  🌙 Simulate Midnight

                </button>



              </div>

            </div>

          )}



          {/* ==================================

              HEADER

          ================================== */}



          <header className="header">



            <div className="header-title">

              {userData.photo ? (

                <img

                  className="arc-start-photo"

                  src={userData.photo}

                  alt="Starting"

                />

              ) : null}



              <div>

                <p className="small-title">

                  90 DAY TRANSFORMATION

                </p>



                <h1>

                  ❄️ WINTER ARC

                </h1>

              </div>

            </div>



            <div className="day-box">



              <span>

                DAY

              </span>



              <strong>

                {String(

                  activeDay

                ).padStart(

                  2,

                  "0"

                )}

              </strong>



              <span>

                / {TOTAL_DAYS}

              </span>



            </div>



          </header>



          
          <p className="arc-live-note">
            {getStatusText()} • Stay consistent. One day at a time.
          </p>

          {/* ==================================

              90-DAY ARC PROGRESS

          ================================== */}



          <section className="progress-card">



            <div className="progress-circle">



              <span>

                {arcProgress}%

              </span>



            </div>



            <div className="progress-info">



              <p>

                90-DAY ARC PROGRESS

              </p>



              <h2>

                {arcProgress}%

              </h2>



              <div className="progress-bar">



                <div

                  className="progress-fill"

                  style={{

                    width: `${arcProgress}%`,

                  }}

                ></div>



              </div>



              <p>

                {trackedDays} /{" "}

                {TOTAL_DAYS}{" "}

                days tracked

              </p>



            </div>



          </section>



          {/* ==================================

              TODAY'S COMPLETION

          ================================== */}



          <section className="weight-card">



            <div>



              <p className="section-label">

                🔥 TODAY'S COMPLETION

              </p>



              <div className="weight-values">



                <strong>

                  {completion}%

                </strong>



                <span>

                  •

                </span>



                <strong>

                  Day{" "}

                  {String(

                    activeDay

                  ).padStart(

                    2,

                    "0"

                  )}

                </strong>



              </div>



              <p className="weight-description">

                Today's goals completed

              </p>



            </div>



            <div className="weight-progress">



              <div className="weight-number">

                {completedGoals}/

                {goals.length}

              </div>



              <span>

                Goals

              </span>



            </div>



          </section>



          {/* ==================================

              WEIGHT GOAL

          ================================== */}



          <section className="weight-card">



  <div>



    <p className="section-label">

      🎯 WEIGHT GOAL

    </p>



    <div className="weight-values">



      <strong>

        {startingWeight} kg

      </strong>



      <span>

        →

      </span>



      <strong>

        {targetWeight} kg

      </strong>



    </div>



    <p className="weight-description">

      Starting weight → Target weight

      {weightLost > 0

        ? ` • ${weightLost} kg lost`

        : weightLost < 0

        ? ` • ${Math.abs(weightLost)} kg gained`

        : ""}

    </p>



    <div

      style={{

        display: "flex",

        gap: "8px",

        marginTop: "15px",

      }}

    >



      <input

        type="number"

        step="0.1"

        min="1"

        placeholder="Today's weight"

        value={todayWeight}

        onChange={(e) =>

          setTodayWeight(e.target.value)

        }

        style={{

          width: "150px",

          padding: "10px",

          borderRadius: "8px",

          border: "1px solid #333",

          background: "#181818",

          color: "white",

        }}

      />



      <button

        onClick={handleWeightSubmit}

        style={{

          padding: "10px 15px",

          borderRadius: "8px",

          border: "1px solid #444",

          background: "#222",

          color: "white",

          cursor: "pointer",

        }}

      >

        Save

      </button>



    </div>



  </div>



  <div className="weight-progress">



    <div className="weight-number">

      {latestWeight > 0

        ? `${latestWeight} kg`

        : "--"}

    </div>



    <span>

      {weightProgress}% Progress

    </span>



  </div>



</section>

          {/* ==================================

              CORE GOALS

          ================================== */}



          <section className="goals-section">



            <div className="section-heading">



              <div>



                <p className="section-label">

                  🔥 YOUR CORE GOALS

                </p>



                <h2>

                  Today's Goals

                </h2>



              </div>



              <span className="goal-count">

                {completedGoals}/

                {goals.length}

              </span>



            </div>



            <div className="goals-list">



              {goals.map(

                (goal, index) => (



                  <div

                    className={`goal-card ${

                      goal.completed

                        ? "completed"

                        : ""

                    } ${

                      isDaySubmitted

                        ? "locked"

                        : ""

                    }`}

                    key={goal.name}

                    onClick={() =>

                      toggleGoal(

                        index

                      )

                    }

                  >



                    <div className="goal-left">



                      <div className="goal-icon">

                        {goal.icon}

                      </div>



                      <div>



                        <h3>

                          {goal.name}

                        </h3>



                        <p>

                          {goal.completed

                            ? "Completed"

                            : isDaySubmitted

                            ? "Day submitted"

                            : "Tap to update"}

                        </p>



                      </div>



                    </div>



                    <div className="goal-status">

                      {goal.completed

                        ? "✓"

                        : "○"}

                    </div>



                  </div>



                )

              )}



            </div>



          </section>



          {/* ==================================

              DISCIPLINE SCORE

          ================================== */}



          <section className="discipline-card">



            <div>



              <p className="section-label">

                🔥 DISCIPLINE SCORE

              </p>



              <h2>

                {disciplineScore}%

              </h2>



              <p>

                Based on your consistency

                across core goals.

              </p>



            </div>



            <div className="discipline-circle">

              {disciplineScore}%

            </div>



          </section>



          {/* ==================================

              SUBMIT DAY

          ================================== */}



          <section className="submit-section">



            {!isDaySubmitted ? (



              <button

                className="submit-day-button"

                onClick={

                  handleSubmitDay

                }

              >

                SUBMIT DAY{" "}

                {String(

                  activeDay

                ).padStart(

                  2,

                  "0"

                )}{" "}

                🔥

              </button>



            ) : (



              <div className="submitted-message">



                <strong>

                  ✅ DAY{" "}

                  {String(

                    activeDay

                  ).padStart(

                    2,

                    "0"

                  )}{" "}

                  SUBMITTED

                </strong>



                <span>

                  {completedGoals}/

                  {goals.length}

                  {" "}

                  goals completed •{" "}

                  {completion}%

                </span>



              </div>



            )}



          </section>

          {/* ==================================
              90-DAY CALENDAR
          ================================== */}

          
          {/* ==================================
              STREAK & ARC STATS
          ================================== */}

          <section className="arc-stats-card">
            <div className="section-heading">
              <div>
                <p className="section-label">🔥 ARC STATS</p>
                <h2>Your Consistency</h2>
              </div>
            </div>

            <div className="arc-stats-grid">
              <div className="arc-stat-box highlight">
                <span>CURRENT STREAK</span>
                <strong>{currentStreak}</strong>
                <small>{currentStreak === 1 ? "day" : "days"}</small>
              </div>

              <div className="arc-stat-box">
                <span>LONGEST STREAK</span>
                <strong>{longestStreak}</strong>
                <small>{longestStreak === 1 ? "day" : "days"}</small>
              </div>

              <div className="arc-stat-box">
                <span>COMPLETED DAYS</span>
                <strong>{submittedDays}</strong>
                <small>of {TOTAL_DAYS}</small>
              </div>

              <div className="arc-stat-box">
                <span>MISSED DAYS</span>
                <strong>{missedDaysCount}</strong>
                <small>days</small>
              </div>

              <div className="arc-stat-box">
                <span>BEST DAY</span>
                <strong>{bestDayCompletion}%</strong>
                <small>completion</small>
              </div>

              <div className="arc-stat-box">
                <span>AVERAGE</span>
                <strong>{averageCompletion}%</strong>
                <small>completion</small>
              </div>
            </div>
          </section>

          <section className="arc-calendar-card">
            <div className="section-heading">
              <div>
                <p className="section-label">🗓️ WINTER ARC CALENDAR</p>
                <h2>90-Day Journey</h2>
                <p className="arc-calendar-subtitle">
                  Track every day of your Winter ARC at a glance.
                </p>
              </div>
            </div>

            <div className="arc-calendar-legend">
              <span>
                <i className="legend-dot completed"></i>
                Completed
              </span>
              <span>
                <i className="legend-dot missed"></i>
                Missed
              </span>
              <span>
                <i className="legend-dot today"></i>
                Today
              </span>
              <span>
                <i className="legend-dot future"></i>
                Future
              </span>
            </div>

            <div className="arc-calendar-grid">
              {calendarDays.map((day) => {
                const record = dayRecords[day];
                const completionValue =
                  Number(record?.completion) || 0;

                return (
                  <div
                    key={day}
                    className={getCalendarDayClass(day)}
                    title={`Day ${String(day).padStart(2, "0")} • ${getCalendarDayLabel(day)}`}
                  >
                    <span className="calendar-day-number">
                      {String(day).padStart(2, "0")}
                    </span>

                    <span className="calendar-day-status">
                      {day === activeDay && !record
                        ? "🔥"
                        : record?.status === "submitted"
                        ? "✓"
                        : record?.status === "missed" || day < activeDay
                        ? "×"
                        : ""}
                    </span>

                    {record?.status === "submitted" && (
                      <span className="calendar-day-percent">
                        {completionValue}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>





          {/* ==================================

              ARC HISTORY

          ================================== */}



          <section className="history-card">



            <div className="section-heading">



              <div>



                <p className="section-label">

                  📅 ARC HISTORY

                </p>



                <h2>

                  90-Day Journey

                </h2>



              </div>



              <button

                className="history-toggle"

                onClick={() =>

                  setShowHistory(

                    !showHistory

                  )

                }

              >

                {showHistory

                  ? "Hide"

                  : "View"}

              </button>



            </div>



            {showHistory && (



              <div className="history-list">



                {historyDays.map(

                  (day) => {



                    const record =

                      dayRecords[

                        day

                      ];



                    const isCurrent =

                      day ===

                      activeDay;



                    const status =

                      record?.status;



                    const dayCompletion =

                      Number(

                        record?.completion

                      ) || 0;



                    return (

                      <div

                        key={day}

                        className={`history-row ${

                          isCurrent

                            ? "history-current"

                            : ""

                        }`}

                      >



                        <div className="history-day">



                          <span>

                            DAY

                          </span>



                          <strong>

                            {String(

                              day

                            ).padStart(

                              2,

                              "0"

                            )}

                          </strong>



                        </div>



                        <div className="history-progress">



                          <div className="history-bar">



                            <div

                              className="history-fill"

                              style={{

                                width: `${dayCompletion}%`,

                              }}

                            />



                          </div>



                          <span>

                            {record

                              ? `${dayCompletion}%`

                              : "Not tracked"}

                          </span>



                        </div>



                        <div className="history-status">



                          {status ===

                            "submitted" && (

                            <span className="status-submitted">

                              ✅ Submitted

                            </span>

                          )}



                          {status ===

                            "missed" && (

                            <span className="status-missed">

                              ❌ Missed

                            </span>

                          )}



                          {!status &&

                            isCurrent && (

                            <span className="status-current">

                              🔥 Today

                            </span>

                          )}



                          {!status &&

                            !isCurrent && (

                            <span className="status-future">

                              —

                            </span>

                          )}



                        </div>



                      </div>

                    );

                  }

                )}



              </div>



            )}



          </section>

{/* ==================================

    WEIGHT HISTORY

\================================== */}



<section className="weight-history-card">



  <div className="section-heading">



    <div>

      <p className="section-label">

        ⚖️ WEIGHT HISTORY

      </p>



      <h2>

        Weight Progress

      </h2>

      {totalWeightEntries > 0 ? (

        <p className="weight-description">

          {weightLost > 0

            ? `${weightLost} kg lost`

            : weightLost < 0

            ? `${Math.abs(weightLost)} kg gained`

            : "No change yet"}

        </p>

      ) : null}

    </div>



  </div>



  {Object.keys(weightEntries).length === 0 ? (



    <p className="weight-history-empty">

      No weight entries yet.

      Start tracking from today.

    </p>



  ) : (



    <div className="weight-history-list">



      {Object.entries(weightEntries)

        .sort(

          ([dayA], [dayB]) =>

            Number(dayA) - Number(dayB)

        )

        .map(([day, weight]) => (



          <div

            className="weight-history-row"

            key={day}

          >



            <div className="weight-history-day">

              <span>DAY</span>



              <strong>

                {String(day).padStart(

                  2,

                  "0"

                )}

              </strong>

            </div>



            <div className="weight-history-value">

              {weight} kg

            </div>



            <div className="weight-history-status">

              {Number(weight) <

              Number(startingWeight)

                ? "📉"

                : Number(weight) >

                  Number(startingWeight)

                ? "📈"

                : "—"}

            </div>



          </div>



        ))}



    </div>



  )}



</section>

          {/* ==================================

              OPTIONAL GOALS

          ================================== */}



          <section className="optional-card">



            <div>



              <p className="section-label">

                ⚙️ OPTIONAL GOALS

              </p>



              <h2>

                Personalize Your ARC

              </h2>



              <p>

                Add sleep, water,

                reading, meditation,

                study or your own

                habits.

              </p>



            </div>



            <button

              onClick={() =>

                setShowAddGoal(

                  true

                )

              }

            >

              + Add Goal

            </button>



          </section>



          {/* ==================================

              OPTIONAL GOALS LIST

          ================================== */}



          {optionalGoals.length >

            0 && (



            <section className="optional-goals-list">



              {optionalGoals.map(

                (goal) => (



                  <div

                    className={`goal-card optional-goal ${

                      goal.completed

                        ? "completed"

                        : ""

                    } ${

                      isDaySubmitted

                        ? "locked"

                        : ""

                    }`}

                    key={goal.id}

                    onClick={() =>

                      toggleOptionalGoal(

                        goal.id

                      )

                    }

                  >



                    <div className="goal-left">



                      <div className="goal-icon">

                        {goal.icon}

                      </div>



                      <div>



                        <h3>

                          {goal.name}

                        </h3>



                        <p>

                          {goal.completed

                            ? "Completed"

                            : isDaySubmitted

                            ? "Day submitted"

                            : "Tap to update"}

                        </p>



                      </div>



                    </div>



                    <div className="goal-right">

                      <div className="goal-status">

                        {goal.completed

                          ? "✓"

                          : "○"}

                      </div>



                      <button

                        type="button"

                        className="optional-goal-delete"

                        onClick={(event) => {

                          event.stopPropagation();

                          deleteOptionalGoal(goal.id);

                        }}

                        disabled={isDaySubmitted}

                      >

                        ×

                      </button>

                    </div>



                  </div>



                )

              )}



            </section>



          )}



          {/* ==================================

              ADD GOAL POPUP

          ================================== */}



          {showAddGoal && (



            <div className="add-goal-overlay">



              <div className="add-goal-modal">



                <h2>

                  ➕ Add Your Goal

                </h2>



                <p>

                  Create a personal

                  goal for your ARC.

                </p>



                <input

                  type="text"

                  placeholder="Goal name"

                  value={

                    newGoalName

                  }

                  onChange={(e) =>

                    setNewGoalName(

                      e.target.value

                    )

                  }

                />



                <div className="icon-options">



                  {[

                    "🎯",

                    "💧",

                    "📚",

                    "😴",

                    "🧘",

                    "🏃",

                    "📱",

                    "📝",

                  ].map(

                    (icon) => (



                      <button

                        key={icon}

                        className={

                          newGoalIcon ===

                          icon

                            ? "selected-icon"

                            : ""

                        }

                        onClick={() =>

                          setNewGoalIcon(

                            icon

                          )

                        }

                      >

                        {icon}

                      </button>



                    )

                  )}



                </div>



                <div className="add-goal-actions">



                  <button

                    onClick={() => {

                      setShowAddGoal(

                        false

                      );

                      setNewGoalName(

                        ""

                      );

                    }}

                  >

                    Cancel

                  </button>



                  <button

                    onClick={

                      handleAddGoal

                    }

                  >

                    Add Goal

                  </button>



                </div>



              </div>



            </div>



          )}



          {/* ==================================

              FOOTER

          ================================== */}



          <footer>



            <p>

              NO EXCUSES • 90 DAYS •

              PURE DISCIPLINE

            </p>



          </footer>



        </div>

      )}

    </>

  );

}



export default App;