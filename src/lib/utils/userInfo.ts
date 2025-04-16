// Utility functions for handling user info in localStorage

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
