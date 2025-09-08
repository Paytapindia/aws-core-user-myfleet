import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User as AuthUser } from '@/services/auth';

interface User {
  id: string;
  phone?: string;
  email: string;
  fullName?: string;
  companyName?: string;
  panNumber?: string;
  isOnboarded: boolean;
  subscribed: boolean;
  subscriptionTier?: string | null;
  subscriptionEnd?: string | null;
  phoneVerified?: boolean;
  emailUnverified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  emailUnverified: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, userData: { fullName: string; phone: string; vehicleNumber: string }) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  completeOnboarding: (profileData: {
    fullName: string;
    mobileNo: string;
    vehicleNumber: string;
  }) => Promise<boolean>;
  updateProfile: (profileData: {
    fullName: string;
    companyName: string;
    panNumber: string;
    phone: string;
  }) => Promise<boolean>;
  startTrial: () => Promise<void>;
  setPaidSubscription: (tier: 'semiannual' | 'annual') => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailUnverified, setEmailUnverified] = useState(false);

  useEffect(() => {
    // Initialize auth state from localStorage
    const initializeAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const userData: User = {
          id: currentUser.id,
          email: currentUser.email,
          fullName: currentUser.fullName,
          phone: currentUser.phone,
          isOnboarded: currentUser.isOnboarded,
          subscribed: currentUser.subscribed,
          subscriptionEnd: currentUser.subscriptionEnd,
          emailUnverified: currentUser.emailUnverified,
        };
        setUser(userData);
        setEmailUnverified(currentUser.emailUnverified || false);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName,
        phone: response.user.phone,
        isOnboarded: response.user.isOnboarded,
        subscribed: response.user.subscribed,
        subscriptionEnd: response.user.subscriptionEnd,
        emailUnverified: response.user.emailUnverified,
      };
      
      setUser(userData);
      setEmailUnverified(response.user.emailUnverified || false);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    userData: { fullName: string; phone: string; vehicleNumber: string }
  ): Promise<{ error?: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.signUp({
        email,
        password,
        fullName: userData.fullName,
        phone: userData.phone,
      });
      
      const userProfile: User = {
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName,
        phone: response.user.phone,
        isOnboarded: response.user.isOnboarded,
        subscribed: response.user.subscribed,
        subscriptionEnd: response.user.subscriptionEnd,
        emailUnverified: response.user.emailUnverified,
      };
      
      setUser(userProfile);
      setEmailUnverified(response.user.emailUnverified || false);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setEmailUnverified(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (profileData: {
    fullName: string;
    mobileNo: string;
    vehicleNumber: string;
  }): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Update user profile with onboarding data
      const updatedUser = {
        ...user,
        fullName: profileData.fullName,
        phone: profileData.mobileNo,
        isOnboarded: true,
      };
      
      // Store updated user data
      localStorage.setItem('auth_user', JSON.stringify({
        ...authService.getCurrentUser(),
        fullName: profileData.fullName,
        phone: profileData.mobileNo,
        isOnboarded: true,
      }));
      
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Onboarding error:', error);
      return false;
    }
  };

  const updateProfile = async (profileData: {
    fullName: string;
    companyName: string;
    panNumber: string;
    phone: string;
  }): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const updatedUser = {
        ...user,
        fullName: profileData.fullName,
        companyName: profileData.companyName,
        panNumber: profileData.panNumber,
        phone: profileData.phone,
      };
      
      // Store updated user data
      localStorage.setItem('auth_user', JSON.stringify({
        ...authService.getCurrentUser(),
        ...profileData,
      }));
      
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const startTrial = async (): Promise<void> => {
    try {
      if (!user) return;
      
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7); // 7-day trial
      
      const updatedUser = {
        ...user,
        subscribed: true,
        subscriptionTier: 'trial',
        subscriptionEnd: trialEnd.toISOString(),
      };
      
      localStorage.setItem('auth_user', JSON.stringify({
        ...authService.getCurrentUser(),
        subscribed: true,
        subscriptionTier: 'trial',
        subscriptionEnd: trialEnd.toISOString(),
      }));
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Start trial error:', error);
    }
  };

  const setPaidSubscription = async (tier: 'semiannual' | 'annual'): Promise<void> => {
    try {
      if (!user) return;
      
      const subscriptionEnd = new Date();
      if (tier === 'semiannual') {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 6);
      } else {
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
      }
      
      const updatedUser = {
        ...user,
        subscribed: true,
        subscriptionTier: tier,
        subscriptionEnd: subscriptionEnd.toISOString(),
      };
      
      localStorage.setItem('auth_user', JSON.stringify({
        ...authService.getCurrentUser(),
        subscribed: true,
        subscriptionTier: tier,
        subscriptionEnd: subscriptionEnd.toISOString(),
      }));
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Set subscription error:', error);
    }
  };

  const resendVerificationEmail = async (email: string): Promise<{ error?: string }> => {
    try {
      // Placeholder implementation
      console.log('Resending verification email to:', email);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to resend email' };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    emailUnverified,
    login,
    signup,
    logout,
    completeOnboarding,
    updateProfile,
    startTrial,
    setPaidSubscription,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
