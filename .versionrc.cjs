const VERSION_RE = /^(\s*\/\/\s*@version\s+)([^\s]+)(\s*)$/m;

const userscript = {
    filename: 'kinozal_kp.user.js',

    updater: {
        readVersion(contents) {
            const match = contents.match(VERSION_RE);

            if (!match) {
                throw new Error('Unable to find // @version in userscript');
            }

            return match[2];
        },

        writeVersion(contents, version) {
            if (!VERSION_RE.test(contents)) {
                throw new Error('Unable to find // @version in userscript');
            }

            return contents.replace(VERSION_RE, `$1${version}$3`);
        },
    },
};

module.exports = {
    packageFiles: [userscript],
    bumpFiles: [userscript],
};