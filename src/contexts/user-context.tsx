
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Company } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';
import { companies as initialCompanies } from '@/lib/companies';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';

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
  signInWithGoogle: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  const [companyIdVerified, setCompanyIdVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        const existingUser = users.find(u => u.email === firebaseUser.email);
        if (existingUser) {
          setCurrentUser(existingUser);
          localStorage.setItem('currentUser', JSON.stringify(existingUser));
        } else {
          // New Google user, create an account
          const tempCompanyId = "EJY1UT"; // Assign to default company
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email!,
            role: 'user', // Default role for new sign-ups
            avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
            companyId: tempCompanyId,
          };
          const updatedUsers = [...users, newUser];
          setUsers(updatedUsers);
          setCurrentUser(newUser);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        setCompanyIdVerified(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [users]);


  const login = (email: string, password: string): User | null => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setCompanyIdVerified(false);
    localStorage.removeItem('currentUser');
  };
  
  const signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        // onAuthStateChanged will handle setting the user
    } catch (error) {
        console.error("Error during Google sign-in:", error);
        throw error;
    }
  };

  const addUser = (userData: Omit<User, 'id' | 'role' | 'avatar' | 'companyId'>): User | null => {
    if (users.some(u => u.email === userData.email)) {
        return null; // User already exists
    }
    const tempCompanyId = "EJY1UT"; 
    const newUser: User = {
        id: `user-${Date.now()}`,
        ...userData,
        companyId: tempCompanyId,
        role: 'user', 
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
    };
    setUsers([...users, newUser]);
    return newUser;
  };

  const addCompany = (company: Company) => {
    setCompanies([...companies, company]);
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
    setUsers(users.filter(u => u.id !== userId));
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
    if (currentUser && companies.some(c => c.id === id) && currentUser.companyId === id) {
        setCompanyIdVerified(true);
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
        signInWithGoogle,
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
