import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext'

import logo from './assets/logo.jpeg' 
import DotLoader  from "react-spinners/DotLoader";
const ProtectedRoute = () => {
    const {isAuthenticated,loading} = useAuth();

    if(loading) return (
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
    if(!loading && !isAuthenticated) return <Navigate to='/' replace/>
    
    return  <Outlet/>
    
}

export default ProtectedRoute