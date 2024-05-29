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
import React, { useState } from "react";

import { ILoginDto, IRegisterDto } from "~/api/auth/dtos";
import { logIn, register } from "~/api/auth/routes";
import PageContainer from "~/components/PageContainer";
import store from "~/store";
import { loginSchema, registerSchema } from "~/validation/auth";

interface IAuthFormValues extends FormikValues {
  nick?: string;
  email: string;
  password: string;
}

export default observer(function Auth() {
  const { userStore } = store;
  const [isLoggingIn, setIsLoggingIn] = useState(true);

  const mutation = useMutation({
    mutationFn: isLoggingIn
      ? (data: ILoginDto) => logIn(data)
      : (data: IRegisterDto) => register(data),
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
          isLoggingIn ? initialValues : { ...initialValues, nick: "" }
        }
        validationSchema={isLoggingIn ? loginSchema : registerSchema}
        onSubmit={async (values) => {
          // @ts-expect-error blah
          const res = await mutation.mutateAsync(values);

          if (res) {
            userStore.logIn(res.data);
            const event = new CustomEvent("login");
            window.dispatchEvent(event);
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
                      name={"nick"}
                      onIonBlur={() => setFieldTouched("nick")}
                      label={"Nick"}
                      value={values.nick}
                      onIonChange={(e) => setFieldValue("nick", e.detail.value)}
                    />
                  </IonItem>
                  {touched.nick && errors.nick ? (
                    <IonNote className={"text-red-600 pl-4"}>
                      {errors.nick}
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
                    : { nick: false, email: false, password: false },
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
