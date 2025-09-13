import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Employee {
  id: string;
  username: string;
  name: string;
  berger_employee_code: string;
  can_attempt: boolean;
}

interface AuthContextType {
  employee: Employee | null;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, employeeUsername: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch employee data using secure function
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .rpc('get_current_employee');
              
              if (data && data.length > 0) {
                setEmployee(data[0]);
              } else {
                setEmployee(null);
              }
            } catch (error) {
              console.error('Error fetching employee data:', error);
              setEmployee(null);
            }
          }, 0);
        } else {
          setEmployee(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const signup = async (email: string, password: string, employeeUsername: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Link employee account if signup successful
      if (data.user) {
        try {
          await supabase.rpc('link_employee_to_auth_user', {
            p_employee_username: employeeUsername,
            p_auth_user_id: data.user.id
          });
        } catch (linkError) {
          return { success: false, error: 'Employee account not found or already linked' };
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setEmployee(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ employee, user, session, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}