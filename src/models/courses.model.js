const { faker } = require("@faker-js/faker");

const knex = require("./knex");

const TABLE_NAME = "courses";

const createCourse = (trx, data) => {
	return trx(TABLE_NAME).insert(data).returning(["course_id", "name", "created_at"]);
};

const createCategory = async (trx, name) => {
	const [category] = await trx("categories").insert({ name }).returning("category_id");

	const categoryId = category.category_id;
	return categoryId;
};

const createCourseModules = (trx, courseId, modules) => {
	const dataToInsert = modules.map((module) => ({
		course_id: courseId,
		title: module.title
	}));

	return trx("modules").insert(dataToInsert);
};

const createCourseCategoryRelation = (trx, courseId, categories) => {
	const dataToInsert = categories.map((categoryId) => ({ course_id: courseId, category_id: categoryId }));
	return trx("course_categories").insert(dataToInsert);
};

const getAllCourses = async (trx, filters) => {
	const { search, topic, sortBy, order } = filters;

	const query = trx({ c: TABLE_NAME })
		.select(
			"c.course_id",
			"c.name",
			"c.tagline",
			"c.description",
			"c.slug",
			"c.price",
			"c.discounted_price",
			"c.is_discount",
			"c.thumbnail_img_url",
			trx.raw("count(uc.user_id)::int as total_students_enrolled"),
			trx.raw("array_agg(distinct cat.name) as categories"),
			trx.raw(
				`
				(
					SELECT jsonb_agg(modules_row ORDER BY (modules_row->>'module_id')::int)
					FROM (
						SELECT DISTINCT jsonb_build_object('module_id', m.module_id, 'title', m.title) as modules_row
						FROM modules m
						WHERE m.course_id = c.course_id
					) as sub
				) as modules
			`
			)
		)
		.leftJoin({ uc: "user_course" }, "c.course_id", "uc.course_id")
		.leftJoin({ cc: "course_categories" }, "c.course_id", "cc.course_id")
		.leftJoin({ cat: "categories" }, "cc.category_id", "cat.category_id")
		.groupBy("c.course_id");

	if (search) {
		query.whereILike("c.name", `%${search}%`);
	}

	if (topic) {
		query.whereIn("c.course_id", function () {
			this.select("cc.course_id")
				.from("course_categories as cc")
				.leftJoin("categories as cat", "cc.category_id", "cat.category_id")
				.whereILike("cat.name", `%${topic}%`);
		});
	}

	if (sortBy && order) {
		query.orderBy(sortBy, order);
	}

	if (sortBy && !order) {
		query.orderBy(sortBy, "desc");
	}

	const courses = await query;

	return courses;
};

const getCoursesWithFilter = async (filter) => {};

const getCourseById = async (courseId) => {
	return knex({ c: TABLE_NAME })
		.select(
			"c.course_id",
			"c.name",
			"c.tagline",
			"c.description",
			"c.slug",
			"c.price",
			"c.discounted_price",
			"c.is_discount",
			"c.thumbnail_img_url",
			knex.raw("count(uc.user_id)::int as total_students_enrolled"),
			knex.raw("array_agg(distinct cat.name) as categories"),
			knex.raw(
				`
					(
						SELECT jsonb_agg(modules_row ORDER BY (modules_row->>'module_id')::int)
						FROM (
							SELECT DISTINCT jsonb_build_object('module_id', m.module_id, 'title', m.title) as modules_row
							FROM modules m
							WHERE m.course_id = c.course_id
						) as sub
					) as modules
				`
			)
		)
		.leftJoin({ uc: "user_course" }, "c.course_id", "uc.course_id")
		.leftJoin({ cc: "course_categories" }, "c.course_id", "cc.course_id")
		.leftJoin({ cat: "categories" }, "cc.category_id", "cat.category_id")
		.where("c.course_id", courseId)
		.groupBy("c.course_id")
		.first();
};

const getCourseByName = async (name) => {
	return knex(TABLE_NAME).select("course_id").where({ name }).first();
};

const getCourseCategories = async (trx, courseId) => {
	return trx("course_categories").select("category_id").where({ course_id: courseId });
};

const getCategoryIdByName = async (trx, name) => {
	const category = await trx("categories").select("category_id").where({ name }).first();

	if (!category) return null;

	return category.category_id;
};

const getTotalEnrolledStudents = async (trx, courseId) => {
	const { total_students_enrolled } = await trx("user_course")
		.count("user_id", { as: "total_students_enrolled" })
		.where({ course_id: courseId })
		.first();

	return parseInt(total_students_enrolled, 10);
};

const updateCourse = async (trx, courseId, data) => {
	return trx(TABLE_NAME)
		.update(data)
		.where("course_id", courseId)
		.returning([
			"course_id",
			"name",
			"tagline",
			"description",
			"slug",
			"price",
			"is_discount",
			"discounted_price",
			"thumbnail_img_url",
			"updated_at"
		]);
};

const deleteCourse = async (courseId) => {
	return knex(TABLE_NAME).where("course_id", courseId).del();
};

const deleteCategory = (trx, courseId, categoryIds) => {
	return trx("course_categories").where({ course_id: courseId }).whereIn("category_id", categoryIds).del();
};

module.exports = {
	createCourse,
	createCategory,
	createCourseModules,
	createCourseCategoryRelation,
	getAllCourses,
	getCourseById,
	getCourseByName,
	getCourseCategories,
	getCategoryIdByName,
	getTotalEnrolledStudents,
	updateCourse,
	deleteCourse,
	deleteCategory,
	tableName: TABLE_NAME
};
