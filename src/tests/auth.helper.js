const request = require("supertest");

const testConfig = require("../config/database").test;
const knex = require("knex")(testConfig);

const createServer = require("../utils/server");
const app = createServer();

const registerAndLoginUser = async (userData) => {
	const registerRes = await request(app).post("/api/v2/auth/register").send(userData);

	const { verif_token } = registerRes.body.data;

	const verifyRes = await request(app).get(`/api/v2/auth/verify-email?token=${verif_token}`);

	const loginRes = await request(app).post("/api/v2/auth/login").send({
		email: userData.email,
		password: userData.password
	});

	return [registerRes.body.data.user_id, loginRes.body.data.token];
};

module.exports = { registerAndLoginUser };
