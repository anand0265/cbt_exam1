const { User } = require("../models/user");
const TestPaper = require("../models/testpaper");
const { sendMail } = require("./sendMail");
const ResponseSheet = require("../models/responseSheet");
const Response = require("../models/response");
const { validateStudent } = require("./validation");
const bcrypt = require("bcrypt");

const registerStudent = async (req, res) => {
  try {
    const { error } = validateStudent(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { email, password, link, testId } = req.body;

    // Check if test registration is still open
    const paper = await TestPaper.findOne({
      _id: testId,
      isRegistrationAvailable: true,
    });

    if (!paper) {
      return res.status(422).send("Registration for this test has been closed");
    }

    // Find student by email
    let student = await User.findOne({ email });

    if (password && password.trim() !== "") {
      // ✅ If password is provided → Normal student registration flow
      if (!student) {
        return res.status(401).send("Invalid email or password");
      }

      const validPassword = await bcrypt.compare(password, student.password);
      if (!validPassword) {
        return res.status(401).send("Invalid email or password");
      }
    } else {
      // ✅ If password is NOT provided → Teacher sending test link
      if (!student) {
        // If no student exists yet, create a placeholder user (optional)
        student = new User({ email, testId: [] });
        await student.save();
      }
    }

    // Check if already registered for this test
    const check = await User.find({ email, testId: { $in: [testId] } });
    if (check.length !== 0) {
      return res.status(422).send("Student has Already Registered");
    }

    // Push test ID into student's record
    student.testId.push(testId);
    await student.save();

    // Send email with test link
    // sendMail(
    //   email,
    //   "Registered Successfully",
    //   `You have been successfully registered for the test.<br>
    //    Test starts on <b>${paper.startTime}</b> and duration is <b>${paper.duration}</b> minutes.<br><br>
    //    Click on the link to take the test:<br>
    //   "${link}student/test?testid=${testId}&studentid=${student._id}"`
    // );

    sendMail(
      email,
      "Registered Successfully",
      `
  <p>You have been successfully registered for the test.</p>
  <p>Test starts on <b>${paper.startTime}</b> and duration is <b>${paper.duration}</b> minutes.</p>
  <p>You can join the test before 5 minute from starting time </b></p> </b></b>
  <p> Note: Please do not join using a mobile or tablet. Use a laptop only.</p> </b>
  <p>Click the button below to start the test:</p>
  <a href="${link}student/test?testid=${testId}&studentid=${student._id}" 
     style="
        display: inline-block;
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
     ">
     Start Test
  </a>
  <br><br>
  <p>Good luck!</p>
  `
    );

    res.send("Successfully Registered. Check your mail.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getTestQuestions = async (req, res) => {
  const paper = await TestPaper.findById(req.body.id)
    .select(
      "pdf maxMarks questions duration isSnapshots startTime isAudioRec category"
    )
    .populate("questions")
    .populate({
      path: "questions",
      populate: {
        path: "options",

        select: {
          optionBody: 1,
        },
      },
    });

  if (!paper) return res.status(404).send("Testpaper not found");
  res.send(paper);
};

const getStudent = async (req, res) => {
  const student = await User.findById(req.body.id);
  if (!student) return res.status(404).send("Student not exist");

  res.send(student);
};

const responseSheet = async (req, res) => {
  const { studentId, testId } = req.body;

  const student = await User.findOne({ _id: studentId });
  const paper = await TestPaper.findOne({
    _id: testId,
    isTestBegins: true,
    isTestConducted: false,
  });

  if (!student || !paper) return res.status(404).send("Invalid Request");

  let responseSheet = await ResponseSheet.findOne({ studentId, testId })
    .select("responses")
    .populate({
      path: "responses",
      select: {
        chosenOption: 1,
      },
    });

  if (responseSheet) return res.send(responseSheet);
  let responses = null;
  let questions = null,
    pdf = null;
  if (paper.category === "MCQ") {
    questions = paper.questions;

    responses = questions.map((id) => {
      return {
        questionId: id,
        chosenOption: [],
        studentId,
        testId,
      };
    });
    responses = await Response.insertMany(responses);
  }

  responseSheet = new ResponseSheet({
    testId,
    studentId,
    questions,
    responses,
    pdf,
  });
  await responseSheet.save();
  res.send("Test Starts");
};

const updateResponse = async (req, res) => {
  const { testId, studentId, questionId, chosenOption } = req.body;
  const paper = await TestPaper.findById(testId);
  const responseSheet = await ResponseSheet.findOne({
    testId,
    studentId,
    isCompleted: false,
  });

  if (!paper || !responseSheet) return res.status(404).send("Invalid Request");

  const response = await Response.findOneAndUpdate(
    { questionId, studentId, testId },
    { chosenOption }
  );

  if (!response) return res.status(404).send("Question not exist");

  res.send("Response Updated");
};

const endTest = async (req, res) => {
  const { testId, studentId } = req.body;
  const responseSheet = await ResponseSheet.findOneAndUpdate(
    { testId, studentId },
    { isCompleted: true }
  );
  if (!responseSheet) return res.status(404).send("Unable to submit response");
  res.send("Test Submitted Successfully");
};

const getTestStartTime = async (req, res) => {
  //console.log(req.body.testId);
  const { testId } = req.body;
  const paper = await TestPaper.findById(testId).select("startTime");
  if (!paper) return res.status(404).send("Testpaper not found");

  //console.log(paper);
  res.send(paper);
};

const getTestCategory = async (req, res) => {
  const { testId } = req.body;
  const paper = await TestPaper.findById(testId).select("category");
  if (!paper) return res.status(404).send("Testpaper not found");

  res.send(paper.category);
};

const uploadPdfResponse = async (req, res) => {
  const { studentId, testId, pdf } = req.body;
  const student = await User.findOne({ _id: studentId });
  const paper = await TestPaper.findOne({
    _id: testId,
    isTestBegins: true,
    isTestConducted: false,
  });

  if (!student || !paper) return res.status(404).send("Invalid Request");

  const responseSheet = await ResponseSheet.findOneAndUpdate(
    { testId, studentId },
    { pdf }
  );
  if (!responseSheet) return res.status(404).send("ResponseSheet not exist");
  res.send("Response Updated");
};

const getResponsePdf = async (req, res) => {
  const { studentId, testId } = req.body;
  const responseSheet = await ResponseSheet.findOne({ studentId, testId });
  if (!responseSheet) return res.send("Not Attempt");

  res.send(responseSheet.pdf);
};

const getStudentAllTest = async (req, res) => {
  //Retreive all organization tests and group tests
  const testPaper = await User.findById(req.user._id)
    .select("testId group")
    .populate({
      path: "testId",
      select: {
        isTestConducted: 1,
        title: 1,
        duration: 1,
        category: 1,
        paperType: 1,
        startTime: 1,
        subject: 1,
      },
    })
    .populate({
      path: "group",
      select: {
        tests: 1,
      },
      populate: {
        path: "tests",
        select: {
          isTestConducted: 1,
          title: 1,
          duration: 1,
          category: 1,
          paperType: 1,
          startTime: 1,
          subject: 1,
        },
      },
    });
  if (!testPaper) return res.status(404).send("Tests Not Found");

  let organisationtest = testPaper.testId.map((t) => t);

  if (testPaper.group.length) {
    let grouptest = testPaper.group.map((t) => t.tests);
    grouptest = [].concat(...grouptest);
    res.send([...grouptest, ...organisationtest]);
  } else res.send(organisationtest);
};

// add to meeeee
const getAllStudents = async (req, res) => {
  try {
    // Find only users whose category is STUDENT
    const students = await User.find({ category: "STUDENT" }).select(
      "name email"
    );

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getResponsePdf,
  uploadPdfResponse,

  getTestCategory,
  getTestStartTime,
  updateResponse,
  endTest,
  responseSheet,
  getStudent,
  registerStudent,
  getTestQuestions,
  getStudentAllTest,
  // add to mee
  getAllStudents,
};
