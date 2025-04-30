const coursesModel = require("../../models/courses.model");

const generateImgURL = () => {
	const images = new Array(9).fill(null).map((_, i) => {
		return `https://picsum.photos/id/${i + 1}/420/230`;
	});

	return images;
};

const images = generateImgURL();

const courses = [
	{
		name: "UI/UX Design",
		tagline: "Gapai Karier Impianmu sebagai Seorang UI/UX Designer & Product Manager",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 10,
		price: 599,
		categories: ["Web Development", "Internet Technologies", "Design & Multimedia"]
	},
	{
		name: "Big 4 Auditor Financial Analyst",
		tagline: "Gapai Karier Impianmu sebagai Auditor Financial Analyst",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 8,
		price: 399,
		categories: ["Statistics", "Data & Analytics", "Math & Logic"]
	},
	{
		name: "Frontend with ReactJS",
		tagline: "Gapai Karier Impianmu sebagai Front End Web Developer dengan ReactJS",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 12,
		price: 299,
		categories: ["Web Development", "Internet Technologies", "Design & Multimedia"]
	},
	{
		name: "Python for Data Science",
		tagline: "Gapai Karier Impianmu sebagai Seorang Data Scientist",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 10,
		price: 299,
		categories: ["Statistics", "Data & Analytics", "Math & Logic"]
	},
	{
		name: "ML/AI Career Path",
		tagline: "Gapai Karier Impianmu sebagai Seorang ML/AI Engineer",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 20,
		price: 799,
		categories: ["Statistics", "Data & Analytics", "Math & Logic"]
	},
	{
		name: "Backend with Golang",
		tagline: "Gapai Karier Impianmu sebagai Seorang Backend Developer dengan Golang",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 10,
		price: 399,
		categories: ["Web Development", "Security Development", "Internet Technologies"]
	},
	{
		name: "Mastering Cloud Computing",
		tagline: "Gapai Karier Impianmu sebagai Seorang Cloud Engineer",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 12,
		price: 599,
		categories: ["Web Development", "Internet Technologies"]
	},
	{
		name: "Cyber Security Fundamentals",
		tagline: "Gapai Karier Impianmu sebagai Seorang Cyber Security Engineer",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 12,
		price: 399,
		categories: ["Security Development", "Internet Technologies"]
	},
	{
		name: "Computer Vision with YOLO V5",
		tagline: "Gapai Karier Impianmu sebagai Seorang Computer Vision Engineer",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 10,
		price: 599,
		categories: ["Statistics", "Data & Analytics", "Math & Logic", "Internet Technologies"]
	}
];

courses.forEach((course, index) => {
	course.thumbnail_img_url = images[index];
});

/**
 * @param { import("knex").Knex } knex
 *
 * @returns { Promise<void> }
 */
exports.seed = async (knex) => {
	console.log("Truncating table");
	await knex.raw(`TRUNCATE TABLE ${coursesModel.tableName} RESTART IDENTITY CASCADE`);

	console.log("Inserting courses dummy data");

	await Promise.all(
		courses.map((course) => {
			return coursesModel.createCourse({
				name: course.name,
				tagline: course.tagline,
				description: course.description,
				total_modules: course.total_modules,
				price: course.price,
				thumbnail_img_url: course.thumbnail_img_url,
				categories: course.categories
			});
		})
	);

	console.log("Seeding completed");
};
