const { faker } = require("@faker-js/faker");

const knex = require("./knex");

const TABLE_NAME = "courses";

const createCourse = async (data) => {
	const { name, tagline, description, total_modules, price, thumbnail_img_url, categories } = data;

	const slug = faker.helpers.slugify(name.replace(/\/| - |-/g, " ").toLocaleLowerCase());

	const categoriesMappedIds = await Promise.all(
		categories.map(async (name) => {
			const categoryId = await knex("categories").select("category_id").where({ name }).first();

			if (!categoryId) {
				const [newCategory] = await knex("categories").insert({ name }).returning("category_id");

				return newCategory.category_id;
			}

			return categoryId.category_id;
		})
	);

	const [course] = await knex(TABLE_NAME)
		.insert({
			name,
			tagline,
			description,
			slug,
			total_modules,
			price,
			thumbnail_img_url
		})
		.returning(["course_id", "name"]);

	course.total_students_enrolled = 0;
	course.categories = categories;
	course.created_at = new Date();

	const courseCategories = categoriesMappedIds.map((categoryId) => ({
		course_id: course.course_id,
		category_id: categoryId
	}));

	await Promise.all(courseCategories.map((category) => knex("course_categories").insert(category)));

	return course;
};

const getAllCourses = async () => {
	return knex({ c: TABLE_NAME })
		.select(
			"c.course_id",
			"c.name",
			"c.tagline",
			"c.description",
			"c.slug",
			"c.total_modules",
			"c.price",
			"c.discounted_price",
			"c.is_discount",
			"c.thumbnail_img_url",
			knex.raw("count(uc.user_id) total_students_enrolled"),
			knex.raw("array_agg(distinct cat.name) categories")
		)
		.leftJoin({ uc: "user_course" }, "c.course_id", "uc.course_id")
		.leftJoin({ cc: "course_categories" }, "c.course_id", "cc.course_id")
		.leftJoin({ cat: "categories" }, "cc.category_id", "cat.category_id")
		.groupBy("c.course_id")
		.orderBy("c.course_id", "asc");
};

const getCourseById = async (courseId) => {
	return knex({ c: TABLE_NAME })
		.select(
			"c.course_id",
			"c.name",
			"c.tagline",
			"c.description",
			"c.slug",
			"c.total_modules",
			"c.price",
			"c.discounted_price",
			"c.is_discount",
			"c.thumbnail_img_url",
			knex.raw("count(uc.user_id) total_students_enrolled"),
			knex.raw("array_agg(distinct cat.name) categories")
		)
		.leftJoin({ uc: "user_course" }, "c.course_id", "uc.course_id")
		.leftJoin({ cc: "course_categories" }, "c.course_id", "cc.course_id")
		.leftJoin({ cat: "categories" }, "cc.category_id", "cat.category_id")
		.groupBy("c.course_id")
		.where("c.course_id", courseId)
		.first();
};

const getCourseByName = async (name) => {
	return knex(TABLE_NAME).where({ name }).first();
};

const updateCourse = async (courseId, data, paramValue) => {
	if (data.name) {
		const slug = faker.helpers.slugify(data.name.replace(/\/| - |-/g, " ").toLowerCase());
		data.slug = slug;
	}

	if (data.categories && paramValue === "replace") {
		const categoryNames = data.categories;

		const categories = await knex("categories").select("category_id").whereIn("name", categoryNames);
		const categoriesMappedIds = categories.map((category) => category.category_id);

		const currentCategories = await knex("course_categories").select("category_id").where({ course_id: courseId });
		const currentCategoryIds = currentCategories.map((c) => c.category_id);

		await knex.transaction(async (trx) => {
			await trx("course_categories")
				.where({ course_id: courseId })
				.whereIn("category_id", currentCategoryIds)
				.del();

			await trx("course_categories").insert(
				categoriesMappedIds.map((categoryId) => ({
					course_id: courseId,
					category_id: categoryId
				}))
			);
		});
	}

	delete data.categories;
	await knex(TABLE_NAME).update(data).where("course_id", courseId);

	const updatedCourse = await getCourseById(courseId);
	return updatedCourse;
};

const deleteCourse = async (courseId) => {
	const currentCategories = await knex("course_categories").select("category_id").where({ course_id: courseId });
	const currentCategoryIds = currentCategories.map((c) => c.category_id);

	await knex.transaction(async (trx) => {
		await trx("course_categories").where({ course_id: courseId }).whereIn("category_id", currentCategoryIds).del();
	});

	return knex(TABLE_NAME).where("course_id", courseId).del();
};

// const categoriesToInsert = categoriesMappedIds.filter((categoryId) => !currentCategoryIds.includes(categoryId));
// const currentCategories = await knex("course_categories").select("category_id").where({ course_id: courseId });

// const currentCategoryIds = currentCategories.map((category) => category.category_id);

// const anyMatchingCategory = categoriesMappedIds.some((categoryId) => currentCategoryIds.includes(categoryId));

// if (anyMatchingCategory) {
// 	return;
// }

// data = {
// 	name: "Course Name",
// 	tagline: "Course Tagline",
// 	description: "Course Description",
// 	total_modules: 10,
// 	price: 399,
// 	thumbnail_img_url: "https://example.com/image.jpg",
// 	categories: ["Web Development", "Security Development", "Internet Technologies"]
// };

// updateCourse(1, data, "replace");

// data = {
// 	"name": "Course Name",
// 	"tagline": "Course Tagline",
// 	"description": "Course Description",
// 	"total_modules": 10,
// 	"price": 399,
// 	"thumbnail_img_url": "https://example.com/image.jpg",
// 	"categories": ["Category 1", "Category 2"]
// }

module.exports = {
	createCourse,
	getAllCourses,
	getCourseById,
	getCourseByName,
	updateCourse,
	deleteCourse,
	tableName: TABLE_NAME
};
