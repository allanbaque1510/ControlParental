import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getStorage} from 'firebase/storage'

import {getFirestore} from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyA3L_WYCXl3bNcBfKjjuQIaMTwVTe_Ns_o",
  authDomain: "control-parental-maestria.firebaseapp.com",
  databaseURL: "https://control-parental-maestria-default-rtdb.firebaseio.com",
  projectId: "control-parental-maestria",
  storageBucket: "control-parental-maestria.appspot.com",
  messagingSenderId: "112310232271",
  appId: "1:112310232271:web:975e8337cfa8bdbac043ba",
  measurementId: "G-XHLWX6R1XC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const imageDB = getStorage(app)
export const DB = getFirestore(app)