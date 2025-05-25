const express = require("express");
const router = express.Router();

const { validateRoleAccess, validateDataBeforeProceed } = require("../middleware/validation.middleware");
const authenticate = require("../middleware/auth.middleware");

const {
	handleCreateNewCourse,
	handleGetAllCourses,
	handleGetOneCourse,
	handleUpdateCourseData,
	handleDeleteCourseData
} = require("../controllers/course.controller");

// Get all courses
router.get("/courses", authenticate, validateRoleAccess, handleGetAllCourses);
// Get one course by ID
router.get("/course/:id", authenticate, validateRoleAccess, validateDataBeforeProceed, handleGetOneCourse);
// Create new course
router.post("/course", authenticate, validateRoleAccess, validateDataBeforeProceed, handleCreateNewCourse);
// Update course
router.patch("/course/:id", authenticate, validateRoleAccess, validateDataBeforeProceed, handleUpdateCourseData);
// Delete course
router.delete("/course/:id", authenticate, validateRoleAccess, validateDataBeforeProceed, handleDeleteCourseData);

module.exports = router;
