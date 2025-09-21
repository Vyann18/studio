'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Role } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';

type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'role' | 'avatar'>) => User | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleSetCurrentUser = (user: User | null) => {
    if (!user) {
        setCurrentUser(null);
        return;
    }
    const userExists = users.find(u => u.id === user.id);
    if (userExists) {
      setCurrentUser(userExists);
    }
  }

  const handleSetUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    if (currentUser) {
        const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
        if (updatedCurrentUser) {
            setCurrentUser(updatedCurrentUser);
        } else {
            setCurrentUser(null); // Current user was deleted
        }
    }
  }

  const login = (email: string, password: string): User | null => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (userData: Omit<User, 'id' | 'role' | 'avatar'>): User | null => {
    if (users.some(u => u.email === userData.email)) {
        return null; // User already exists
    }

    const newUser: User = {
        id: `user-${Date.now()}`,
        ...userData,
        role: 'user', // Default role for new signups
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
    };

    setUsers([...users, newUser]);
    return newUser;
  };


  return (
    <UserContext.Provider value={{ 
        currentUser, 
        setCurrentUser: handleSetCurrentUser, 
        users, 
        setUsers: handleSetUsers,
        login,
        logout,
        addUser,
    }}>
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
