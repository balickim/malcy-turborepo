export interface ILoginDto {
  email: string;
  password: string;
}

export interface IRegisterDto extends ILoginDto {
  username: string;
}
