"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Role } from '@/lib/types';
import { users } from '@/lib/data';

type UserContextType = {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  const handleSetCurrentUser = (user: User) => {
    const userExists = users.find(u => u.id === user.id);
    if (userExists) {
      setCurrentUser(userExists);
    }
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser: handleSetCurrentUser, users }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
