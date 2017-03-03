var mongoose = require('mongoose');

var projectSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	URL: String,
	screenshot: {
		photo: Buffer,
		uploadDate: {
			type: Date,
			default: Date.now
		},
		contentType: String
	}
});

var userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	name: String,
	profilePicture: {
		photo: Buffer,
		contentType: String
	},
	firstTime : Boolean,
	projects: [projectSchema]
});

//Compile Schema into a model
mongoose.model("User", userSchema);