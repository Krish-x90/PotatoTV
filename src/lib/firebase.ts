import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC45ZPwGUsnBtwFi4L_tzWLoW1aJsu8GNw",
  authDomain: "potatotv-53ca1.firebaseapp.com",
  projectId: "potatotv-53ca1",
  storageBucket: "potatotv-53ca1.firebasestorage.app",
  messagingSenderId: "713172135246",
  appId: "1:713172135246:web:cc0064d47a7c949743021f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
