// Winter ARC 90 - Day Engine

const TOTAL_DAYS = 90;

/*
  Converts YYYY-MM-DD into a local date.
  We avoid new Date("YYYY-MM-DD") because it can
  cause timezone issues.
*/
export function parseLocalDate(dateString) {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

/*
  Returns today's date in YYYY-MM-DD format
  using the user's local device time.
*/
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
  Calculate which ARC day it currently is.

  Example:
  Start date = Oct 1

  Oct 1  -> Day 1
  Oct 2  -> Day 2
  Oct 3  -> Day 3
*/
export function calculateArcDay(startDate) {
  if (!startDate) {
    return 1;
  }

  const start = parseLocalDate(startDate);

  const today = new Date();

  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const difference =
    today.getTime() - start.getTime();

  const daysPassed =
    Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

  const currentDay = daysPassed + 1;

  /*
    Before start date
  */
  if (currentDay < 1) {
    return 1;
  }

  /*
    Don't go beyond Day 90
  */
  if (currentDay > TOTAL_DAYS) {
    return TOTAL_DAYS;
  }

  return currentDay;
}

/*
  Returns the next calendar midnight.

  The app can use this to automatically
  move to the next ARC day.
*/
export function getNextMidnight() {
  const now = new Date();

  const nextMidnight = new Date(now);

  nextMidnight.setHours(24, 0, 0, 0);

  return nextMidnight;
}

/*
  Milliseconds remaining until midnight.
*/
export function getMillisecondsUntilMidnight() {
  const now = new Date();
  const midnight = getNextMidnight();

  return midnight.getTime() - now.getTime();
}

/*
  Create a fresh copy of goals for a new day.

  The goal definitions remain the same,
  but completion resets to false.
*/
export function resetGoalsForNewDay(goals) {
  return goals.map((goal) => ({
    ...goal,
    completed: false,
  }));
}

/*
  Create a daily record.
*/
export function createDayRecord({
  day,
  status,
  goals = [],
  optionalGoals = [],
  submittedAt = null,
}) {
  const completedGoals = goals.filter(
    (goal) => goal.completed
  ).length;

  const totalGoals = goals.length;

  const completion =
    totalGoals > 0
      ? Math.round(
          (completedGoals / totalGoals) * 100
        )
      : 0;

  return {
    day,
    status,
    completedGoals,
    totalGoals,
    completion,
    goals,
    optionalGoals,
    submittedAt,
    recordedAt: new Date().toISOString(),
  };
}

/*
  Check whether a day was submitted.

  This is important because:
  submitted = completed day tracking
  missed    = no submission before midnight
*/
export function isDaySubmitted(dayRecords, day) {
  const record = dayRecords[day];

  return record?.status === "submitted";
}

/*
  Mark a day as missed.
*/
export function createMissedDayRecord(day, goals = [], optionalGoals = []) {
  return {
    day,
    status: "missed",
    completedGoals: 0,
    totalGoals: goals.length,
    completion: 0,
    goals: resetGoalsForNewDay(goals),
    optionalGoals: resetGoalsForNewDay(optionalGoals),
    submittedAt: null,
    recordedAt: new Date().toISOString(),
  };
}

/*
  Determine ARC status.
*/
export function calculateArcStatus(dayRecords, currentDay) {
  const missedDays = Object.values(dayRecords).filter(
    (record) => record.status === "missed"
  );

  if (missedDays.length > 0 && currentDay < TOTAL_DAYS) {
    return "failed";
  }

  if (currentDay >= TOTAL_DAYS) {
    const day90 = dayRecords[90];

    if (day90?.status === "submitted") {
      return missedDays.length > 0
        ? "failed"
        : "completed";
    }

    return missedDays.length > 0
      ? "failed"
      : "active";
  }

  return "active";
}

/*
  Return a list of missed days.
*/
export function getMissedDays(dayRecords) {
  return Object.values(dayRecords)
    .filter(
      (record) => record.status === "missed"
    )
    .map((record) => record.day)
    .sort((a, b) => a - b);
}

export { TOTAL_DAYS };