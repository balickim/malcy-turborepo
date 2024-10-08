import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonLoading,
  IonNote,
} from "@ionic/react";
import { useMutation } from "@tanstack/react-query";
import { Formik, FormikValues } from "formik";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { RegisterUserDto, LoginUserDto } from "shared-nestjs";

import AuthApi from "~/api/auth/routes";
import PageContainer from "~/components/PageContainer";
import store from "~/store";
import { loginSchema, registerSchema } from "~/validation/auth";

interface IAuthFormValues extends FormikValues {
  username?: string;
  email: string;
  password: string;
}

export default observer(function Auth() {
  const { userStore } = store;
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const authApi = new AuthApi();

  const mutation = useMutation({
    // @ts-expect-error blah
    mutationFn: isLoggingIn
      ? (data: LoginUserDto) => authApi.login(data)
      : (data: RegisterUserDto) => authApi.register(data),
  });

  const initialValues: IAuthFormValues = {
    email: "",
    password: "",
  };

  return (
    <PageContainer>
      <IonLoading isOpen={mutation.isPending} message="Loading..." />
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isLoggingIn ? "Logowanie" : "Rejestracja"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <Formik
        initialValues={
          isLoggingIn ? initialValues : { ...initialValues, username: "" }
        }
        validationSchema={isLoggingIn ? loginSchema : registerSchema}
        onSubmit={async (values) => {
          // @ts-expect-error blah
          const res = await mutation.mutateAsync(values);

          if (res && isLoggingIn) {
            await userStore.logIn(res.data);
            const event = new CustomEvent("login");
            window.dispatchEvent(event);
          }
          if (res && !isLoggingIn) {
            toast.success(
              "Konto utworzono pomyślnie. Możesz się teraz zalogować.",
            );
          }
        }}
      >
        {({
          values,
          touched,
          errors,
          setFieldValue,
          setFieldTouched,
          setTouched,
          handleSubmit,
        }) => (
          <IonContent className="ion-padding">
            <form onSubmit={handleSubmit}>
              {isLoggingIn ? null : (
                <>
                  <IonItem>
                    <IonInput
                      name={"Username"}
                      onIonBlur={() => setFieldTouched("username")}
                      label={"username"}
                      value={values.username}
                      onIonChange={(e) =>
                        setFieldValue("username", e.detail.value)
                      }
                    />
                  </IonItem>
                  {touched.username && errors.username ? (
                    <IonNote className={"text-red-600 pl-4"}>
                      {errors.username}
                    </IonNote>
                  ) : null}
                </>
              )}

              <IonItem>
                <IonInput
                  name={"email"}
                  onIonBlur={() => setFieldTouched("email")}
                  label={"Email"}
                  value={values.email}
                  onIonChange={(e) => setFieldValue("email", e.detail.value)}
                />
              </IonItem>
              {touched.email && errors.email ? (
                <IonNote className={"text-red-600 pl-4"}>
                  {errors.email}
                </IonNote>
              ) : null}

              <IonItem>
                <IonInput
                  name={"password"}
                  onIonBlur={() => setFieldTouched("password")}
                  label={"Hasło"}
                  type="password"
                  value={values.password}
                  onIonChange={(e) => setFieldValue("password", e.detail.value)}
                />
              </IonItem>
              {touched.password && errors.password ? (
                <IonNote className={"text-red-600 pl-4"}>
                  {errors.password}
                </IonNote>
              ) : null}

              <IonButton type="submit" expand="block">
                {isLoggingIn ? "Zaloguj się" : "Zarejestruj się"}
              </IonButton>
            </form>

            <IonButton
              fill="clear"
              expand="block"
              onClick={() => {
                setIsLoggingIn(!isLoggingIn);
                setTouched(
                  isLoggingIn
                    ? {}
                    : { username: false, email: false, password: false },
                );
              }}
            >
              {isLoggingIn
                ? "Nie masz konta? Zarejestruj się"
                : "Masz już konto? Zaloguj się"}
            </IonButton>
          </IonContent>
        )}
      </Formik>
    </PageContainer>
  );
});
