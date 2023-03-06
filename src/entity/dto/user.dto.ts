import { ROLE } from "../role.entity";

export interface UserDto {

    username: string,
    password?: string,
    role?: ROLE

 }