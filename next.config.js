
const nextEnv = require('next-env');
const dotenvLoad = require('dotenv-load');
dotenvLoad();
const withNextEnv = nextEnv();
module.exports = withNextEnv({
    env: {
        //Now you can access process.env.some in your code.
        some: 'this is some in next.config.js.',

    },
});