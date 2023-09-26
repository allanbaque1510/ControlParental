import {auth,imageDB,DB} from '../database'
import { useContext, createContext,useState,useEffect } from 'react'
import { doc, setDoc } from "firebase/firestore"; 
import { createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut, onAuthStateChanged,updateProfile } from 'firebase/auth'

import {ref,uploadBytes} from 'firebase/storage'
import Cookies from 'js-cookie';
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
    const [errorMessage,setErrorMessage] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [cargandoDatos, setCargandoDatos] = useState(false)
    const [loading, setLoading] = useState(true)

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
       
                    nuevosDatos.imagenRef =responseImage.metadata.fullPath
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
                default:
                    setErrorMessage({form:'Register', message:'Error en el sistema'})
                    // Manejar otros errores no especificados
                  break;
              }
        }
    }

    const login =async(datos)=>{
        try {
            const response = await signInWithEmailAndPassword(auth,datos.email,datos.password)
            console.log(response.user)
            setUser( response.user)
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
                default:
                    setErrorMessage({form:'Login', message:'Error en el sistema'})
                    // Manejar otros errores no especificados
                  break;
              }
        }
    }
    useEffect(() => {
      if(errorMessage){
        setTimeout(() => {
            setErrorMessage(null)
        }, 5000);
      }
    
      
    }, [errorMessage])
    
    const logOut= async()=>{
         await signOut(auth)
    }


    useEffect(() => {
        setLoading(true)
        
        const checkToken = async()=>{    
            onAuthStateChanged(auth,currentUser=>{
                
                if(currentUser){
                    console.log(currentUser)
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
            value={{register,login,logOut,user,isAuthenticated,loading,cargandoDatos,errorMessage}}
        >
            {children}
        </AuthContext.Provider>
    )
}