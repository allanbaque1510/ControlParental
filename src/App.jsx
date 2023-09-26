import { AuthProvider } from "./context/authContext"
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Index from "./Index"
import Panel from "./Panel"
function App() {
  
  return (
    <AuthProvider>
       <BrowserRouter>
          <Routes>
            <Route path='/' element={<Index/>} />
            <Route element={<ProtectedRoute/>}>

              <Route path='/panel' element={<Panel/>} />
            
            </Route>
          </Routes>
        </BrowserRouter>
    </AuthProvider>
  )
}

export default App
