const axios = require("axios");

const baseURL = process.env.RENDER_URL;

axios.create({
  baseURL: baseURL,
  timeout: 5000,
});

module.exports = axios;
