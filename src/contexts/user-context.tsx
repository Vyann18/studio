
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Company } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';
import { companies as initialCompanies } from '@/lib/companies';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signOut,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

type UserContextType = {
  currentUser: User | null | undefined; // undefined for initial loading state
  companyIdVerified: boolean;
  verifyCompanyId: (id: string) => boolean;
  users: User[];
  companies: Company[];
  login: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: () => void;
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
        setCurrentUser(null);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            const existingUser = users.find(u => u.email === firebaseUser.email);
            if (existingUser) {
                setCurrentUser(existingUser);
                localStorage.setItem('currentUser', JSON.stringify(existingUser));
            } else {
                // New user signed in (e.g., via Google for the first time)
                const tempCompanyId = "EJY1UT"; // Default company for new users
                const newUser: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'New User',
                    email: firebaseUser.email!,
                    role: 'user', // Default role for new sign-ups
                    avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
                    companyId: tempCompanyId,
                };
                setUsers(prevUsers => {
                  const updatedUsers = [...prevUsers, newUser];
                  setCurrentUser(newUser);
                  localStorage.setItem('currentUser', JSON.stringify(newUser));
                  return updatedUsers;
                });
            }
        } else {
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
        }
    });

    return () => unsubscribe();
  }, []);


  const login = async (email: string, password: string): Promise<User | null> => {
    if (!auth) return null;
    
    return new Promise(async (resolve, reject) => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle setting the current user.
        // We need to wait for currentUser to be updated.
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            const appUser = users.find(u => u.email === firebaseUser.email);
            if (appUser) {
              unsubscribe();
              resolve(appUser);
            }
          }
        });
      } catch (error) {
        console.error("Login Error:", error);
        reject(error);
      }
    });
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) return;
    try {
        await signInWithPopup(auth, googleProvider);
        // onAuthStateChanged will handle the rest
    } catch (error) {
        console.error("Google Sign-In Error:", error);
    }
  };


  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setCurrentUser(null);
    setCompanyIdVerified(false);
    localStorage.removeItem('currentUser');
  };

  const addUser = async (userData: Omit<User, 'id' | 'role' | 'avatar' | 'companyId'> & { password?: string }): Promise<User | null> => {
    if (!auth || !userData.password) return null;
    
    if (users.some(u => u.email === userData.email)) {
        return null; // User already exists
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
      // onAuthStateChanged will handle setting the current user after signup
      return newUser;

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
    // For now, we'll just show a toast and not implement it.
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
        signInWithGoogle,
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
