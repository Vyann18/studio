
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
    const initializeAdmin = async () => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

      if (adminEmail && adminPassword && auth) {
        try {
          // Try to sign in silently. If it fails, the user likely doesn't exist.
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        } catch (error: any) {
          if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            // User not found, so create them
            try {
              await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
              console.log('Admin user created successfully.');
            } catch (createError) {
              console.error('Error creating admin user:', createError);
            }
          }
        } finally {
            // Always sign out after the check to not affect manual login
            if(auth.currentUser?.email === adminEmail) {
                await signOut(auth);
            }
        }
      }
    };
    
    initializeAdmin();
  }, []);

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
                const tempCompanyId = "EJY1UT"; // Default company for new users
                const newUser: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'New User',
                    email: firebaseUser.email!,
                    role: firebaseUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? 'admin' : 'user', // Assign admin role
                    avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
                    companyId: tempCompanyId,
                };
                
                setUsers(prevUsers => {
                  const userExists = prevUsers.some(u => u.email === newUser.email);
                  if (userExists) return prevUsers;
                  
                  const updatedUsers = [...prevUsers, newUser];
                  setCurrentUser(newUser);
                  localStorage.setItem('currentUser', JSON.stringify(newUser));
                  return updatedUsers;
                });
            }
        } else {
            setCurrentUser(null);
            setCompanyIdVerified(false);
            localStorage.removeItem('currentUser');
        }
    });

    return () => unsubscribe();
  }, [users]);


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
          unsubscribe(); 
          if (firebaseUser) {
            resolve(true);
          } else {
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
  };

  const addUser = async (userData: Omit<User, 'id' | 'role' | 'avatar' | 'companyId'> & { password?: string }): Promise<User | null> => {
    if (!auth || !userData.password) return null;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      // onAuthStateChanged will handle adding user to local state
      return { 
        id: userCredential.user.uid, 
        name: userData.name,
        email: userData.email,
        role: 'user', 
        avatar: `https://i.pravatar.cc/150?u=${userCredential.user.uid}`,
        companyId: 'EJY1UT' 
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
