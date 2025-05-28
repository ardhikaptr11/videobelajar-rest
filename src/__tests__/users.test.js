const path = require("path");
const request = require("supertest");
const fs = require("fs");

const tempDir = path.join(__dirname, "../..", "temp");

require("@dotenvx/dotenvx").config({
	path: path.join(__dirname, "../../.env.test")
});

const createServer = require("../utils/server");

const { registerAndLoginUser } = require("../tests/auth.helper");

const app = createServer();

const testConfig = require("../config/database").test;
const knex = require("knex")(testConfig);

describe("Users", () => {
	let userId;
	let userToken;
	const adminToken = process.env.ADMIN_TOKEN;

	const targetId = "6b2b6722-c613-4471-8eea-57e85c869f7b"; // Example of another user's ID in database
	const nonExistUserId = "817b3e11-10b3-47bd-98d0-486569dbdf20"; // Example of a non-existent user ID

	beforeAll(async () => {
		await knex.migrate.latest();
		await knex.seed.run({ specific: "01_dummyUsers.seed.js" });

		[userId, userToken] = await registerAndLoginUser({
			full_name: "John Doe",
			email: "john.doe@example.com",
			gender: "male",
			phone: "812345678901",
			password: "John123!"
		});
	}, 30000);

	describe("JWT Token Check", () => {
		const makeRequestsWithInvalidToken = async (token = "") =>
			await Promise.all([
				request(app).get("/api/v2/users").set("Authorization", token),
				request(app).get(`/api/v2/user/${userId}`).set("Authorization", token),
				request(app)
					.patch(`/api/v2/user/${userId}`)
					.send({ full_name: "John Peter Doe", email: "jp.doe@example.com" })
					.set("Authorization", token),
				request(app).delete(`/api/v2/user/${userId}`).set("Authorization", token)
			]);

		it("should return 401 and forbid access if JWT is invalid or missing", async () => {
			const invalidJWTs = ["Bearer invalid jwt", ""];

			for (const invalidJWT of invalidJWTs) {
				const responses = await makeRequestsWithInvalidToken(invalidJWT);

				responses.forEach((response) => {
					expect(response.statusCode).toBe(401);
					expect(response.body.message).toBe("Authentication failed. Invalid or missing token");
				});
			}
		});
	});

	describe("GET /api/v2/users", () => {
		it("should allow admin and forbid user to access all users data", async () => {
			const [adminResponse, userResponse] = await Promise.all([
				request(app).get("/api/v2/users").set("Authorization", `Bearer ${adminToken}`),
				request(app).get("/api/v2/users").set("Authorization", `Bearer ${userToken}`)
			]);

			expect(adminResponse.statusCode).toBe(200);
			expect(adminResponse.body.data).toBeInstanceOf(Array);
			expect(adminResponse.body.data.length).toBeGreaterThan(0);

			expect(userResponse.statusCode).toBe(403);
			expect(userResponse.body.message).toBe("You are not allowed to access this resource");
		});
	});

	describe("GET /api/v2/user/:id", () => {
		it("should return 200 and allow admin to read any user's data, while users can only read their own", async () => {
			const [adminResponse, userResponse] = await Promise.all([
				request(app).get(`/api/v2/user/${userId}`).set("Authorization", `Bearer ${adminToken}`),
				request(app).get(`/api/v2/user/${userId}`).set("Authorization", `Bearer ${userToken}`)
			]);

			[adminResponse, userResponse].forEach((response) => {
				expect(response.statusCode).toBe(200);
				expect(response.body.data).toBeInstanceOf(Object);
			});
		});

		it("should return 404 if it tries to read a non-existent user", async () => {
			const response = await request(app)
				.get(`/api/v2/user/${nonExistUserId}`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.statusCode).toBe(404);
			expect(response.body.message).toBe("User not found");
		});

		it("should return 403 and forbid access if a user tries to access another user's data", async () => {
			const response = await request(app)
				.get(`/api/v2/user/${targetId}`)
				.set("Authorization", `Bearer ${userToken}`);

			expect(response.statusCode).toBe(403);
			expect(response.body.message).toBe("You are not allowed to access this resource");
		});
	});

	describe("PATCH /api/v2/user/:id", () => {
		it("should return 200 and allow admin to update any user's data, while users can only update their own", async () => {
			const [adminResponse, userResponse] = await Promise.all([
				request(app)
					.patch(`/api/v2/user/${userId}`)
					.set("Authorization", `Bearer ${adminToken}`)
					.field("full_name", "John Peter Doe")
					.field("email", "jp.doe@example.com")
					.attach("avatar_img", path.join(__dirname, "../tests/assets", "example-user-avatar.png")),
				request(app)
					.patch(`/api/v2/user/${userId}`)
					.set("Authorization", `Bearer ${userToken}`)
					.field("full_name", "John Peter Doe")
					.field("email", "jp.doe@example.com")
					.attach("avatar_img", path.join(__dirname, "../tests/assets", "example-user-avatar.png"))
			]);

			[adminResponse, userResponse].forEach((response) => {
				expect(response.statusCode).toBe(200);
				expect(response.body.message).toBe("Profile updated successfully!");
			});
		});

		it("should return 404 if it tries to update a non-existent user", async () => {
			const response = await request(app)
				.patch(`/api/v2/user/${nonExistUserId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ full_name: "John Peter Doe", email: "jp.doe@example.com" });

			expect(response.statusCode).toBe(404);
			expect(response.body.message).toBe("User not found");
		});

		it("should return 400 if the file size exceeds the limit", async () => {
			const response = await request(app)
				.patch(`/api/v2/user/${userId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.attach("avatar_img", path.join(__dirname, "../tests/assets", "large-file.jpg"));

			expect(response.statusCode).toBe(400);
			expect(response.body.message).toBe("Uploaded file size exceeds 5 MB limit");
		});

		it("should return 400 if the payload is empty", async () => {
			const response = await request(app)
				.patch(`/api/v2/user/${userId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({});

			expect(response.statusCode).toBe(400);
			expect(response.body.message).toBe("Cannot proceed with empty data");
		});

		it("should return 400 if form data field is missing or invalid", async () => {
			const emptyFilePath = path.join(__dirname, "../tests/assets/empty.png");

			fs.writeFileSync(emptyFilePath, "");

			const responses = await Promise.all([
				request(app)
					.patch(`/api/v2/user/${userId}`)
					.set("Authorization", `Bearer ${adminToken}`)
					.attach("", path.join(__dirname, "../tests/assets", "example-user-avatar.png")),
				request(app)
					.patch(`/api/v2/user/${userId}`)
					.set("Authorization", `Bearer ${adminToken}`)
					.attach("invalid_field", emptyFilePath)
			]);

			responses.forEach((response) => {
				expect(response.statusCode).toBe(400);
				expect(response.body.message).toBe("Unexpected or missing field");
			});
		});

		it("should return 403 and forbid access if a user tries to update another user's data", async () => {
			const response = await request(app)
				.patch(`/api/v2/user/${targetId}`)
				.set("Authorization", `Bearer ${userToken}`)
				.send({ full_name: "John Peter Doe", email: "jp.doe@example.com" });

			expect(response.statusCode).toBe(403);
			expect(response.body.message).toBe("You are not allowed to perform this action");
		});

		it("should return 409 if email already used", async () => {
			const response = await request(app)
				.patch(`/api/v2/user/${userId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ email: "jp.doe@example.com" });

			expect(response.statusCode).toBe(409);
			expect(response.body.message).toBe("Email is already in use");
		});

		it("should return 415 if uploaded file is not an image", async () => {
			const response = await request(app)
				.patch(`/api/v2/user/${userId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.attach("avatar_img", path.join(__dirname, "../tests/assets", "example.txt"));

			expect(response.statusCode).toBe(415); // Unsupported Media Type
			expect(response.body.message).toBe("Invalid file type. Only JPG, JPEG, or PNG are accepted");
		});
	});

	describe("DELETE /api/v2/user/:id", () => {
		it("should return 200 and allow only admin to delete any user's data, while users can only delete their own", async () => {
			const [adminResponse, userResponse] = await Promise.all([
				request(app).delete(`/api/v2/user/${userId}`).set("Authorization", `Bearer ${adminToken}`),
				request(app).delete(`/api/v2/user/${userId}`).set("Authorization", `Bearer ${userToken}`)
			]);

			[adminResponse, userResponse].forEach((response) => {
				expect(response.statusCode).toBe(200);
				expect(response.body.message).toBe("User successfully deleted!");
			});
		});

		it("should return 404 if it tries to delete a non-existent user", async () => {
			const response = await request(app)
				.delete(`/api/v2/user/${nonExistUserId}`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.statusCode).toBe(404);
			expect(response.body.message).toBe("User not found");
		});

		it("should return 403 and forbid access if a user tries to delete another user's data", async () => {
			const response = await request(app)
				.delete(`/api/v2/user/${targetId}`)
				.set("Authorization", `Bearer ${userToken}`);

			expect(response.statusCode).toBe(403);
			expect(response.body.message).toBe("You are not allowed to perform this action");
		});
	});

	afterAll(async () => {
		await knex.migrate.rollback();
		knex.destroy();

		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
	});
});
