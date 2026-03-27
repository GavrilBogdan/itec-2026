import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { tokenAtom, store, userDetailsAtom } from "../store";

export const useAuth = () => {
  const [token, setToken] = useAtom(tokenAtom);
  const userDetails = useAtomValue(userDetailsAtom);

  const login = (jwt: string) => {
    setToken(jwt);
  };

  const logout = () => {
    setToken(null);
  };

  return {
    token,
    userDetails,
    login,
    logout,
  };
};
