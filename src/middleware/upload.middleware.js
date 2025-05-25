const multer = require("multer");
const os = require("os");
const path = require("path");
const fs = require("fs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");

const fileSize = 5 * 1024 * 1024; // Max 5 MB

const tempDir =
	process.env.NODE_ENV !== "production" ? path.join(__dirname, "../../temp") : path.join(os.tmpdir(), "uploads");

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const uploadsDir = path.join(__dirname, "../..", "public/uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const diskTempStorage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, tempDir),
	filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const diskUploadsStorage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadsDir),
	filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const cloudinaryStorage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "user_avatars",
		allowed_formats: ["jpg", "jpeg", "png"],
		public_id: (req, _file) => {
			const fileName = `user-${req.params.id.split("-")[0]}-avatar`;
			return fileName;
		},
		overwrite: true,
		resource_type: "auto",
		transformation: [{ width: 250, height: 250, crop: "limit" }]
	}
});

const dynamicStorage = {
	_handleFile(req, file, cb) {
		let chosenStorage;

		if (process.env.NODE_ENV === "test") {
			chosenStorage = diskTempStorage;
		} else if (req.path === "/upload") {
			chosenStorage = diskUploadsStorage;
		} else {
			chosenStorage = cloudinaryStorage;
		}

		chosenStorage._handleFile(req, file, cb);
	},

	_removeFile(req, file, cb) {
		let chosenStorage;

		if (process.env.NODE_ENV === "test") {
			chosenStorage = diskTempStorage;
		} else if (req.path === "/upload") {
			chosenStorage = diskUploadsStorage;
		} else {
			chosenStorage = cloudinaryStorage;
		}

		if (chosenStorage._removeFile) {
			chosenStorage._removeFile(req, file, cb);
		} else {
			cb(null);
		}
	}
};

const fileFilter = (req, file, cb) => {
	const allowedFileTypes = /jpg|jpeg|png/;
	const extName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
	const mimeType = allowedFileTypes.test(file.mimetype);

	if (extName && mimeType) {
		return cb(null, true);
	}

	const error = new Error("Invalid file type. Only JPG, JPEG, or PNG are accepted");
	error.status = 415;

	cb(error);
};

const upload = multer({
	storage: dynamicStorage,
	fileFilter,
	limits: { fileSize }
});

const uploadSingleImage = (fieldName) => upload.single(fieldName);

module.exports = uploadSingleImage;
