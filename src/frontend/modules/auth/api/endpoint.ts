import { BaseEndpoint } from "@/frontend/core/api/endpoint";

export class AuthEndpoint extends BaseEndpoint {
    static login = this.base + "/login";
    static register = this.base + "/register";
}
