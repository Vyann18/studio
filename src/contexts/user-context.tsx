
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
  login: (email: string, password: string) => User | null;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'role' | 'avatar' | 'companyId'>) => User | null;
  addCompany: (company: Omit<Company, 'id'> & { id: string }) => void;
  updateUserPassword: (userId: string, oldPass: string, newPass: string) => boolean;
  removeUser: (userId: string) => void;
  setUsers: (users: User[]) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, fallback: T[]): T[] => {
    if (typeof window === 'undefined') {
        return fallback;
    }
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        try {
            return JSON.parse(storedValue);
        } catch (e) {
            console.error(`Error parsing ${key} from localStorage`, e);
            return fallback;
        }
    }
    return fallback;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(() => getInitialState('users', initialUsers));
  const [companies, setCompanies] = useState<Company[]>(() => getInitialState('companies', initialCompanies));
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  const [companyIdVerified, setCompanyIdVerified] = useState(false);

  useEffect(() => {
    // Persist users to localStorage whenever they change
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    // Persist companies to localStorage whenever they change
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    // On initial load, check if a user is stored in localStorage to persist session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        const fullUser = users.find(u => u.id === user.id);
        setCurrentUser(fullUser || null);

        // Also restore company verification status
        const storedVerification = localStorage.getItem('companyIdVerified');
        if (storedVerification === 'true' && fullUser && fullUser.companyId) {
            setCompanyIdVerified(true);
        }
    } else {
        setCurrentUser(null);
    }
  }, [users]); // Depend on users to re-check when users list changes

  const login = (email: string, password: string): User | null => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setCompanyIdVerified(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('companyIdVerified');
  };

  const addUser = (userData: Omit<User, 'id' | 'role' | 'avatar' | 'companyId'>): User | null => {
    if (users.some(u => u.email === userData.email)) {
        return null; // User already exists
    }

    // Note: In a real app, companyId would come from the verified company context
    const tempCompanyId = "EJY1UT"; 

    const newUser: User = {
        id: `user-${Date.now()}`,
        ...userData,
        companyId: tempCompanyId,
        role: 'user', // Default role
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
    };

    setUsers(prevUsers => [...prevUsers, newUser]);
    return newUser;
  };

  const addCompany = (company: Company) => {
    setCompanies(prevCompanies => [...prevCompanies, company]);
  };

  const updateUserPassword = (userId: string, oldPass: string, newPass: string): boolean => {
    const userIndex = users.findIndex(u => u.id === userId && u.password === oldPass);
    if (userIndex === -1) {
        return false;
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex].password = newPass;
    setUsers(updatedUsers);

    if (currentUser && currentUser.id === userId) {
        const updatedCurrentUser = { ...currentUser, password: newPass };
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
    return true;
  };

  const removeUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };
  
  const handleSetUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    if (currentUser) {
        const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
        if (updatedCurrentUser) {
            setCurrentUser(updatedCurrentUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
        } else {
            logout();
        }
    }
  }

  const verifyCompanyId = (id: string): boolean => {
    const normalizedId = id.toUpperCase();
    const companyExists = companies.some(c => c.id === normalizedId);

    if (currentUser && companyExists) {
        const updatedUsers = users.map(user => 
            user.id === currentUser.id ? { ...user, companyId: normalizedId } : user
        );
        setUsers(updatedUsers);

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
        setUsers: handleSetUsers,
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
