
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Company, CompanyGroup } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';
import { companies as initialCompanies, companyGroups as initialCompanyGroups } from '@/lib/companies';

type UserContextType = {
  currentUser: User | null | undefined; // undefined for initial loading state
  companyIdVerified: boolean;
  verifyCompanyId: (id: string) => boolean;
  users: User[];
  companies: Company[];
  companyGroups: CompanyGroup[];
  login: (email: string, password: string) => User | null;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'role' | 'avatar'>) => User | null;
  addCompany: (company: Omit<Company, 'id'> & { id: string }, groupName?: string) => void;
  updateUserPassword: (userId: string, oldPass: string, newPass: string) => boolean;
  removeUser: (userId: string) => void;
  setUsers: (users: User[]) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, fallback: T): T => {
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
  const [companyGroups, setCompanyGroups] = useState<CompanyGroup[]>(() => getInitialState('companyGroups', initialCompanyGroups));
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  const [companyIdVerified, setCompanyIdVerified] = useState(false);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('companyGroups', JSON.stringify(companyGroups));
  }, [companyGroups]);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        const fullUser = users.find(u => u.id === user.id);
        setCurrentUser(fullUser || null);

        const storedVerification = localStorage.getItem('companyIdVerified');
        if (storedVerification === 'true' && fullUser && fullUser.companyId) {
            setCompanyIdVerified(true);
        }
    } else {
        setCurrentUser(null);
    }
  }, []); 

  const login = (email: string, password: string): User | null => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      // Reset company verification on new login
      setCompanyIdVerified(false);
      localStorage.removeItem('companyIdVerified');
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

  const addUser = (userData: Omit<User, 'id' | 'role' | 'avatar'>): User | null => {
    if (users.some(u => u.email === userData.email)) {
        return null; // User already exists
    }

    const newUser: User = {
        id: `user-${Date.now()}`,
        ...userData,
        role: 'employee', // Default role
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
    };

    setUsers(prevUsers => [...prevUsers, newUser]);
    return newUser;
  };

  const addCompany = (company: Company, groupName?: string) => {
    let finalCompany = { ...company };
    if (groupName && groupName.trim() !== '') {
        let group = companyGroups.find(g => g.name.toLowerCase() === groupName.toLowerCase().trim());
        if (!group) {
            group = { id: `GRP-${Date.now()}`, name: groupName.trim() };
            setCompanyGroups(prev => [...prev, group!]);
        }
        finalCompany.groupId = group.id;
    }
    setCompanies(prevCompanies => [...prevCompanies, finalCompany]);
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
        // Find the user in the current state and update their companyId
        const updatedUsers = users.map(user => 
            user.id === currentUser.id ? { ...user, companyId: normalizedId } : user
        );
        // This will also trigger the useEffect to save to localStorage
        setUsers(updatedUsers);

        // Update the currentUser in the context's state as well
        setCurrentUser(prevUser => prevUser ? { ...prevUser, companyId: normalizedId } : null);

        setCompanyIdVerified(true);
        localStorage.setItem('companyIdVerified', 'true');
        // Also update the stored current user to reflect the new companyId
        const updatedCurrentUserForStorage = { ...currentUser, companyId: normalizedId };
        localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUserForStorage));
        
        return true;
    }
    return false;
  }

  return (
    <UserContext.Provider value={{ 
        currentUser, 
        users, 
        companies,
        companyGroups,
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
