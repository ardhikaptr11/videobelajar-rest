const path = require("path");
const request = require("supertest");

require("@dotenvx/dotenvx").config({
	path: path.join(__dirname, "../../.env.test")
});

const createServer = require("../utils/server");

const app = createServer();

const testConfig = require("../config/database").test;
const knex = require("knex")(testConfig);

describe("Courses", () => {
	const adminToken = process.env.ADMIN_TOKEN;
	const userToken = process.env.USER_TOKEN;

	// Run migrations and seed the database before running the tests
	beforeAll(async () => {
		await knex.migrate.latest();
		await knex.seed.run({ specific: "02_dummyCourses.seed.js" });
	}, 20000);

	// Get all courses test cases
	describe("GET /api/v2/courses", () => {
		it("should return 200 and retrieved all courses for user and admin login", async () => {
			const [adminResponse, userResponse] = await Promise.all([
				request(app).get("/api/v2/courses").set("Authorization", `Bearer ${adminToken}`),
				request(app).get("/api/v2/courses").set("Authorization", `Bearer ${userToken}`)
			]);

			[adminResponse, userResponse].forEach((response) => {
				expect(response.statusCode).toBe(200);
				expect(response.body).toHaveProperty("data");
				expect(response.body.data).toBeInstanceOf(Array);
				expect(response.body.data.length).toBeGreaterThan(0);
			});
		});

		it("should return 200 and retrieved all courses matched the query string", async () => {
			const responses = await Promise.all([
				request(app).get("/api/v2/courses?search=ui/ux").set("Authorization", `Bearer ${adminToken}`),
				request(app)
					.get("/api/v2/courses?topic=internet%20technologies")
					.set("Authorization", `Bearer ${userToken}`),
				request(app)
					.get("/api/v2/courses?topic=web%20development&sortBy=price&order=asc")
					.set("Authorization", `Bearer ${adminToken}`)
			]);

			responses.forEach((response) => {
				expect(response.statusCode).toBe(200);
			});

			// If only one course is returned, then the data should be an object
			if (responses[0].body.message === "Course successfully retrieved!") {
				expect(responses[0].body.data).toBeInstanceOf(Object);
			} else {
				expect(responses[0].body.data).toBeInstanceOf(Array);
			}

			expect(responses[1].body.data).toBeInstanceOf(Array);
			expect(responses[1].body.data[0].categories).toEqual(expect.arrayContaining(["Internet Technologies"]));

			expect(responses[2].body.data).toBeInstanceOf(Array);
			expect(responses[2].body.data[0].price).toBeLessThanOrEqual(responses[2].body.data[1].price);
		});

		it("should return 404 and an empty array if no data matched the query string", async () => {
			const response = await request(app)
				.get("/api/v2/courses?search=nonexistent")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.statusCode).toBe(404);
			expect(response.body.data).toEqual([]);
		});

		it("should return 200 if no data was recorded when the request was made", async () => {
			await knex.transaction(async (trx) => {
				await trx.raw(`SET LOCAL "app.role" = 'admin'`);
				await trx("courses").del();
			});

			const [adminResponse, userResponse] = await Promise.all([
				request(app).get("/api/v2/courses").set("Authorization", `Bearer ${adminToken}`),
				request(app).get("/api/v2/courses").set("Authorization", `Bearer ${userToken}`)
			]);

			console.log(adminResponse.body);

			[adminResponse, userResponse].forEach((response) => {
				expect(response.statusCode).toBe(200);
				expect(response.body).toHaveProperty("data");
				expect(response.body.data).toEqual(null);
			});
		});
	});

	// Get one course by ID test cases
	describe("GET /api/v2/course/:id", () => {
		beforeAll(async () => {
			// Seed the database with dummy data after the deletion in the previous test
			await knex.seed.run({ specific: "02_dummyCourses.seed.js" });
		}, 10000);

		it("should return 200 and retieved one course matched the id", async () => {
			const id = 1;
			const [adminResponse, userResponse] = await Promise.all([
				request(app).get(`/api/v2/course/${id}`).set("Authorization", `Bearer ${adminToken}`),
				request(app).get(`/api/v2/course/${id}`).set("Authorization", `Bearer ${userToken}`)
			]);

			[adminResponse, userResponse].forEach((response) => {
				expect(response.statusCode).toBe(200);
				expect(response.body).toHaveProperty("data");
				expect(response.body.data).toBeInstanceOf(Object);
			});
		});

		it("should return 404 if the id is a positive integer number but doesn't exist", async () => {
			const id = 99; // Assume this is an id that has not yet been recorded

			const [adminResponse, userResponse] = await Promise.all([
				request(app).get(`/api/v2/course/${id}`).set("Authorization", `Bearer ${adminToken}`),
				request(app).get(`/api/v2/course/${id}`).set("Authorization", `Bearer ${userToken}`)
			]);

			[adminResponse, userResponse].forEach((response) => {
				expect(response.statusCode).toBe(404);
				expect(response.body.data).toEqual(null);
			});
		});

		it("should return 400 if the id is not a positive integer number", async () => {
			const invalidIds = [-1, 0, 0.5, "'1'", "abc"];

			for (const id of invalidIds) {
				const [userResponse, adminResponse] = await Promise.all([
					request(app).get(`/api/v2/course/${id}`).set("Authorization", `Bearer ${adminToken}`),
					request(app).get(`/api/v2/course/${id}`).set("Authorization", `Bearer ${userToken}`)
				]);

				[userResponse, adminResponse].forEach((response) => {
					expect(response.statusCode).toBe(400);
				});
			}
		});
	});

	// Create a new course test cases
	describe("POST /api/v2/course", () => {
		const exampleCoursePayload = {
			name: "Test Course",
			tagline: "Test Tagline",
			description: "Test Description",
			price: 200,
			thumbnail_img_url: "https://example.com/image.jpg",
			categories: ["Category 1", "Category 2"],
			modules: [
				{
					title: "Module 1"
				},
				{
					title: "Module 2"
				}
			]
		};

		it("should allow only admin to create a new course", async () => {
			const [adminResponse, userResponse] = await Promise.all([
				request(app)
					.post("/api/v2/course")
					.send(exampleCoursePayload)
					.set("Authorization", `Bearer ${adminToken}`),
				request(app)
					.post("/api/v2/course")
					.send(exampleCoursePayload)
					.set("Authorization", `Bearer ${userToken}`)
			]);

			expect(adminResponse.statusCode).toBe(201);
			expect(adminResponse.body).toHaveProperty("data");
			expect(adminResponse.body.data).toEqual(
				expect.objectContaining({
					course_id: expect.any(Number),
					name: exampleCoursePayload.name,
					categories: exampleCoursePayload.categories,
					total_students_enrolled: 0,
					created_at: expect.any(String)
				})
			);

			expect(userResponse.statusCode).toBe(403);
			expect(userResponse.body.message).toBe("You are not allowed to perform this action");
		});

		it("should return 400 if the mandatory fields are missing", async () => {
			// Make a copy of the exampleCoursePayload to avoid modifying the original
			// which will cause conflicts with subsequent tests
			const exampleCoursePayloadCopy = { ...exampleCoursePayload };
			delete exampleCoursePayloadCopy.price; // price is mandatory but missing

			const response = await request(app)
				.post("/api/v2/course")
				.send(exampleCoursePayloadCopy)
				.set("Authorization", `Bearer ${adminToken}`);
			expect(response.statusCode).toBe(400);
			expect(response.body.message).toBe("Please make sure all fields are filled in");
		});

		it("should return 400 if the payload is empty", async () => {
			const response = await request(app)
				.post("/api/v2/course")
				.send({})
				.set("Authorization", `Bearer ${adminToken}`);
			expect(response.statusCode).toBe(400);
			expect(response.body.message).toBe("Cannot proceed with empty data");
		});

		it("should return 400 if price is not a positive integer number", async () => {
			const exampleCoursePayloadCopy = { ...exampleCoursePayload };
			const invalidPrices = [-200, 100.5, "'200'"];
			const invalidDiscountedPrices = [-100, 50.5, "'100'"];

			for (const price of invalidPrices) {
				exampleCoursePayloadCopy.price = price;
				exampleCoursePayloadCopy.is_discount = true;
				for (const discountedPrice of invalidDiscountedPrices) {
					exampleCoursePayloadCopy.discounted_price = discountedPrice;

					const response = await request(app)
						.post("/api/v2/course")
						.send(exampleCoursePayloadCopy)
						.set("Authorization", `Bearer ${adminToken}`);

					expect(response.statusCode).toBe(400);
					expect(response.body.message).toBe("Invalid price value");
				}
			}
		});

		it("should return 400 if the discount status is defined true but the discounted price is missing", async () => {
			exampleCoursePayload.is_discount = true;

			const response = await request(app)
				.post("/api/v2/course")
				.send(exampleCoursePayload)
				.set("Authorization", `Bearer ${adminToken}`);
			expect(response.statusCode).toBe(400);
			expect(response.body.message).toBe("Please specify the discounted price");
		});

		it("should return 400 if course discount status is defined false but the discounted price is given", async () => {
			exampleCoursePayload.is_discount = false;
			exampleCoursePayload.discounted_price = 100;

			const response = await request(app)
				.post("/api/v2/course")
				.send(exampleCoursePayload)
				.set("Authorization", `Bearer ${adminToken}`);
			expect(response.statusCode).toBe(400);
			expect(response.body.message).toBe("Discounted price is not applicable");
		});

		it("should return 409 if the course name already exists", async () => {
			// is_discount was defined in the previous test, so remove it to avoid conflict with the previous test
			delete exampleCoursePayload.is_discount;
			delete exampleCoursePayload.discounted_price;

			const response = await request(app)
				.post("/api/v2/course")
				.send(exampleCoursePayload)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.statusCode).toBe(409);
			expect(response.body.message).toBe("Course name already taken");
		});

		it("should return 422 if the discounted price is greater than or equal to the original price", async () => {
			exampleCoursePayload.is_discount = true;
			exampleCoursePayload.discounted_price = exampleCoursePayload.price;

			const response = await request(app)
				.post("/api/v2/course")
				.send(exampleCoursePayload)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.statusCode).toBe(422);

			exampleCoursePayload.discounted_price = exampleCoursePayload.price + 100; // greater than the original price

			const response2 = await request(app)
				.post("/api/v2/course")
				.send(exampleCoursePayload)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response2.statusCode).toBe(422);
		});
	});

	// Update a course test cases
	describe("PATCH /api/v2/course/:id?mode=['default','strict']", () => {
		const exampleDataToUpdate = {
			name: "New Name for Course 10",
			tagline: "New Tagline for Course 10",
			description: "New description for course 10.",
			price: 799,
			is_discount: true,
			discounted_price: 599,
			thumbnail_img_url: "https://example.com/image10.jpg",
			categories: ["Category 3", "Category 4"]
		};

		it("should allow only admin to update courses", async () => {
			const id = 10; //Assume this is the latest course created
			const queryParams = "default";

			const exampleDataToUpdateCopy = { ...exampleDataToUpdate, categories: ["Category 5", "Category 6"] };

			const [defaultMode, strictMode] = await Promise.all([
				request(app)
					.patch(`/api/v2/course/${id}?mode=default`)
					.send(exampleDataToUpdate)
					.set("Authorization", `Bearer ${adminToken}`),
				request(app)
					.patch(`/api/v2/course/${id}?mode=strict`)
					.send(exampleDataToUpdateCopy)
					.set("Authorization", `Bearer ${adminToken}`)
			]);

			[defaultMode, strictMode].forEach((response) => {
				expect(response.statusCode).toBe(200);
				expect(response.body.data).toBeInstanceOf(Object);
			});
		});

		it("should add new unknown categories to the course if using strict mode", async () => {
			const id = 10;
			const latestCategories = ["Category 3", "Category 4", "Category 5", "Category 6"]; // Categories created in the previous test

			const modifiedExampleDataToUpdate = {
				...exampleDataToUpdate,
				categories: ["Category 5", "Category 6", "Category 7"]
			};
			const newCategory = modifiedExampleDataToUpdate.categories.filter(
				(category) => !latestCategories.includes(category)
			);

			const response = await request(app)
				.patch(`/api/v2/course/${id}?mode=strict`)
				.send(modifiedExampleDataToUpdate)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.statusCode).toBe(200);
			expect(response.body.data).toEqual({
				course_id: id,
				name: modifiedExampleDataToUpdate.name,
				slug: expect.any(String),
				tagline: modifiedExampleDataToUpdate.tagline,
				description: modifiedExampleDataToUpdate.description,
				price: modifiedExampleDataToUpdate.price,
				is_discount: modifiedExampleDataToUpdate.is_discount,
				discounted_price: modifiedExampleDataToUpdate.discounted_price,
				total_students_enrolled: expect.any(Number),
				thumbnail_img_url: modifiedExampleDataToUpdate.thumbnail_img_url,
				categories: [...latestCategories, ...newCategory],
				updated_at: expect.any(String)
			});
		});

		it("should return 404 if the id is a positive integer number but doesn't exist", async () => {
			const id = 99;
			const modes = ["default", "strict"];
			for (const mode of modes) {
				const response = await request(app)
					.patch(`/api/v2/course/${id}?mode=${mode}`)
					.send(exampleDataToUpdate)
					.set("Authorization", `Bearer ${adminToken}`);

				expect(response.statusCode).toBe(404);
				expect(response.body.data).toBe(null);
			}
		});

		it("should return 400 if the id is not a positive integer number", async () => {
			const invalidIds = [-1, 0, 0.5, "'1'", "abc"];
			const modes = ["default", "strict"];

			for (const id of invalidIds) {
				for (const mode of modes) {
					const response = await request(app)
						.patch(`/api/v2/course/${id}?mode=${mode}`)
						.send(exampleDataToUpdate)
						.set("Authorization", `Bearer ${adminToken}`);

					expect(response.statusCode).toBe(400);
					expect(response.body.message).toBe("Course ID must be a positive integer number");
				}
			}
		});

		it("should return 400 if the category property does not exist or the value is empty", async () => {
			const id = 1;

			const scenarioData1 = {
				...exampleDataToUpdate
			};
			delete scenarioData1.categories; // Remove the categories property

			// If mode is not provided, it defaults to "default"
			const response1 = await request(app)
				.patch(`/api/v2/course/${id}`)
				.send(scenarioData1)
				.set("Authorization", `Bearer ${adminToken}`);
			expect(response1.statusCode).toBe(400);
			expect(response1.body.message).toBe("Failed to overwrite. No category provided");

			const scenarioData2 = {
				...scenarioData1,
				categories: []
			};

			const response2 = await request(app)
				.patch(`/api/v2/course/${id}?mode=strict`)
				.send(scenarioData2)
				.set("Authorization", `Bearer ${adminToken}`);
			expect(response2.statusCode).toBe(400);
			expect(response2.body.message).toBe("Failed to append. No category provided");

			const response3 = await request(app)
				.patch(`/api/v2/course/${id}?mode=default`)
				.send(scenarioData1)
				.set("Authorization", `Bearer ${adminToken}`);
			expect(response3.body.message).toBe("Failed to overwrite. No category provided");
		});

		it("should return 400 if the mode is unknown", async () => {
			const id = 1;
			const exampleInvalidMode = ["1", ".", "''", "replace", "add", "overwrite"];

			for (const mode of exampleInvalidMode) {
				const response = await request(app)
					.patch(`/api/v2/course/${id}?mode=${mode}`)
					.send(exampleDataToUpdate)
					.set("Authorization", `Bearer ${adminToken}`);
				expect(response.statusCode).toBe(400);
				expect(response.body.message).toBe("Unknown mode. Mode must be either 'default' or 'strict'");
			}
		});

		it("should return 400 if the payload is empty", async () => {
			const id = 1;
			const response = await request(app)
				.patch(`/api/v2/course/${id}`)
				.send({})
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.statusCode).toBe(400);
			expect(response.body.message).toBe("Cannot proceed with empty data");
		});

		it("should return 400 if price is not a positive integer number", async () => {
			const id = 1;
			const invalidPrices = [-200, 100.5, "'200'"];
			const invalidDiscountedPrices = [-100, 50.5, "'100'"];

			for (const price of invalidPrices) {
				for (const discountedPrice of invalidDiscountedPrices) {
					const response = await request(app)
						.patch(`/api/v2/course/${id}?mode=strict`)
						.send({ price, discounted_price: discountedPrice })
						.set("Authorization", `Bearer ${adminToken}`);

					expect(response.statusCode).toBe(400);
					expect(response.body.message).toBe("Invalid price value");
				}
			}
		});

		it("should return 400 if the discount status is defined true but the discounted price is missing", async () => {
			const id = 1;
			const modes = ["default", "strict"];
			for (const mode of modes) {
				const response = await request(app)
					.patch(`/api/v2/course/${id}?mode=${mode}`)
					.send({ is_discount: true })
					.set("Authorization", `Bearer ${adminToken}`);

				expect(response.statusCode).toBe(400);
				expect(response.body.message).toBe("Please specify the discounted price");
			}
		});

		it("should return 400 if course discount status is defined false but the discounted price is given", async () => {
			const id = 1;
			const modes = ["default", "strict"];
			for (const mode of modes) {
				const response = await request(app)
					.patch(`/api/v2/course/${id}?mode=${mode}`)
					.send({ is_discount: false, discounted_price: 100 })
					.set("Authorization", `Bearer ${adminToken}`);

				expect(response.statusCode).toBe(400);
				expect(response.body.message).toBe("Discounted price is not applicable");
			}
		});

		it("should return 409 if the course category is to be replaced or added with the current course category", async () => {
			const id = 10;
			const currentCategories = ["Category 3", "Category 4"]; // Categories created in the previous test

			const response1 = await request(app)
				.patch(`/api/v2/course/${id}?mode=strict`)
				.send({ is_discount: true, discounted_price: 399, categories: currentCategories })
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response1.statusCode).toBe(409);
			expect(response1.body.message).toBe("Course already has the intended category");

			const response2 = await request(app)
				.patch(`/api/v2/course/${id}`)
				.send({ is_discount: true, discounted_price: 399, categories: currentCategories })
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response2.statusCode).toBe(409);
			expect(response2.body.message).toBe("Cannot override predefined categories with the exact same name");
		});

		it("should return 422 if the discounted price is greater than or equal to the original price", async () => {
			const id = 1;
			const modes = ["default", "strict"];

			const exampleInvalidPayload1 = {
				...exampleDataToUpdate,
				price: 200,
				is_discount: true,
				discounted_price: 200
			};

			const exampleInvalidPayload2 = {
				...exampleDataToUpdate,
				price: 200,
				is_discount: true,
				discounted_price: 300
			};

			for (const mode of modes) {
				const response1 = await request(app)
					.patch(`/api/v2/course/${id}?mode=${mode}`)
					.send(exampleInvalidPayload1)
					.set("Authorization", `Bearer ${adminToken}`);

				expect(response1.statusCode).toBe(422);
				expect(response1.body.message).toBe("Discounted price cannot be equal or exceed the original price");

				const response2 = await request(app)
					.patch(`/api/v2/course/${id}?mode=${mode}`)
					.send(exampleInvalidPayload2)
					.set("Authorization", `Bearer ${adminToken}`);

				expect(response2.statusCode).toBe(422);
				expect(response2.body.message).toBe("Discounted price cannot be equal or exceed the original price");
			}
		});
	});

	// Delete a course test cases
	describe("DELETE /api/v2/course/:id", () => {
		it("should allow only admin to delete courses", async () => {
			const id = 1;

			const [adminResponse, userResponse] = await Promise.all([
				request(app).delete(`/api/v2/course/${id}`).set("Authorization", `Bearer ${adminToken}`),
				request(app).delete(`/api/v2/course/${id}`).set("Authorization", `Bearer ${userToken}`)
			]);

			expect(adminResponse.statusCode).toBe(200);
			expect(adminResponse.body.data).toEqual(null);

			expect(userResponse.statusCode).toBe(403);
			expect(userResponse.body.message).toBe("You are not allowed to perform this action");
		});

		it("should return 200 if the course ID is a positive integer number but doesn't exist", async () => {
			const id = 99; // Assume this is an id that has not yet been recorded
			const response = await request(app)
				.delete(`/api/v2/course/${id}`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.statusCode).toBe(200);
			expect(response.body.data).toEqual(null);
		});

		it("should return 400 if the id is not a positive integer number", async () => {
			const invalidIds = [-1, 0, 0.5, "'1'", "abc"];

			for (const id of invalidIds) {
				const response = await request(app)
					.delete(`/api/v2/course/${id}`)
					.set("Authorization", `Bearer ${adminToken}`);

				expect(response.statusCode).toBe(400);
			}
		});
	});

	// Reset the database after all tests
	// This is important to ensure that the database is clean for the next test run
	afterAll(async () => {
		await knex.migrate.rollback();
		knex.destroy();
	});
});
