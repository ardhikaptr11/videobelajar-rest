const express = require("express");
const router = express.Router();

const {
	handleCreateNewCourse,
	handleGetAllCourses,
	handleGetOneCourse,
	handleUpdateCourseData,
	handleDeleteCourseData
} = require("../controllers/course.controller");

// Get all courses
router.get("/courses", handleGetAllCourses);
// Get one course by ID
router.get("/course/:id", handleGetOneCourse);
// Create new course
router.post("/course", handleCreateNewCourse);
// Update course
router.patch("/course/:id", handleUpdateCourseData);
// Delete course
router.delete("/course/:id", handleDeleteCourseData);

module.exports = router;
