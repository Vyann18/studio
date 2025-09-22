
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
  signInWithGoogle: () => Promise<void>;
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
        console.warn("Firebase is not configured, skipping auth state change listener.");
        setCurrentUser(null);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const existingUser = users.find(u => u.email === firebaseUser.email);
        if (existingUser) {
          setCurrentUser(existingUser);
        } else {
          // New Google user or newly signed up email user
          const tempCompanyId = "EJY1UT"; // Assign to default company
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email!,
            role: 'user', // Default role for new sign-ups
            avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
            companyId: tempCompanyId,
          };
          setUsers(prevUsers => [...prevUsers, newUser]);
          setCurrentUser(newUser);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
        setCompanyIdVerified(false);
      }
    });

    return () => unsubscribe();
  }, [users]);


  const login = async (email: string, password: string): Promise<User | null> => {
    if (!isFirebaseConfigured()) {
      console.error("Firebase is not configured. Cannot log in.");
      return null;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const appUser = users.find(u => u.email === firebaseUser.email);
      return appUser || null;
    } catch (error) {
      console.error("Error during email/password sign-in:", error);
      return null;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured()) {
        await signOut(auth);
    }
    setCurrentUser(null);
    setCompanyIdVerified(false);
  };
  
  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured()) {
        console.error("Firebase is not configured. Cannot sign in with Google.");
        throw new Error("Firebase is not configured.");
    }
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Error during Google sign-in:", error);
        throw error;
    }
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
      const tempCompanyId = "EJY1UT";
      const newUser: User = {
        id: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        companyId: tempCompanyId,
        role: 'user', 
        avatar: `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
      };
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  };

  const addCompany = (company: Company) => {
    setCompanies([...companies, company]);
  };

  const updateUserPassword = (userId: string, oldPass: string, newPass: string): boolean => {
    // This is now more complex with Firebase and would require re-authentication.
    // For now, we'll keep the mock logic but note it won't affect Firebase auth.
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
    setUsers(users.filter(u => u.id !== userId));
  };
  
  const handleSetUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    if (currentUser) {
        const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
        if (updatedCurrentUser) {
            setCurrentUser(updatedCurrentUser);
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
