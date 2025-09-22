
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Company } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';
import { companies as initialCompanies } from '@/lib/companies';

type UserContextType = {
  currentUser: User | null | undefined; // undefined for initial loading state
  companyIdVerified: boolean;
  verifyCompanyId: (id: string) => boolean;
  users: User[];
  companies: Company[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'role' | 'avatar' | 'companyId'>) => Promise<User | null>;
  addCompany: (company: Omit<Company, 'id'> & { id: string }) => void;
  updateUserPassword: (userId: string, oldPass: string, newPass: string) => boolean;
  removeUser: (userId: string) => void;
  setUsers: (users: User[]) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  const [companyIdVerified, setCompanyIdVerified] = useState(false);

  useEffect(() => {
    // Check for a logged-in user in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        // Also check if company ID was already verified
        const storedCompanyVerified = localStorage.getItem('companyIdVerified');
        if (storedCompanyVerified === 'true') {
            setCompanyIdVerified(true);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
        setCurrentUser(null);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const userToStore = { ...user };
      // Never store password in local storage
      delete userToStore.password;
      setCurrentUser(userToStore);
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setCompanyIdVerified(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('companyIdVerified');
  };

  const addUser = async (userData: Omit<User, 'id' | 'role' | 'avatar' | 'companyId' | 'password'> & { password?: string }): Promise<User | null> => {
    if (users.some(u => u.email === userData.email)) {
      return null; // User already exists
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
      role: 'user',
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      companyId: 'EJY1UT' // Default company for new sign-ups
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const addCompany = (company: Company) => {
    setCompanies([...companies, company]);
  };

  const updateUserPassword = (userId: string, oldPass: string, newPass: string): boolean => {
    let success = false;
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId && u.password === oldPass) {
          success = true;
          return { ...u, password: newPass };
        }
        return u;
      })
    );
    return success;
  };

  const removeUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };
  
  const handleSetUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    if (currentUser) {
        const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
        if (updatedCurrentUser) {
            const userToStore = { ...updatedCurrentUser };
            delete userToStore.password;
            setCurrentUser(userToStore);
            localStorage.setItem('currentUser', JSON.stringify(userToStore));
        } else {
            logout();
        }
    }
  }

  const verifyCompanyId = (id: string): boolean => {
    const normalizedId = id.toUpperCase();
    if (currentUser && companies.some(c => c.id === normalizedId) && currentUser.companyId === normalizedId) {
        setCompanyIdVerified(true);
        localStorage.setItem('companyIdVerified', 'true');
        return true;
    }
    return false;
  }

  return (
    <UserContext.Provider value={{ 
        currentUser, 
        users, 
        companies,
        companyIdVerified,
        verifyCompanyId,
        login,
        logout,
        addUser,
        addCompany,
        updateUserPassword,
        removeUser,
        setUsers: handleSetUsers
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
