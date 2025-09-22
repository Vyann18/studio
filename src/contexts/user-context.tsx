
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Company } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';
import { companies as initialCompanies } from '@/lib/companies';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

type UserContextType = {
  currentUser: User | null | undefined; // undefined for initial loading state
  companyIdVerified: boolean;
  verifyCompanyId: (id: string) => boolean;
  users: User[];
  companies: Company[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'role' | 'avatar' | 'companyId'> & { password?: string }) => Promise<User | null>;
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
    if (!auth) {
        setCurrentUser(null); // Firebase not configured, treat as logged out
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            // User is signed in, see if they exist in our app's user list
            const existingUser = users.find(u => u.email === firebaseUser.email);
            if (existingUser) {
                setCurrentUser(existingUser);
                localStorage.setItem('currentUser', JSON.stringify(existingUser));
            } else {
                // New user signed up (e.g., via Google or email for the first time)
                const tempCompanyId = "EJY1UT"; // Default company for new users
                const newUser: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'New User',
                    email: firebaseUser.email!,
                    role: 'user', // Default role for new sign-ups
                    avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
                    companyId: tempCompanyId,
                };
                
                // Use functional update to ensure we have the latest state
                setUsers(prevUsers => {
                  const userExists = prevUsers.some(u => u.email === newUser.email);
                  if (userExists) {
                    return prevUsers; // Do nothing if user already added
                  }
                  const updatedUsers = [...prevUsers, newUser];
                  setCurrentUser(newUser);
                  localStorage.setItem('currentUser', JSON.stringify(newUser));
                  return updatedUsers;
                });
            }
        } else {
            // User is signed out
            setCurrentUser(null);
            setCompanyIdVerified(false);
            localStorage.removeItem('currentUser');
        }
    });

    return () => unsubscribe();
  }, []); // removed `users` dependency to prevent re-running on every user list change


  const login = async (email: string, password: string): Promise<boolean> => {
    if (!auth) {
        console.error("Firebase auth is not initialized.");
        return false;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the current user.
      // We return a promise that resolves when the user is set.
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          unsubscribe(); // We only need this to fire once.
          if (firebaseUser) {
            resolve(true);
          } else {
            // This case should ideally not be hit if signIn was successful, but as a fallback:
            reject(new Error("Login failed: User not found after authentication."));
          }
        });
      });
    } catch (error) {
      console.error("Login Error:", error);
      return false;
    }
  };


  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    // State updates are handled by onAuthStateChanged
  };

  const addUser = async (userData: Omit<User, 'id' | 'role' | 'avatar' | 'companyId'> & { password?: string }): Promise<User | null> => {
    if (!auth || !userData.password) return null;
    
    if (users.some(u => u.email === userData.email)) {
        return null; // User already exists in local state, Firebase will also throw an error.
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      // onAuthStateChanged will now handle creating the user in our local state.
      // We can optimistically return a temporary user object or wait for onAuthStateChanged
      return { 
        id: userCredential.user.uid, 
        name: userData.name,
        email: userData.email,
        role: 'user', 
        avatar: `https://i.pravatar.cc/150?u=${userCredential.user.uid}`,
        companyId: 'EJY1UT' // Default companyId for new signups
      };
    } catch(error) {
      console.error("Signup error:", error);
      return null;
    }
  };

  const addCompany = (company: Company) => {
    setCompanies([...companies, company]);
  };

  const updateUserPassword = (userId: string, oldPass: string, newPass: string): boolean => {
    // This is complex with Firebase, involving re-authentication.
    // Disabling for now to prevent data inconsistencies.
    console.warn("Password update feature not fully implemented for Firebase auth.");
    return false;
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
            // Current user was deleted
            logout();
        }
    }
  }

  const verifyCompanyId = (id: string): boolean => {
    const normalizedId = id.toUpperCase();
    if (currentUser && companies.some(c => c.id === normalizedId) && currentUser.companyId === normalizedId) {
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
