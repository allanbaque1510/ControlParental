import {auth,imageDB,DB} from '../database'
import { useContext, createContext,useState,useEffect } from 'react'
import { doc, setDoc,getDoc,addDoc,getDocs,collection, query, where } from "firebase/firestore"; 
import { createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,sendPasswordResetEmail, onAuthStateChanged,updateProfile,sendEmailVerification,EmailAuthProvider } from 'firebase/auth'

import {ref,uploadBytes} from 'firebase/storage'

export const AuthContext = createContext()

export const useAuth = ()=>{
    const context = useContext(AuthContext)
    if(!context){
        console.log('error: no esta creado el contexto')
    }
    return context
}
export function AuthProvider ({children}){
    const [user,setUser] = useState(null)
    const [userChildren,setUserChildren] = useState(null)
    const [userData,setUserData] = useState(null)
    const [errorMessage,setErrorMessage] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [cargandoDatos, setCargandoDatos] = useState(false)
    const [loading, setLoading] = useState(true)
    const [stateVerifyEmail,setStateVerifyEmail] = useState(false)
    const [stateResetPassword,setStateResetPassword] = useState(false)
    const [viewCredential,setViewCredential] = useState(false)
    const [messageVerifyError,setMessageVerifyError] = useState('')
    const register =async(datos,imagen)=>{
        setLoading(true)
        try {
            setCargandoDatos(true)
            const response = await createUserWithEmailAndPassword(auth,datos.email,datos.password)
       
            const nuevosDatos = {
                nombres:datos.firstname,
                apellidos:datos.secondname,
                cedula:datos.cedula,
                fecha:datos.date,
                telefono:datos.cellphone,
            }
            if(imagen){
                try {
                    const imgRef = ref(imageDB,`files/imgProfile/${response.user.uid}`)
                    const responseImage = await uploadBytes(imgRef, imagen)
       
            
                    updateProfile(auth.currentUser, {
                        photoURL: responseImage.metadata.fullPath, // Reemplaza con la URL de la foto que deseas agregar
                    })
                   
                } catch (error) {
                    console.log(error)
                }   
            }

            updateProfile(auth.currentUser, {
                displayName: `${datos.firstname} ${datos.secondname}`,
            })
           

            await setDoc(doc(DB, "usuarios", response.user.uid), nuevosDatos);

            await obtenerDatos(response.user.uid)

            setLoading(false)
            setCargandoDatos(false)
            setIsAuthenticated(true)
        } catch (error) {
            switch (error.code) {
                case 'auth/invalid-email':
                  // Manejar el error de correo electrónico inválido
                    setErrorMessage({form:'Register', message:'Email invalido'})
                  break;
                case 'auth/user-disabled':
                    setErrorMessage({form:'Register', message:'Error, cuenta deshabilitada'})
                    // Manejar el error de cuenta deshabilitada
                  break;
                case 'auth/email-already-in-use':
                    setErrorMessage({form:'Register', message:'El correo ya se encuentra en uso'})
                    // Manejar el error de correo electrónico ya en uso
                  break;
                case 'auth/weak-password':
                    setErrorMessage({form:'Register', message:'Contraseña debil'})
                    // Manejar el error de contraseña débil
                  break;
                case 'auth/network-request-failed':
                    setErrorMessage({form:'Register', message:'Falla en la conexion'})
                    // Manejar el error de falla de red
                  break;
                case 'auth/too-many-requests':
                    setErrorMessage({form:'Register', message:'Demasiados intentos de conexion'})
                    // Manejar el error de demasiados intentos
                  break;
              }
        }
    }
    const obtenerDatos = async(uid)=>{
      const docRef = doc(DB, "usuarios", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    }
    const obtenerHijos=async(uid)=>{
      try {
        let listaHijos = []
        const q = query(collection(DB, "children"), where("padre", "==", uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          listaHijos.push({...doc.data(),id:doc.id});
        });
        setUserChildren(listaHijos)
      } catch (error) {
        console.log(error)  
      }
    }

    const childrenRegister = async(datos)=>{
      try {
        await addDoc(collection(DB, "children"), datos);
        await obtenerHijos(user.uid);
      } catch (error) {
        console.log(error.code)
      }
    }



    const verificarEmail = ()=>{
      sendEmailVerification(user) .then(() => {
        setStateVerifyEmail(true)
      });
    }


    const resetPassword = (email)=>{
      sendPasswordResetEmail(auth, email)
      .then(() => {
        setStateResetPassword(true)
      })
      .catch((error) => {
        switch (error.code) {
          case 'auth/invalid-email':
            // Manejar el error de correo electrónico inválido
              setErrorMessage({form:'resetPassword', message:'Email invalido'})
            break;
          case 'auth/user-disabled':
              setErrorMessage({form:'resetPassword', message:'Error, cuenta deshabilitada'})
              // Manejar el error de cuenta deshabilitada
            break;
          case 'auth/user-not-found':
              setErrorMessage({form:'resetPassword', message:'Usuario no encontrado'})
              // Manejar el error de usuario no encontrado
            break;
          case 'auth/network-request-failed':
              setErrorMessage({form:'resetPassword', message:'Falla en la conexion'})
              // Manejar el error de falla de red
            break;
          case 'auth/too-many-requests':
              setErrorMessage({form:'resetPassword', message:'Demasiados intentos de conexion'})
              // Manejar el error de demasiados intentos
            break;
        }
      });
    }

    const login =async(datos)=>{
        try {
            const response = await signInWithEmailAndPassword(auth,datos.email,datos.password)
            console.log(response.user)
            setUser( response.user)
            await obtenerDatos(response.user.uid)
            await obtenerHijos(user.uid);
            setIsAuthenticated(true);
        } catch (error) {
            switch (error.code) {
                case 'auth/invalid-email':
                  // Manejar el error de correo electrónico inválido
                    setErrorMessage({form:'Login', message:'Email invalido'})
                  break;
                case 'auth/user-disabled':
                    setErrorMessage({form:'Login', message:'Error, cuenta deshabilitada'})
                    // Manejar el error de cuenta deshabilitada
                  break;
                case 'auth/user-not-found':
                    setErrorMessage({form:'Login', message:'Usuario no encontrado'})
                    // Manejar el error de usuario no encontrado
                  break;
                case 'auth/wrong-password':
                    setErrorMessage({form:'Login', message:'Credenciales incorrectas'})
                    // Manejar el error de contraseña incorrecta
                  break;
     
                case 'auth/network-request-failed':
                    setErrorMessage({form:'Login', message:'Falla en la conexion'})
                    // Manejar el error de falla de red
                  break;
                case 'auth/too-many-requests':
                    setErrorMessage({form:'Login', message:'Demasiados intentos de conexion'})
                    // Manejar el error de demasiados intentos
                  break;
              }
        }
    }




    useEffect(() => {
      let timeoutId;
      if (errorMessage || messageVerifyError) {
        timeoutId = setTimeout(() => {
          setErrorMessage(null);
          setMessageVerifyError('')
        }, 3000);}

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }};

    }, [errorMessage,messageVerifyError]);
    
    const logOut= async()=>{
         await signOut(auth)
    }


    const verifyPassword = async (data)=>{
      // console.log(data)
      try {
        await signInWithEmailAndPassword(auth,user?.email,data)
        setViewCredential(true)
      } catch (error) {
        setViewCredential(false)
        setMessageVerifyError("Credenciales incorrectas")
      }
    }

    const ocultarIdHijo = () =>{
      setViewCredential(false)
    }
    useEffect(() => {
        setLoading(true)
        const checkToken = async()=>{    
          onAuthStateChanged(auth,async currentUser=>{
                
                if(currentUser){
                    await obtenerDatos(currentUser.uid)
                    await obtenerHijos(currentUser.uid);
                    setIsAuthenticated(true)
                    setUser(currentUser)
                    setLoading(false)
                   
                }else{
                    setLoading(false)
                    setIsAuthenticated(false) 
                    setUser(null)
                    return
                }
            })

        }
        checkToken()
      }, [])

    return (
        <AuthContext.Provider 
            value={{register,ocultarIdHijo,verificarEmail,verifyPassword,resetPassword,login,logOut,childrenRegister,messageVerifyError,viewCredential,stateResetPassword,stateVerifyEmail,userChildren,user,isAuthenticated,loading,cargandoDatos,errorMessage,userData}}
        >
            {children}
        </AuthContext.Provider>
    )
}