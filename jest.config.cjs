module.exports = {
	testEnvironment: "jsdom",
	roots: ["<rootDir>/tests"],
	setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
	moduleNameMapper: {
		"^\\$$": "<rootDir>/tests/gm-mock.js",
	},
	clearMocks: true,
	restoreMocks: true,
};
