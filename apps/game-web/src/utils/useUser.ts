import { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import UsersApi from "~/api/users";
import store from "~/store";
import { IApiResponse } from "~/types/common";
import { IUser } from "~/types/user";

export function useUser(
  options?: Omit<
    UndefinedInitialDataOptions<IApiResponse<IUser>>,
    "queryKey" | "queryFn"
  >,
) {
  const usersApi = new UsersApi();
  const { userStore } = store;
  const getMe = useQuery({
    ...options,
    queryKey: ["getMe"],
    queryFn: () => usersApi.getMe(),
  });

  useEffect(() => {
    if (getMe.isSuccess) {
      userStore.setUser(getMe.data.data);
    }
  }, [getMe.isSuccess, getMe.data?.data]);

  return getMe;
}
