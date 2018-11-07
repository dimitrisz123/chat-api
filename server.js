const Chatkit = require("@pusher/chatkit-server");
const express = require("express");
const bodyParser = require("body-parser");
const { instanceLocator, key } = require("./variables.js");
var cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const chatkit = new Chatkit.default({
	instanceLocator: instanceLocator,
	key: key
});

app.get("/", (req, res) => {
	res.json('works')
}


app.post("/create_user", (req, res) => {
	chatkit
		.createUser({
			id: req.body.id,
			name: req.body.name
		})
		.then(response => {
			res.json(response);
		})
		.catch(err => {
			res.status(400).json("ERROR CREATING USER");
		});
});

app.post("/auth", (req, res) => {
	const authData = chatkit.authenticate({
		userId: req.body.id
	});

	res.status(authData.status).send(authData.body);
});

app.post("/user", (req, res) => {
	chatkit
		.getUser({
			id: req.body.id
		})
		.then(user => res.json(user))
		.catch(err => res.status(400).json("USER NOT FOUND"));
});

app.listen(process.env.PORT || 3000, () =>
	console.log(`App is running on port ${process.env.PORT}`)
);
