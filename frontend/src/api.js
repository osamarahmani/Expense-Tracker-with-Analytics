import axios from "axios";

const API = axios.create({
  baseURL: "https://vp-financetracker.onrender.com/api",
});

export default API;
