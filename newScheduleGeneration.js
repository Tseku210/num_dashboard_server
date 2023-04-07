function overlap(a, b) {
  return (
    a.dayOfWeek === b.dayOfWeek &&
    ((a.startTime >= b.startTime && a.startTime < b.endTime) ||
      (a.endTime > b.startTime && a.endTime <= b.endTime))
  );
}

function generateSchedules(subjects, currentSchedule = [], allSchedules = []) {
  if (subjects.length === 0) {
    allSchedules.push(currentSchedule);
    return;
  }

  const [currentSubject, ...remainingSubjects] = subjects;

  const lectures = currentSubject.variations.filter((s) => s.type === "Лекц");
  const seminarsOrLabs = currentSubject.variations.filter(
    (s) => s.type !== "Лекц"
  );

  const combinations = [];

  for (const lecture of lectures) {
    if (seminarsOrLabs.length === 0) {
      // If there are no seminars or labs, add lecture as is
      combinations.push([lecture]);
    } else {
      for (const seminarOrLab of seminarsOrLabs) {
        if (!overlap(lecture, seminarOrLab)) {
          // If there are no time conflicts, add lecture and seminar/lab
          combinations.push([lecture, seminarOrLab]);
        }
      }
    }
  }

  let subjectAdded = false;

  for (const combination of combinations) {
    if (
      !combination.some((session) =>
        currentSchedule.some((s) => overlap(s, session))
      )
    ) {
      subjectAdded = true;
      generateSchedules(
        remainingSubjects,
        [...currentSchedule, { ...currentSubject, variations: combination }],
        allSchedules
      );
    }
  }

  // If no combination could be added, just move on to the next subject
  if (!subjectAdded) {
    generateSchedules(remainingSubjects, currentSchedule, allSchedules);
  }

  return allSchedules;
}

module.exports = generateSchedules;
