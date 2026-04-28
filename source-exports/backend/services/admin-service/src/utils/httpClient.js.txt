import axios from "axios";

const httpClient = axios.create({
  timeout: 10000
});

export default httpClient;