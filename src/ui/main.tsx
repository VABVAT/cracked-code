// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {HashRouter, Route, Routes} from 'react-router-dom'
import Welcome from './Welcome.tsx'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <Routes>
      <Route path='/'  element={<App />  }/>
      <Route path='/s'  element={<Welcome />  }/>
  </Routes>
  </HashRouter>
)
