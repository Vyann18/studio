"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Role } from '@/lib/types';
import { inventoryItems } from '@/lib/data';
import { users as initialUsers } from '@/lib/data';

type UserContextType = {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  setUsers: (users: User[]) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  const handleSetCurrentUser = (user: User) => {
    const userExists = users.find(u => u.id === user.id);
    if (userExists) {
      setCurrentUser(userExists);
    }
  }

  const handleSetUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    // Also update current user if their info changed
    const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
    if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
    }
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser: handleSetCurrentUser, users, setUsers: handleSetUsers }}>
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
