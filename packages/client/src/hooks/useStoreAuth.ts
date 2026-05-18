import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { authActions } from "~/store";
import { useAppDispatch, useAppSelector } from "~/store/hooks";

export function useStoreAuth() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const authStore = useAppSelector((state) => state.auth);

  function login(token: string) {
    const bearerToken = `Bearer ${token}`;
    dispatch(authActions.setToken(bearerToken));
    localStorage.setItem("token", bearerToken);
    nav("/editor");
  }

  const isLogin = useMemo(
    () => ({
      get: () => !!authStore.token,
    }),
    [authStore.token]
  );

  return {
    login,
    isLogin,
    store: authStore,
  };
}
