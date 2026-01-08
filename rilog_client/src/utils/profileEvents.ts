// utils/profileEvents.ts
export const PROFILE_UPDATED_EVENT = 'profileUpdated';

export const emitProfileUpdate = () => {
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
};

export const listenToProfileUpdate = (callback: () => void) => {
  window.addEventListener(PROFILE_UPDATED_EVENT, callback);
  return () => window.removeEventListener(PROFILE_UPDATED_EVENT, callback);
};