import { BaseEndpoint } from "../../_core/endpointUrl";

export class AuthEndpoint extends BaseEndpoint {
  static login = () => `${this.base}/login`;
  static register = () => `${this.base}/register`;
  static getMe = () => `${this.base}/me`;
}
