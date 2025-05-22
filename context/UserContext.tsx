// context/UserContext.tsx
import { createContext, useContext } from "react";

interface Role {
  name: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  mobile_number: string;
  unit: string;
  role: Role;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const useUser = () => useContext(UserContext);
