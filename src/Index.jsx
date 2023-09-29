import { useState, useEffect, useRef} from 'react';
import { BiEnvelope,BiIdCard,BiLock,BiPhoneCall,BiUser,BiSolidCalendar } from "react-icons/bi";
import { useNavigate, Link } from 'react-router-dom'
import logo from './assets/logo.jpeg' 
import imProfile from './assets/imgProfile.png' 
import { useAuth } from './context/AuthContext';
import imgParental from './assets/controlParental.png' 
import { differenceInYears } from 'date-fns';

function Index() {
    const inputImgRef = useRef(null)
    const auth = useAuth()
  const [fechaHora, setFechaHora] = useState(new Date());
  const [formulario, setFormulario] = useState(0)
  const [tipoInput, setTipoInput] = useState('text');
  const [inputState, setInputState] = useState("")
  const [aceptarTerminos, setAceptarTerminos] = useState(false)
  const [restablecerContraseña, setRestablecerContraseña] = useState(false)
  const [errorMessage, setErrorMessage ] = useState('')
  const [emailReset, setEmailReset ] = useState('')

  const navigate = useNavigate()
  const fechaActual = new Date();

  const [imagen, setImagen] = useState(null);

  const handleImagenSeleccionada = (event) => {
    const imagenSeleccionada = event.target.files[0];
    setImagen(imagenSeleccionada);
  };

  useEffect(()=>{
    if(auth.isAuthenticated && !auth.loading) navigate('/panel')
  },[auth.isAuthenticated])
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
  
  const [datosFormulario, setDatosFormulario] = useState({
    firstname: '',
    secondname: '',
    cedula: '',
    date: '',
    email: '',
    cellphone: '',
    password: '',
  });
  const [datosLogin, setDatosLogin] = useState({
    email: '',
    password: '',
  });
  useEffect(() => {
    // Función para actualizar la fecha y hora cada segundo
    const intervalID = setInterval(() => {
      setFechaHora(new Date());
    }, 1000);

    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalID);
  }, []);
    // Formatea la fecha y hora en una cadena legible
    const formatoHora = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
    const valoresRegistro = (event) =>{
      const { name, value } = event.target;
          setDatosFormulario({
            ...datosFormulario,
            [name]: value,
          });
      
    }
    const valoresLogin = (event) =>{
        const { name, value } = event.target;
            setDatosLogin({
              ...datosLogin,
              [name]: value,
            });
        
      }
    const formatoFecha = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const cerrarForm=()=>{
        setFormulario(0)
        setDatosFormulario({
            firstname: '',
            secondname: '',
            cedula: '',
            date: '',
            email: '',
            cellphone: '',
            password: ''
          })
          setInputState("")
          setDatosLogin({
            email: '',
            password: '',
          })
    }
    const handleLogin = (e) =>{
        e.preventDefault()
        auth.login(datosLogin)

    }
    const handleReg = (e) =>{
        e.preventDefault()
        setErrorMessage('')
        if(!datosFormulario.firstname.includes(' ') || datosFormulario.firstname.length < 8){
          return setErrorMessage('Debes tener los dos nombres')
        }
        if(!datosFormulario.secondname.includes(' ') || datosFormulario.secondname.length < 8){
          return setErrorMessage('Debes tener los dos apellidos')
        }
        if(datosFormulario.cedula.length < 10){
          return setErrorMessage('Debes ingresar una cedula valida')
        }

        if(datosFormulario.cellphone.length < 10){
          return setErrorMessage('Debes ingresar un numero valido')
        }
        if(differenceInYears(fechaActual, (new Date(datosFormulario.date))) < 17  ){
          return setErrorMessage('Debes ser mayor de edad')
        }
        if(!aceptarTerminos){
          return setErrorMessage('Debes aceptar los terminos y condiciones para continuar')
        }



        auth.register(datosFormulario,imagen)
    }
    const clickImg = ()=>{
        inputImgRef.current.click()
    }
    const login = 
        <form onSubmit={handleLogin} >
            <button className='btnCerrar' type="button" onClick={cerrarForm}>X</button>
          <h3>INICIAR SESION</h3>
          {auth.errorMessage?(auth.errorMessage.form === 'Login'?<span className='errorMessage'>{auth.errorMessage.message}</span>:null) :null}
          <div className="input-container">
            <input type="email" onClick={()=>{setInputState('loginEmail')}} required={true} value={datosLogin.email}  onChange={valoresLogin} name="email" />
            {(inputState !== 'loginEmail' && datosLogin.email.length <=0)?
            <>
                <span className='icon'><BiEnvelope/></span>
                <span className="text">CORREO ELECTRONICO</span>
            </>
                
            :null}
          </div>
          <div className="input-container">
            <input type="password" onClick={()=>{setInputState('loginPassword')}} required={true} value={datosLogin.password}  onChange={valoresLogin} name="password" />
            {(inputState !== 'loginPassword' && datosLogin.password.length <=0)?
            <>
                <span className='icon'><BiLock/></span>
                <span className="text">CONTRASEÑA</span>
            </>
                
            :null}
          </div>
          <button type='button' onClick={()=>setRestablecerContraseña(true)}>¿Ha olvidado la contraseña?</button>
          <button type="submit">INGRESAR</button>
        </form>;
    
    const registro = 
        <form onSubmit={handleReg}>
            <button className='btnCerrar' type="button" onClick={cerrarForm}>X</button>

          <h3>CREA TU CUENTA</h3>
          {errorMessage?(<span className='errorMessage'>{errorMessage}</span>) :null}
          {auth.errorMessage?(auth.errorMessage.form === 'Register'?<span className='errorMessage'>{auth.errorMessage.message}</span>:null) :null}

          <div className="input-container">
            <input type="text" onClick={()=>{setInputState('firstname')}} required={true} value={datosFormulario.firstname}  onChange={valoresRegistro} name="firstname" />
            {(inputState !== 'firstname' && datosFormulario.firstname.length <=0)?
            <>
                <span className='icon'><BiUser/></span>
                <span className="text">NOMBRES COMPLETOS</span>
            </>
                
            :null}
          </div>
          <div className="input-container">
            <input type="text" onClick={()=>{setInputState('secondname')}} required={true} value={datosFormulario.secondname} onChange={valoresRegistro} name="secondname" />
            {inputState !== 'secondname' && datosFormulario.secondname.length <=0?
            <>
              <span className='icon'><BiUser/></span>
              <span className="text">APELLIDOS COMPLETOS</span>
            </>
            :null}
          </div>
          <div className="input-container">
            <input type="number" onClick={()=>{setInputState('cedula')}} required={true}  value={datosFormulario.cedula} onChange={valoresRegistro} name="cedula" />
            {inputState !== 'cedula'&& datosFormulario.cedula.length <=0?
            <>
                <span className='icon'><BiIdCard/></span>
                <span className="text">CEDULA IDENTIDAD</span>
            </>
                
            :null}
            

          </div>
          <div className="input-container">
            <input type={tipoInput} onClick={()=>{setInputState('date');  setTipoInput('date')}} required={true} onBlur={()=>{setTipoInput('text')}} value={datosFormulario.date} onChange={valoresRegistro} name="date" />
         
            {inputState !== 'date'&& datosFormulario.date.length <=0?
            <>
              <span className='icon'><BiSolidCalendar/></span>
              <span className="text">FECHA DE NACIMIENTO</span>
            </>                
            :null}
          </div>

          <div className="input-container">
            <input type="email" onClick={()=>{setInputState('email')}} required={true} value={datosFormulario.email} onChange={valoresRegistro} name="email" />
            
            {inputState !== 'email'&& datosFormulario.email.length <=0?
            <>
              <span className='icon'><BiEnvelope/></span>
              <span className="text">EMAIL(VERIFICADO)</span>
            </>                
            :null}

          </div>
          <div className="input-container">
            <input type="number" onClick={()=>{setInputState('cellphone')}} required={true} value={datosFormulario.cellphone} onChange={valoresRegistro} name="cellphone" />
            
            {inputState !== 'cellphone' && datosFormulario.cellphone.length <=0 ?
            <>
              <span className='icon'><BiPhoneCall/></span>
              <span className="text">CELULAR (VERIFICADO)</span>
            </>                
            :null}

          </div>
          <div className="input-container">
            <input type="password" onClick={()=>{setInputState('password')}} required={true} value={datosFormulario.password} onChange={valoresRegistro} name="password" />
       
            {inputState !== 'password'&& datosFormulario.password.length <=0 ?
            <>
             <span className='icon'><BiLock/></span>
            <span className="text">CONTRASEÑA</span>
            </>                
            :null}

          </div>
          <div className="inputImg" onClick={clickImg}>
            {imagen? <img src={URL.createObjectURL(imagen)} alt="imagen perfil" /> :<img src={imProfile} alt="imagen perfil" />}
            
            <input type="file" accept="image/*" ref={inputImgRef} style={{display:'none'}} onChange={handleImagenSeleccionada} />
          </div>
          <span className='termCond'>
            <input type="checkbox" name="condiciones" checked={aceptarTerminos} onChange={()=>setAceptarTerminos(!aceptarTerminos)} id="condiciones" /> <span>He aceptado los terminos y condiciones</span>
          </span>
          <button type="submit">GUARDAR DATOS</button>
        </form> ;
