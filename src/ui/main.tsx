// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {HashRouter, Route, Routes} from 'react-router-dom'
import Welcome from './Welcome.tsx'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <Routes>
      <Route path='/main-page'  element={<App />  }/>
      <Route path='/'  element={<Welcome />  }/>
  </Routes>
  </HashRouter>
)
