
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Company } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';
import { companies as initialCompanies } from '@/lib/companies';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser 
} from 'firebase/auth';

type UserContextType = {
  currentUser: User | null | undefined; // undefined for initial loading state
  companyIdVerified: boolean;
  verifyCompanyId: (id: string) => boolean;
  users: User[];
  companies: Company[];
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  addUser: (userData: Omit<User, 'id' | 'role' | 'avatar' | 'companyId' | 'password'> & { password?: string; name: string }) => Promise<User | null>;
  addCompany: (company: Omit<Company, 'id'> & { id: string }) => void;
  updateUserPassword: (userId: string, oldPass: string, newPass: string) => boolean;
  removeUser: (userId: string) => void;
  setUsers: (users: User[]) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const isFirebaseConfigured = () => {
    return auth && typeof auth.onAuthStateChanged === 'function';
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  const [companyIdVerified, setCompanyIdVerified] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured, skipping auth state change listener.');
      setCurrentUser(null); // Set to null to signify "not logged in"
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in.
        setUsers(prevUsers => {
          const existingUser = prevUsers.find(u => u.email === firebaseUser.email);
          if (existingUser) {
            setCurrentUser(existingUser);
            return prevUsers;
          } else {
            // New user from signup.
            const tempCompanyId = 'EJY1UT'; // Assign to default company for demo
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email!,
              role: 'user',
              avatar: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
              companyId: tempCompanyId,
            };
            setCurrentUser(newUser);
            return [...prevUsers, newUser];
          }
        });
      } else {
        // User is signed out
        setCurrentUser(null);
        setCompanyIdVerified(false);
      }
    });

    return () => unsubscribe();
  }, []);


  const login = async (email: string, password: string): Promise<User | null> => {
    if (!isFirebaseConfigured()) {
      console.error("Firebase is not configured. Cannot log in.");
      return null;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      // onAuthStateChanged will handle setting the current user.
      const appUser = users.find(u => u.email === firebaseUser.email);
      return appUser || null;
    } catch (error) {
      console.error("Error during email/password sign-in:", error);
      return null;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured()) {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }
    // onAuthStateChanged will handle setting user to null.
  };

  const addUser = async (userData: Omit<User, 'id' | 'role' | 'avatar' | 'companyId' | 'password'> & { password?: string; name: string }): Promise<User | null> => {
    if (users.some(u => u.email === userData.email)) {
        return null; // User already exists in local state, Firebase will also throw an error
    }
    if (!isFirebaseConfigured() || !userData.password) {
      console.error("Firebase is not configured or password is not provided.");
      return null;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;
      // onAuthStateChanged will handle creating the user in the app's state.
      // We can return a temporary object for immediate feedback if needed.
      const tempCompanyId = "EJY1UT";
      const newUser: User = {
        id: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        companyId: tempCompanyId,
        role: 'user', 
        avatar: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
      };
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  };

  const addCompany = (company: Company) => {
    setCompanies(prevCompanies => [...prevCompanies, company]);
  };

  const updateUserPassword = (userId: string, oldPass: string, newPass: string): boolean => {
    console.warn("Password update is not fully integrated with Firebase and only affects local mock data.");
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
        } else {
            // Current user was deleted, so log out
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
