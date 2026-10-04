module.exports = {
	testEnvironment: "jsdom",
	roots: ["<rootDir>/tests"],
	setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
	moduleNameMapper: {
		"^\\$$": "<rootDir>/tests/gm-mock.ts",
	},
	clearMocks: true,
	restoreMocks: true,
};