const formulariosData =(numero)=>{
    setFormulario(numero)
    if(numero == 1){}
}

  return (
    <>
    <div style={restablecerContraseña?null:{opacity:'0', height:'0%', width:'0%', top:'-20%', right:'-20%'}} className="resetPassword">
      <form onSubmit={(e)=>{e.preventDefault();auth.resetPassword(emailReset)}}>
        <button className='btnCerrar' type="button" onClick={()=>setRestablecerContraseña(false)}>X</button>
        <h2>Ingrese el correo para restablecer la contraseña</h2>
        {auth.errorMessage?(auth.errorMessage.form === 'resetPassword'?<span className='errorMessage'>{auth.errorMessage.message}</span>:null) :null}

        <input type="email" value={emailReset} onChange={(e)=>{setEmailReset(e.target.value)}} required={true} name="emailReset" id="emailReset" />
        <button  disabled={auth.stateResetPassword} className='btnReg' type="submit">{auth.stateResetPassword?'Email enviado':'Restablecer contraseña'}</button>
        
      </form>
    </div>
      <nav className='navBar'>
        <img className='logo' src={logo} alt="logo" />
        {/* <button className='btnAnchor' type="button">¿Quienes somos?</button>
        <button className='btnAnchor' type="button">Soporte</button> */}
        <div className="">
          <button className='btnAnchor' onClick={()=>formulariosData(1)} type="button">Iniciar Sesion</button>
          <button className='btnReg'  onClick={()=>formulariosData(2)} type="button">Registrarse</button>
          <div className="formularios">
            {formulario !== 0? (formulario === 1?login:registro):null}
          </div>
        </div>
      </nav>
      <div className='contIni'>
       <img src={imgParental} alt="" />
       <h2>Sistema Parental UIDE </h2>
      </div>
      <footer>
     
        <span>{fechaHora.toLocaleTimeString(undefined, formatoHora)}</span>
  
        <span>{fechaHora.toLocaleDateString(undefined, formatoFecha)}</span>
      </footer>
    </>
  )
}

export default Index
