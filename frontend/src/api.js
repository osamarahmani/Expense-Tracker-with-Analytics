import axios from "axios";

const API = axios.create({
  baseURL: "https://expense-tracker-with-analytics.onrender.com",
});

export default API;
