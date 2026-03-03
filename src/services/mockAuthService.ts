// Mock Authentication Service
// NOTE: Email login now integrates with the real API at localhost:3001
// Mobile and OTP login remain mocked for now as per current scope.

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const STORAGE_KEY = 'pos_auth_session';

// Updated interface based on Backend Database Schema
export interface User {
  id?: number;
  email?: string;
  phone_number?: string;
  name?: string;
  admin?: boolean;
  phone_verified?: boolean;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  // Legacy/Compatibility fields
  mobile?: string; 
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Hardcoded mock credentials (kept for Mobile/OTP flow)
export const MOCK_CREDENTIALS = {
  email: 'admin@posapp.com',
  password: 'Admin@123',
  mobile: '9999999999',
  otp: '123456'
};

class MockAuthService {
  private getStorageData(): { user: User; token: string } | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
  
  private setStorageData(user: User, token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
  }
  
  private clearStorageData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
  
  // Signup Methods
  async signupWithEmail(email: string, password: string, name?: string): Promise<AuthResponse> {
    await this.delay(800);
    // Logic preserved for mock signup
    return { success: false, message: 'Signup via API not yet implemented.' };
  }
  
  async signupWithMobile(mobile: string, otp: string): Promise<AuthResponse> {
    await this.delay(800);
     return { success: false, message: 'Mobile signup not implemented.' };
  }
  
  // Login Methods
  async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          auth: {
            email,
            password
          }
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const apiUser = data.data.user;
        const token = data.data.token;
        
        // Map backend user to app User interface
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          phone_number: apiUser.phone_number,
          name: apiUser.name,
          admin: apiUser.admin,
          phone_verified: apiUser.phone_verified,
          email_verified: apiUser.email_verified,
          role: apiUser.admin ? 'admin' : 'staff' // Mapping for legacy compatibility
        };

        this.setStorageData(user, token);
        return { success: true, user, token };
      } else {
        return { success: false, message: data.message || 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login API Error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  }
  
  async loginWithMobile(mobile: string, otp: string): Promise<AuthResponse> {
    // Preserved Mock Logic for Mobile
    await this.delay(800);
    
    if (mobile === MOCK_CREDENTIALS.mobile && otp === MOCK_CREDENTIALS.otp) {
      const user: User = { mobile, role: 'admin', name: 'Admin User' };
      const token = 'mock_token_admin_' + Date.now();
      this.setStorageData(user, token);
      return { success: true, user, token };
    }
    
    return { success: false, message: 'Invalid mobile or OTP' };
  }
  
  // Forgot Password
  async initiatePasswordReset(identifier: string): Promise<AuthResponse> {
    await this.delay(500);
    return { success: true, message: 'OTP sent successfully' };
  }
  
  async resetPassword(newPassword: string, confirmPassword: string): Promise<AuthResponse> {
    await this.delay(800);
    if (newPassword !== confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }
    return { success: true, message: 'Password reset successfully' };
  }
  
  // Session Management
  getCurrentSession(): { user: User; token: string } | null {
    return this.getStorageData();
  }
  
  isAuthenticated(): boolean {
    return !!this.getStorageData();
  }
  
  logout(): void {
    this.clearStorageData();
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new MockAuthService();
