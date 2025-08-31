const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const student = require("../services/student");
const { User } = require("../models/user");
const { Test } = require("../services/testpaper");

router.post("/register", student.registerStudent);
router.post("/questions", auth, student.getTestQuestions);
router.post("/responseSheet", auth, student.responseSheet);
router.post("/updateResponse", auth, student.updateResponse);
router.post("/endTest", auth, student.endTest);
router.post("/details", auth, student.getStudent);
router.post("/test/start-time", auth, student.getTestStartTime);
router.post("/test/category", auth, student.getTestCategory);
router.post("/pdf/upload", auth, student.uploadPdfResponse);
router.post("/responseSheet/pdf", auth, student.getResponsePdf);
router.get("/alltest", auth, student.getStudentAllTest);
// ✅ New Route for fetching all registered students
router.get("/all", student.getAllStudents);
// routes/student.js
router.delete("/:id", async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).send("Student not found");
    res.status(200).send({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
