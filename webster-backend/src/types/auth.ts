export interface RegisterUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    username: string;
}

export interface LoginDto {
    username: string;
    password: string;
}

export interface ChangeEmailDto {
    password: string;
    newEmail: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
