/** @type {import('jest').Config} */
const config = {
	moduleFileExtensions: ["js", "jsx", "json", "node"],
	modulePathIgnorePatterns: [
		"<rootDir>/dist",
		"<rootDir>/node_modules",
		"<rootDir>/tests/__fixtures__",
		"<rootDir>/src/__tests__/__fixtures__"
	],
	verbose: true
};
