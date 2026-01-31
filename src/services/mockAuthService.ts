// Mock Authentication Service

const STORAGE_KEY = 'pos_auth_session';

export interface User {
  email?: string;
  mobile?: string;
  role: 'admin';
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Hardcoded mock credentials
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
    
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }
    
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }
    
    const user: User = { email, role: 'admin', name: name || email.split('@')[0] };
    const token = 'mock_token_' + Date.now();
    this.setStorageData(user, token);
    
    return { success: true, user, token };
  }
  
  async signupWithMobile(mobile: string, otp: string): Promise<AuthResponse> {
    await this.delay(800);
    
    if (!mobile || mobile.length !== 10) {
      return { success: false, message: 'Invalid mobile number' };
    }
    
    if (otp !== MOCK_CREDENTIALS.otp) {
      // For demo purposes, we allow any OTP if it matches the mock, or specific handling
      // Requirement says "Mock OTP", so we will just accept any 6 digit for signup flow simplicity
      // or strictly enforce the mock one. Let's enforce the mock one for consistency.
       if (otp !== '123456') {
          return { success: false, message: 'Invalid OTP. Use 123456' };
       }
    }
    
    const user: User = { mobile, role: 'admin', name: 'User ' + mobile.slice(-4) };
    const token = 'mock_token_' + Date.now();
    this.setStorageData(user, token);
    
    return { success: true, user, token };
  }
  
  // Login Methods
  async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    await this.delay(800);
    
    if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
      const user: User = { email, role: 'admin', name: 'Admin User' };
      const token = 'mock_token_admin_' + Date.now();
      this.setStorageData(user, token);
      return { success: true, user, token };
    }
    
    return { success: false, message: 'Invalid email or password' };
  }
  
  async loginWithMobile(mobile: string, otp: string): Promise<AuthResponse> {
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
    // Mock: always accept email or mobile
    return { success: true, message: 'OTP sent successfully' };
  }
  
  async resetPassword(newPassword: string, confirmPassword: string): Promise<AuthResponse> {
    await this.delay(800);
    
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }
    
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
