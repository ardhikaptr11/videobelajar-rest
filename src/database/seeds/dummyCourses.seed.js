const { createNewCourse } = require("../../services/course.service");
const { tableName } = require("../../models/courses.model");

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
		categories: ["Web Development", "Internet Technologies", "Design & Multimedia"],
		modules: [
			{ title: "Introduction to UI/UX Design" },
			{ title: "Design Thinking" },
			{ title: "User Research" },
			{ title: "Wireframing" },
			{ title: "Prototyping" },
			{ title: "Usability Testing" },
			{ title: "Visual Design" },
			{ title: "Interaction Design" },
			{ title: "Responsive Design" },
			{ title: "Design Handoff" }
		]
	},
	{
		name: "Big 4 Auditor Financial Analyst",
		tagline: "Gapai Karier Impianmu sebagai Auditor Financial Analyst",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 8,
		price: 399,
		categories: ["Statistics", "Data & Analytics", "Math & Logic"],
		modules: [
			{ title: "Introduction to Financial Analysis" },
			{ title: "Financial Statements" },
			{ title: "Financial Ratios" },
			{ title: "Valuation Techniques" },
			{ title: "Risk Management" },
			{ title: "Financial Modeling" },
			{ title: "Excel for Financial Analysis" },
			{ title: "Presentation Skills" }
		]
	},
	{
		name: "Frontend with ReactJS",
		tagline: "Gapai Karier Impianmu sebagai Front End Web Developer dengan ReactJS",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 12,
		price: 299,
		categories: ["Web Development", "Internet Technologies", "Design & Multimedia"],
		modules: [
			{ title: "Introduction to Frontend in Web Development" },
			{ title: "What is React?" },
			{ title: "React Components" },
			{ title: "State Management" },
			{ title: "React Router" },
			{ title: "API Integration" },
			{ title: "Styling in React" },
			{ title: "Testing in React" },
			{ title: "Deployment" },
			{ title: "Performance Optimization" },
			{ title: "Best Practices" }
		]
	},
	{
		name: "Python for Data Science",
		tagline: "Gapai Karier Impianmu sebagai Seorang Data Scientist",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 10,
		price: 299,
		categories: ["Statistics", "Data & Analytics", "Math & Logic"],
		modules: [
			{ title: "Introduction to Data Science with Python" },
			{ title: "Data Manipulation with Pandas" },
			{ title: "Data Visualization with Matplotlib" },
			{ title: "Statistical Analysis with Scipy" },
			{ title: "Machine Learning with Scikit-learn" },
			{ title: "Deep Learning with TensorFlow" },
			{ title: "Natural Language Processing" },
			{ title: "Data Preprocessing" },
			{ title: "Model Evaluation" },
			{ title: "Deployment of Machine Learning Models" }
		]
	},
	{
		name: "ML/AI Career Path",
		tagline: "Gapai Karier Impianmu sebagai Seorang ML/AI Engineer",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 20,
		price: 799,
		categories: ["Statistics", "Data & Analytics", "Math & Logic"],
		modules: [
			{ title: "Introduction to Machine Learning" },
			{ title: "Supervised Learning" },
			{ title: "Unsupervised Learning" },
			{ title: "Reinforcement Learning" },
			{ title: "Deep Learning" },
			{ title: "Natural Language Processing" },
			{ title: "Computer Vision" },
			{ title: "Model Evaluation and Selection" },
			{ title: "Feature Engineering" },
			{ title: "Deployment of ML Models" }
		]
	},
	{
		name: "Backend with Golang",
		tagline: "Gapai Karier Impianmu sebagai Seorang Backend Developer dengan Golang",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 10,
		price: 399,
		categories: ["Web Development", "Security Development", "Internet Technologies"],
		modules: [
			{ title: "Introduction to Backend Development" },
			{ title: "Golang Basics" },
			{ title: "Building RESTful APIs" },
			{ title: "Database Integration" },
			{ title: "Authentication and Authorization" },
			{ title: "Error Handling" },
			{ title: "Testing in Golang" },
			{ title: "Deployment" },
			{ title: "Performance Optimization" },
			{ title: "Best Practices" }
		]
	},
	{
		name: "Mastering Cloud Computing",
		tagline: "Gapai Karier Impianmu sebagai Seorang Cloud Engineer",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 12,
		price: 599,
		categories: ["Web Development", "Internet Technologies"],
		modules: [
			{ title: "Introduction to Cloud Computing" },
			{ title: "Cloud Service Models" },
			{ title: "Cloud Deployment Models" },
			{ title: "AWS Basics" },
			{ title: "Azure Basics" },
			{ title: "Google Cloud Basics" },
			{ title: "Cloud Security" },
			{ title: "Cloud Networking" },
			{ title: "Cloud Storage" },
			{ title: "Cloud Monitoring and Management" }
		]
	},
	{
		name: "Cyber Security Fundamentals",
		tagline: "Gapai Karier Impianmu sebagai Seorang Cyber Security Engineer",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 12,
		price: 399,
		categories: ["Security Development", "Internet Technologies"],
		modules: [
			{ title: "Introduction to Cyber Security" },
			{ title: "Network Security" },
			{ title: "Application Security" },
			{ title: "Data Security" },
			{ title: "Identity and Access Management" },
			{ title: "Incident Response" },
			{ title: "Risk Management" },
			{ title: "Security Compliance" },
			{ title: "Threat Intelligence" },
			{ title: "Security Operations Center (SOC)" }
		]
	},
	{
		name: "Computer Vision with YOLO V5",
		tagline: "Gapai Karier Impianmu sebagai Seorang Computer Vision Engineer",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce laoreet, est ut facilisis gravida, sapien nulla eleifend justo, at viverra odio dolor id est. Aliquam tincidunt mauris ut eleifend aliquam. Ut vel ligula id turpis suscipit dignissim. Phasellus posuere, enim sed elementum ultricies, dolor nunc porttitor purus, nec dignissim turpis elit a est. Etiam vitae dolor vel tortor egestas efficitur. Nullam imperdiet aliquet elit vel posuere. Sed nec laoreet nunc, at malesuada est.",
		total_modules: 10,
		price: 599,
		categories: ["Statistics", "Data & Analytics", "Math & Logic", "Internet Technologies"],
		modules: [
			{ title: "Introduction to Computer Vision" },
			{ title: "Image Processing" },
			{ title: "Object Detection" },
			{ title: "Image Classification" },
			{ title: "Image Segmentation" },
			{ title: "Feature Extraction" },
			{ title: "Deep Learning for Computer Vision" },
			{ title: "YOLO V5 Basics" },
			{ title: "Training YOLO V5 Models" },
			{ title: "Deployment of YOLO V5 Models" }
		]
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
	await knex.raw(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`);

	console.log("Inserting courses dummy data");

	for (const course of courses) {
		const { name, tagline, description, price, thumbnail_img_url, categories, modules } = course;

		await createNewCourse({
			name,
			tagline,
			description,
			price,
			thumbnail_img_url,
			categories,
			modules
		});
	}

	console.log("Seeding completed");
};
