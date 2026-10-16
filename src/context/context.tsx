import { createContext, useContext } from "react";
import { UserData } from "./type";

export type AppContextType = {
  userData: UserData | null;
  isAuthorized: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const defaultValue: AppContextType = {
  userData: null,
  isAuthorized: false,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
};

export const AppContext = createContext<AppContextType>(defaultValue);

export const useAppContext = () => useContext(AppContext);
