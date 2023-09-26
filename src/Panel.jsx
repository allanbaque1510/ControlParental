import React,{useState, useEffect} from 'react'
import { useAuth } from './context/AuthContext';
import { getStorage, ref,getDownloadURL  } from "firebase/storage";
import { imageDB } from './database';
import imProfile from './assets/imgProfile.png' 
import logo from './assets/logo.jpeg' 
import DotLoader  from "react-spinners/DotLoader";
const Panel = () => {
    const {logOut,user,cargandoDatos} = useAuth()
    const [imagenURL, setImagenURL] = useState(null);
    
    console.log(user)
    useEffect(() => {
        if(!cargandoDatos){
            const rutaImagen = user.photoURL
            // Obtén la referencia a la imagen en Firebase Storage
            const imgRef = ref(imageDB, rutaImagen);
            // Obtiene la URL de descarga de la imagen
            getDownloadURL(imgRef)
              .then((url) => {
                // Establece la URL de la imagen en el estado
                setImagenURL(url);
              })
              .catch((error) => {
                console.error('Error al obtener la URL de la imagen:', error);
              });
        }else{
            setImagenURL(imProfile)
        }
       
    }, [user,cargandoDatos]);
    if(cargandoDatos){
        return (
            <>
    <nav className='navPanel'>
        <img src={logo} alt="logo" />
    </nav>
    <section className='ventanaCarga'>
    <DotLoader 
        color="#474963"
        loading={true}
        size={100}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
        <h2 >Cargando datos...</h2>
    </section>
    
    </>)
    }else{
        return (
            <>
                <nav className='navPanel'>
                    <img src={logo} alt="logo" />
                    <button className='btnReg' onClick={logOut}>Cerrar session</button>
                </nav>
                <section className='infoUserPanel'>
                    <h2>{user.displayName}</h2>
                    <img src={imagenURL} alt="imagen perfil" />
                </section>
            </>
        )
    }


}

export default Panel