// Utility functions for handling user info in localStorage

import type { JwtUserInfo } from '@/lib/api/formTryggveApi';
import type { UserInfo } from '@/contexts/AuthContext';

export const USER_INFO_KEY = 'user_info';

export function setUserInfo(user: unknown) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
}

export function getUserInfo<T = unknown>(): T | null {
  const raw = localStorage.getItem(USER_INFO_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY);
}

export function jwtToUserInfo(jwt: JwtUserInfo): UserInfo {
  return {
    id: jwt.user_id,
    username: 'dev', // fallback or replace with jwt.username if present
    display_name: 'Dev User',
    email: 'dev@example.com',
    roles: ['administrator'],
    ...jwt,
  };
}
