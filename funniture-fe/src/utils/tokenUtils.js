import { jwtDecode } from "jwt-decode";

export default function decodeJwt(token) {
    if (token === null) return null;
    return jwtDecode(token);
}
