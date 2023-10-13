import React,{useState, useEffect} from 'react'
import { useAuth } from './context/AuthContext';
import { ref,getDownloadURL  } from "firebase/storage";
import { differenceInYears } from 'date-fns';
import { imageDB } from './database';
import imProfile from './assets/imgProfile.png' 
import logo from './assets/logo.jpeg' 
import DotLoader  from "react-spinners/DotLoader";
import girl from './assets/girl.png'
import boy from './assets/boy.png'
import { BiUser,BiSolidCalendar,BiCalendarStar,BiPhoneCall } from "react-icons/bi";
import { FcPlus } from "react-icons/fc";
const Panel = () => {
    const {logOut,user,cargandoDatos,userData,userChildren,viewCredential,ocultarIdHijo,messageVerifyError,childrenRegister,verificarEmail,stateVerifyEmail,verifyPassword} = useAuth()
    const [restablecerContraseña, setRestablecerContraseña] = useState(false)
    const [inputState, setInputState] = useState("")
    const [imagenURL, setImagenURL] = useState(null);
    const [avatarState, setAvatarState] = useState(0);
    const [formStatus, setFormStatus] = useState(false);
    const [errorMessage, setErrorMessage ] = useState('')
    const [tipoInput, setTipoInput] = useState('text');
    const [activarControl, setActivarControl] = useState(false);
    const [hijoActivo, setHijoActivo] = useState(null);
    const [btnStatus, setBtnStatus] = useState(false)
    const [btnStatusCopy, setBtnStatusCopy] = useState(false)
    const [passwordVerify,setPasswordVerify] = useState('')
    const fechaActual = new Date();
    const [datosFormulario, setDatosFormulario] = useState({
        nombres: '',
        apellidos: '',
        date: '',
      });
      const valoresRegistro = (event) =>{
        const { name, value } = event.target;
            setDatosFormulario({
              ...datosFormulario,
              [name]: value,
            });
        
      }
    useEffect(() => {
        if(!cargandoDatos){
            if(user.photoURL !== null){

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
        }else{
            setImagenURL(imProfile)
        }
       
    }, [user,userData,cargandoDatos]);
    const cerrarForm=()=>{
        setFormStatus(false)
        setAvatarState(0)
        setDatosFormulario({
            nombres: '',
            apellidos: '',
            date: '',
          })
          setInputState("")
    }
    
    useEffect(() => {
        let timeoutId;
        if (errorMessage) {
          timeoutId = setTimeout(() => {
            setErrorMessage(null);
          }, 4000);}
  
        return () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }};
          
      }, [errorMessage]);
    const enviarDatos =async(event)=>{
        setErrorMessage('')
        event.preventDefault()
        if(avatarState === 0){
            return setErrorMessage('Debes escoger un avatar')
        }
        if(!datosFormulario.apellidos.includes(' ') || datosFormulario.apellidos.length < 8){
            return setErrorMessage('Debes tener los dos apellidos')
        }
        if(!datosFormulario.nombres.includes(' ') || datosFormulario.nombres.length < 8){
            return setErrorMessage('Debes tener los dos nombres')
        }
        if(differenceInYears(fechaActual, (new Date(datosFormulario.date))) > 17 || differenceInYears(fechaActual, (new Date(datosFormulario.date))) < 2 ){
            return setErrorMessage('Debes tener una edad entre 3 a 17 años')
        }


        const datos = {...datosFormulario,avatar:avatarState,padre:user.uid}
        setBtnStatus(true)
        await childrenRegister(datos)
        cerrarForm()
        setBtnStatus(false)

    }
    const controlHijo = (indice)=>{
        setHijoActivo(userChildren[indice])
        setActivarControl(true)
    }
    const formularioAgg = <form style={{position:'absolute', bottom:'-320px'}} onSubmit={enviarDatos}>
        <button className='btnCerrar' type="button" onClick={cerrarForm}>X</button>
        <h3>Seleccione un avatar</h3>
        <div className="contAvatar">
            <img style={avatarState===1?{outline:'5px solid rgb(65, 223, 144)'}:null} onClick={()=>setAvatarState(1)} src={boy} alt="avatar masculino" />
            <img style={avatarState===2?{outline:'5px solid rgb(65, 223, 144)'}:null} onClick={()=>setAvatarState(2)} src={girl} alt="avatar femenino" />
        </div>
        {errorMessage?(<span className='errorMessage'>{errorMessage}</span>) :null}
        <div className="input-container">
            <input type="text" onClick={()=>{setInputState('nombres')}} onBlur={()=>{if(inputState==='nombres'){setInputState('')}}} required='true' value={datosFormulario.nombres}  onChange={valoresRegistro} name="nombres" />
            {(inputState !== 'nombres' && datosFormulario.nombres.length <=0)?
            <>
                <span className='icon'><BiUser/></span>
                <span className="text">NOMBRES COMPLETOS</span>
            </>
            :null}
          </div>
          
               
          <div className="input-container">
            <input type="text" onClick={()=>{setInputState('apellidos')}} onBlur={()=>{if(inputState==='apellidos'){setInputState('')}}} required='true' value={datosFormulario.apellidos}  onChange={valoresRegistro} name="apellidos" />
            {(inputState !== 'apellidos' && datosFormulario.apellidos.length <=0)?
            <>
                <span className='icon'><BiUser/></span>
                <span className="text">APELLIDOS COMPLETOS</span>
            </>
            :null}
          </div>
          <div className="input-container">
            <input type={tipoInput} onClick={()=>{setInputState('date');  setTipoInput('date')}} required='true' onBlur={()=>{setTipoInput('text');if(inputState==='date'){setInputState('')}}} value={datosFormulario.date} onChange={valoresRegistro} name="date" />
         
            {inputState !== 'date'&& datosFormulario.date.length <=0?
            <>
              <span className='icon'><BiSolidCalendar/></span>
              <span className="text">FECHA DE NACIMIENTO</span>
            </>                
            :null}
          </div>
        <button disabled={btnStatus} type="submit">{btnStatus?'CARGANDO...':'GUARDAR'}</button>
    </form>
    
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
            <div>   
                {hijoActivo?
                        <div style={restablecerContraseña?null:{opacity:'0', height:'0%', width:'0%', top:'-20%', right:'-20%'}} className="resetPassword">
                            {viewCredential?
                            <form onSubmit={(e)=>{e.preventDefault(); navigator.clipboard.writeText(hijoActivo.id); setBtnStatusCopy(true)}}>
                                <button className='btnCerrar' type="button" onClick={()=>{setRestablecerContraseña(false);setPasswordVerify('');ocultarIdHijo();setBtnStatusCopy(false)}}>X</button>
                                <h2>Credenciales del niño</h2>
                                
                                <input type="text" value={hijoActivo.id} readOnly={true}  name="hijoId" id="hijoId" />
                                <button disabled={btnStatusCopy}  className='btnReg' type="submit">{btnStatusCopy?"Copiado!!":"Copiar"}</button>
                            
                            </form> 
                            :
                            <form onSubmit={(e)=>{e.preventDefault();verifyPassword(passwordVerify)}}>
                                <button className='btnCerrar' type="button" onClick={()=>{setRestablecerContraseña(false);setPasswordVerify('');ocultarIdHijo() }}>X</button>
                                <h2>Ingrese la contraseña para continuar</h2>
                                { (messageVerifyError.length>1?<span className='errorMessage'>{messageVerifyError}</span>:null)}

                                <input type="password" value={passwordVerify} onChange={(e)=>{setPasswordVerify(e.target.value)}} required={true} name="passwordV" id="passwordV" />
                                <button   className='btnReg' type="submit">Enviar datos</button>
                                
                            </form>
                            }
                        </div>
                        :null}
                <nav className='navPanel'>
                    <img src={logo} alt="logo" />
                    <button className='btnReg' onClick={logOut}>Cerrar session</button>
                </nav>
                <div className="contenedor">
                    <section className='sidebar'>
                        <div className="infoUser">
                            <img src={imagenURL} alt="imagen perfil" />
                            <hr />
                            <span className='userName'>{user.displayName}</span>
                        </div>
                        <div className="datosInfo">
                            <span className=''> <BiPhoneCall/> <span className='datos'>{userData.telefono}</span></span>
                            <span className=''> <BiCalendarStar/> <span className='datos'>{differenceInYears(fechaActual, (new Date(userData.fecha)))} años</span></span>
                        </div>
                    </section>
                    {user.emailVerified?
                    <section className='contentPanel'>
                        <div  style={activarControl?{ transform:'translateX(0%)' }:{ transform:'translateX(-100%)'}}  className="controlChildren">
                            <div className="control">
                                {hijoActivo!==null?
                                <>
                                <span className='titulo'><img src={hijoActivo.avatar ==1?boy:(hijoActivo.avatar==2?girl:null)}  onClick={()=>setRestablecerContraseña(true)} alt="avatar del hijo" />{hijoActivo.nombres} {hijoActivo.apellidos} - {differenceInYears(fechaActual, (new Date(hijoActivo.date)))} años <span style={{userSelect:'none'}} className='btnCerrar' onClick={()=>setActivarControl(false)}>x</span></span>
                                <div className='contBotonesControl'>
                                    <button  type="button">SMS</button>
                                    <button type="button">GPS</button>
                                    <button type="button">LLAMADA</button>
                                    <button type="button">CAMARA</button>
                                </div>
                                </>
                                :
                                null}
                            </div>
                        </div>
                        <div style={activarControl?{ transform:'translateX(0%)' }:{ transform:'translateX(-100%)'}}  className="childrenList">
                            <div  className="agregar">
                                <button type="button" style={{ fontSize:'130px'}} onClick={()=>setFormStatus(!formStatus)} className='agregarHijo'> <FcPlus/></button>
                                {formStatus?<div className="formularios"> {formularioAgg}</div>:null}
                            </div>

                            {userChildren!==null ? 
                                userChildren.map((children,index)=>(
                                    <button style={{userSelect:'none'}} className='agregarHijo' onClick={()=>controlHijo(index)} key={index}>
                                        <img src={children.avatar ==1?boy:(children.avatar==2?girl:null)}  alt="" />
                                        <span className='nameChildrens'>
                                            {children.nombres}
                                        </span>
                                        <span>
                                            {children.apellidos}
                                        </span>
                                    </button>
                                ))
                                : null}
                        </div>



                    </section>
                    :<div className='verifyEmailMessage'>
                        <div className="messageEmail">
                                <h1>Verificacion de email</h1>
                                <hr style={{width:'100%'}}/>
                                <p>Parece que aun no has verificado tu correo electronico, para verificar debes hacer click en el boton</p>
                                <br />
                                
                                <span><b>Nota:</b> <span>Despues de verificar el correo debes actualizar la pagina para que puedas acceder.</span></span>
                                <br />
                                <button type="button" disabled={stateVerifyEmail} onClick={verificarEmail} className='btnReg'>{stateVerifyEmail?'Correo Enviado':'Verificar Email'}</button>
                        </div>
                    </div>}
                </div>
            </div>
        )
    }


}

export default Panel