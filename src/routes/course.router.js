const express = require("express");
const router = express.Router();

const { createNewCourse, getCourses, getOneCourse, updateCourseData, deleteCourseData } = require("../controllers/course.controller");

// Create new course
router.post("/course", createNewCourse);
// Get all courses
router.get("/courses", getCourses);
// Get one course by ID
router.get("/course/:id", getOneCourse);
// Update course
router.patch("/course/update/:id", updateCourseData);
// Delete course
router.delete("/course/:id", deleteCourseData);

module.exports = router;
