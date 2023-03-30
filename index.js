// express init
const Data = require("./data/paper-journals.json");
const WosData = require("./data/data.json");
const Subjects = require("./data/subjects.json");
const ClassSchedules = require("./data/class-schedule.json");
const express = require("express");

// handle cors
const cors = require("cors");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

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
  console.log(subjectID);
  const subjectSchedules = ClassSchedules.filter(
    (item) => item["Хичээлийн_дугаар"] === subjectID
  );
  const uniqueProfessors = [
    ...new Set(subjectSchedules.map((item) => item["Заасан_багшийн_нэр"])),
  ];
  res.send(uniqueProfessors);
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
