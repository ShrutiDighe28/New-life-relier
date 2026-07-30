/**
 * API Configuration
 *
 * Login endpoint : POST http://192.168.1.18:5140/api/ManageUser/Login
 * Payload        : { "UserName": "...", "Password": "..." }
 *
 * To change the server IP, update LAN_IP below.
 */

const LAN_IP   = process.env.LAN_IP || '192.168.1.18';
const LAN_PORT = process.env.LAN_PORT || '5140';

export const API_BASE_URL = `http://${LAN_IP}:${LAN_PORT}/api`;

/** POST { UserName, Password } */
export const LOGIN_URL    = `${API_BASE_URL}/ManageUser/Login`;

/** POST registration payload */
export const REGISTER_URL    = `${API_BASE_URL}/ManageUser/Register`;

/** PUT { UserId, FirstName, LastName, UserName, Mobile, RoleId, BranchId, CompanyId, IsActive } */
export const UPDATE_USER_URL = `${API_BASE_URL}/ManageUser/UpdateUser`;
