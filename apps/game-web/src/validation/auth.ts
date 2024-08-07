import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Nieprawidłowy adres e-mail")
    .required("Pole jest wymagane"),
  password: yup
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .required("Pole jest wymagane"),
});

export const registerSchema = yup.object({
  username: yup
    .string()
    .min(3, "username musi mieć co najmniej 3 znaki")
    .required("Pole jest wymagane"),
  email: yup
    .string()
    .email("Nieprawidłowy adres e-mail")
    .required("Pole jest wymagane"),
  password: yup
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .required("Pole jest wymagane"),
});
