export interface IamUser {
  id: string;
  email: string;
  fullName: string;
  status: number;
  createdAt: string;
}

export interface UserRoleResult {
  roleId: string;
  roleName: string;
}

export interface IamUserDetail extends IamUser {
  roles: UserRoleResult[];
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
