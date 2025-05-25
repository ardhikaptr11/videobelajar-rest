const path = require("path");
const request = require("supertest");

require("@dotenvx/dotenvx").config({
	path: path.join(__dirname, "../../.env.test")
});

const createServer = require("../utils/server");
const { getUserByVerifToken, updateUser } = require("../models/users.model");
const { updateUserDataByRole } = require("../services/user.service");

const app = createServer();

const testConfig = require("../config/database").test;
const knex = require("knex")(testConfig);

describe("Authtentication", () => {
	let verification_token;
	let user;

	beforeAll(async () => {
		await knex.migrate.latest();
	}, 30000);

	describe("POST /api/v2/auth/register", () => {
		const userData = {
			full_name: "John Doe",
			email: "john.doe@example.com",
			gender: "male",
			phone: "812345678901",
			password: "John123!"
		};

		it("should return 200 if email is reserved", async () => {
			const userDataCopy = { ...userData, email: process.env.ADMIN_EMAIL };
			const response = await request(app).post("/api/v2/auth/register").send(userDataCopy);

			expect(response.statusCode).toBe(200);
			expect(response.body.message).toBe("Unable to use reserved email");
		});

		it("should return 200 if email is invalid", async () => {
			const userDataCopy = { ...userData, email: "invalid-email" };
			const response = await request(app).post("/api/v2/auth/register").send(userDataCopy);

			expect(response.statusCode).toBe(200);
			expect(response.body.message).toBe("Invalid email");
		});

		it("should return 200 if phone number is invalid", async () => {
			// Phone number should not start with 0 and should be 10-13 digits long
			const invalidPhoneNumbers = [
				"0812345678901", // starts with 0
				"812345678901234", // too long
				"812345678", // too short
				"1234567890" // does not start with 8
			];

			invalidPhoneNumbers.forEach(async (phone) => {
				const userDataCopy = { ...userData, phone };
				const response = await request(app).post("/api/v2/auth/register").send(userDataCopy);

				expect(response.statusCode).toBe(200);
				expect(response.body.message).toBe("Invalid phone number");
			});
		});

		it("should return 201 and register a new user", async () => {
			const response = await request(app).post("/api/v2/auth/register").send(userData);
			verification_token = response.body.data.verif_token;

			expect(response.statusCode).toBe(201);
			expect(response.body.data).toBeInstanceOf(Object);
		});

		it("should return 200 if password is too weak", async () => {
			// Password should contain at least 8 characters, including uppercase, lowercase, numbers, and special characters
			const weakPasswords = [
				"12345678", // only numbers
				"abcdefgh", // only letters
				"password", // common password
				"abcdefgh1", // no special character
				"12345678!", // no letters
				"abcdefgh!", // no numbers
				"abc123!" // too short
			];

			weakPasswords.forEach(async (password) => {
				const userDataCopy = { ...userData, password };
				const response = await request(app).post("/api/v2/auth/register").send(userDataCopy);

				expect(response.statusCode).toBe(200);
				expect(response.body.message).toBe("Password is too weak");
			});
		});

		it("should return 400 if mandatory fields are missing", async () => {
			const userDataCopy = { ...userData };
			delete userDataCopy.gender;

			const response = await request(app).post("/api/v2/auth/register").send(userDataCopy);

			expect(response.statusCode).toBe(400);
			expect(response.body.message).toBe("Please make sure all fields are filled in");
		});

		it("should return 400 if gender is invalid", async () => {
			const userDataCopy = { ...userData, gender: "other" };
			const response = await request(app).post("/api/v2/auth/register").send(userDataCopy);

			expect(response.statusCode).toBe(400);
			expect(response.body.message).toBe("Unacceptable gender value");
		});

		it("should return 409 if email already exists", async () => {
			const response = await request(app).post("/api/v2/auth/register").send(userData);
			expect(response.statusCode).toBe(409);
			expect(response.body.message).toBe("Email already registered");
		});
	});

	describe("GET /api/v2/auth/verify-email?token={verification_token}", () => {
		it("should return 200 and verify user", async () => {
			const response = await request(app).get(`/api/v2/auth/verify-email?token=${verification_token}`);

			expect(response.statusCode).toBe(200);
			expect(response.body.message).toBe("Verification success!");

			user = await getUserByVerifToken(verification_token);

			expect(user.is_verified).toBe(true);
		});

		it("should return 200 if token is invalid", async () => {
			const verification_token = "some-invalid-token";
			const response = await request(app).get(`/api/v2/auth/verify-email?token=${verification_token}`);

			expect(response.statusCode).toBe(200);
			expect(response.body.message).toBe("Token not recognized");
		});

		it("should return 200 if user is already verified", async () => {
			const response = await request(app).get(`/api/v2/auth/verify-email?token=${verification_token}`);

			// const user = await getUserByVerifToken(verification_token);

			expect(response.statusCode).toBe(200);
			expect(user.is_verified).toBe(true);
			expect(response.body.message).toBe("User already verified");
		});

		it("should return 400 if verification token is missing", async () => {
			const response = await request(app).get("/api/v2/auth/verify-email");

			expect(response.statusCode).toBe(400);
			expect(response.body.message).toBe("Verification token is required");
		});
	});

	describe("POST /api/v2/auth/login", () => {
		const exampleLoginCreds = {
			email: "john.doe@example.com",
			password: "John123!"
		};

		it("should return 200 and login user", async () => {
			const [adminResponse, userResponse] = await Promise.all([
				request(app).post("/api/v2/auth/login").send({
					email: process.env.ADMIN_EMAIL,
					password: process.env.ADMIN_PASSWORD
				}),
				request(app).post("/api/v2/auth/login").send(exampleLoginCreds)
			]);

			[adminResponse, userResponse].forEach((response) => {
				expect(response.statusCode).toBe(200);
				expect(response.body.data.token).toBeDefined();
			});
		});

		it("should return 200 if email or password is invalid", async () => {
			const [adminResponse, userResponse] = await Promise.all([
				request(app).post("/api/v2/auth/login").send({
					email: process.env.ADMIN_EMAIL,
					password: "admin123!"
				}),
				request(app)
					.post("/api/v2/auth/login")
					.send({ ...exampleLoginCreds, password: "Johndoe123!" })
			]);

			[adminResponse, userResponse].forEach((response) => {
				expect(response.statusCode).toBe(200);
			});
			expect(adminResponse.body.message).toBe("Invalid admin credentials");
			expect(userResponse.body.message).toBe("Invalid email or password");
		});

		it("should return 200 if email and password valid but user not found", async () => {
			const response = await request(app).post("/api/v2/auth/login").send({
				email: "jane.doe@example.com",
				password: "Jane123!"
			});

			expect(response.statusCode).toBe(200);
			expect(response.body.message).toBe("User not found");
		});

		it("should return 200 if user is not verified", async () => {
			const targetId = user.user_id;

			await updateUserDataByRole("user", targetId, { is_verified: false });

			const response = await request(app).post("/api/v2/auth/login").send(exampleLoginCreds);

			expect(response.statusCode).toBe(200);
			expect(response.body.message).toBe("Cannot login, please verify your account first");
		});

		it("should return 400 if mandatory fields are missing", async () => {
			const invalidLoginCreds = [
				{}, // empty payload
				{ email: exampleLoginCreds.email }, // missing password
				{ password: exampleLoginCreds.password } // missing email
			];

			invalidLoginCreds.forEach(async (data) => {
				const response = await request(app).post("/api/v2/auth/login").send(data);

				expect(response.statusCode).toBe(400);
				expect(response.body.message).toBe("Please make sure all fields are filled in");
			});
		});
	});

	afterAll(async () => {
		await knex.migrate.rollback();
		knex.destroy();
	});
});
