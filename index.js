const Data = require("./data/paper-journals.json");
const WosData = require("./data/data.json");
const Subjects = require("./data/subjects.json");
const ClassSchedules = require("./data/class-schedule.json");
const Difficulties = require("./data/difficulties.json");
const generateSchedules = require("./newScheduleGeneration.js");
const express = require("express");
const bodyParser = require("body-parser");
const { PythonShell } = require("python-shell");

const cors = require("cors");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(bodyParser.json());

app.get("/graph", (req, res) => {
  console.log("requesting graph data");
  const wos = {};
  WosData.forEach((item) => {
    item["DOI"] !== "" ? (wos[item["DOI"]] = true) : null;
  });
  const newData = Data.map((item, index) => ({
    id: index,
    ...item,
    wos: wos[item["DOI"]] || false,
  }));
  res.send(newData);
});

app.get("/subjects", (req, res) => {
  console.log("requesting subjects data");
  const subjects = Subjects.map((item) => ({
    id: item["Хичээлийн_дугаар"],
    name: item["Монгол_нэр"],
  }));
  const uniqueSubjects = [...new Set(subjects)];
  res.send(uniqueSubjects);
});

app.get("/:subjectID/professors", (req, res) => {
  console.log("requesting professors data");
  const { subjectID } = req.params;
  const subjectSchedules = ClassSchedules.filter(
    (item) => item["Хичээлийн_дугаар"] === subjectID
  );
  const uniqueProfessors = [
    ...new Set(subjectSchedules.map((item) => item["Заасан_багшийн_нэр"])),
  ];
  res.send(uniqueProfessors);
});

app.post("/schedule", (req, res) => {
  const schedules = req.body;
  console.log(schedules);

  const allSchedules = generateSchedules(schedules.subjects);

  res.send(allSchedules);
});

app.get("/:subjectName/difficulty", (req, res) => {
  const { subjectName } = req.params;
  const subject = Difficulties.find((item) => item["Course"] === subjectName);
  console.log(subject);
  res.send(subject);
});

app.post("/recommendations", async (req, res) => {
  console.log("course", req.body);
  const course_id = req.body.course_id;
  const options = {
    scriptPath: "./", // Set the path to your Python script
    args: [course_id],
  };

  PythonShell.run("recommend.py", options, (err, results) => {
    if (err) {
      res
        .status(500)
        .send({ error: "An error occurred while generating recommendations" });
      console.error(err);
      return;
    }

    const recommendations = JSON.parse(results[0]);
    res.send(recommendations);
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
