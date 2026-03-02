import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (avatar: string) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  initialize: () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        set({
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            username: firebaseUser.displayName || 'User',
            avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`
          },
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  },

  login: async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  },

  signup: async (email, password, username) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: username,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCredential.user.uid}`
    });
    // Force update local state immediately after profile update
    set({
      user: {
        id: userCredential.user.uid,
        email: email,
        username: username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userCredential.user.uid}`
      },
      isAuthenticated: true
    });
  },

  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  },

  logout: async () => {
    await signOut(auth);
  },

  updateAvatar: async (avatar) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL: avatar });
      set((state) => ({ 
        user: state.user ? { ...state.user, avatar } : null 
      }));
    }
  },
}));
