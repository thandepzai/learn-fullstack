const BASE_URL = process.env.mapStudyHost;

export class BaseEndpoint {
  static base = BASE_URL;
  static baseAdmin = BASE_URL + "/admin";

  static refreshToken = () => BaseEndpoint.base + "/api/refresh";
}
