import { atom, createStore } from "jotai";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export const store = createStore();

export const atomWithSecureStore = <T>(key: string, initialValue: T) =>
  atomWithStorage<T>(
    key,
    initialValue,
    createJSONStorage<T>(() => ({
      getItem: (key) => SecureStore.getItem(key) ?? null,
      setItem: (key, val) => SecureStore.setItem(key, val),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    })),
    {
      getOnInit: true,
    },
  );

export const tokenAtom = atomWithSecureStore<string | null>("jwt", null);
export const userDetailsAtom = atom<any>((get) => {
  const jwt = get(tokenAtom);
  if (jwt === null) return null;
  return jwtDecode(jwt);
});
