const Chatkit = require("@pusher/chatkit-server");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { instanceLocator, key } = require("./variables/variables.js");
const cors = require("cors");
const knex = require("knex")({
	client: "pg",
	connection: {
		connectionString: process.env.HEROKU_POSTGRESQL_GRAY_URL,
		ssl: true
	}
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

const chatkit = new Chatkit.default({
	instanceLocator: instanceLocator,
	key: key
});

app.get("/", (req, res) => {
	res.send("works");
});

app.post("/register", (req, res) => {
	bcrypt.hash(req.body.pass, 10, (err, hash) => {
		knex("users")
			.insert({ userid: req.body.userid, hash: hash })
			.returning("userid")
			.then(user =>
				chatkit
					.createUser({
						id: user[0],
						name: user[0]
					})
					.then(response => {
						res.json(response);
					})
					.catch(err => {
						res.status(400).json(
							"Error registering user to the chat"
						);
					})
			)
			.catch(err =>
				res.json("Error registering to the database").status(400)
			);
	});
});

app.post("/login", (req, res) => {
	knex("users")
		.where({ userid: req.body.userid })
		.then(response =>
			bcrypt.compare(req.body.pass, response[0].hash, (err, data) => {
				if (data) {
					chatkit
						.getUser({
							id: response[0].userid
						})
						.then(user => res.json(user))
						.catch(err => res.status(400).json("User not found"));
				} else {
					res.json("Wrong password");
				}
			})
		)
		.catch(err => res.json("User does not exist"));
});

app.post("/auth", (req, res) => {
	const authData = chatkit.authenticate({
		userId: req.query.user_id
	});
	res.status(authData.status).send(authData.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
