import React from 'react';
import { Menubar } from 'primereact/menubar';
import { Dock } from 'primereact/dock';

import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';

// Import the components for each page
import Inicio from './pages/Inicio';
import ProgramaSemanal from './pages/ProgramaSemanal';
import DeCasaEnCasa from './pages/DeCasaEnCasa';
import Publica from './pages/Publica';
import Territorios from './pages/Territorios';
import Grupos from './pages/Grupos';
import AgendaEventos from './pages/AgendaEventos';
import ProgramaMantenimiento from './pages/ProgramaMantenimiento';


function App() {
  const navigate = useNavigate();
  const siteTitle = "Co. Este"; // Variable for site title
  const pageTitle = "My Website"; // Variable for the page title (can be updated per page if needed)

  // Define menu items, excluding 'Inicio'
  const items = [
    {
      label: 'Reuniones', 
      items: [{ label: 'Programa semanal', command: () => navigate('/reuniones/programa-semanal') }]
    },
    {
      label: 'Predicación', 
      items: [
        {
          label: 'Programas',
          items: [
            { label: 'De casa en casa', command: () => navigate('/predicacion/programas/de-casa-en-casa') },
            { label: 'Pública', command: () => navigate('/predicacion/programas/publica') }
          ]
        },
        {
          label: 'Mapas',
          items: [
            { label: 'Territorios', command: () => navigate('/predicacion/mapas/territorios') },
            { label: 'Grupos', command: () => navigate('/predicacion/mapas/grupos') }
          ]
        }
      ]
    },
    {
      label: 'Más', 
      items: [
        { label: 'Agenda de eventos', command: () => navigate('/mas/agenda-de-eventos') },
        { label: 'Programa de mantenimiento', command: () => navigate('/mas/programa-de-mantenimiento') }
      ]
    }
  ];

  // Custom start element for left-aligned title
  const start = (
    <a className="site-title" onClick={() => navigate('/')}>
      {siteTitle}
    </a>
  );

  return (
    


    <div className="app-container">

<Dock model={items} position="left" />
      <Menubar model={items} start={start} />
      <div className="content-container">
      
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/reuniones/programa-semanal" element={<ProgramaSemanal />} />
          <Route path="/predicacion/programas/de-casa-en-casa" element={<DeCasaEnCasa />} />
          <Route path="/predicacion/programas/publica" element={<Publica />} />
          <Route path="/predicacion/mapas/territorios" element={<Territorios />} />
          <Route path="/predicacion/mapas/grupos" element={<Grupos />} />
          <Route path="/mas/agenda-de-eventos" element={<AgendaEventos />} />
          <Route path="/mas/programa-de-mantenimiento" element={<ProgramaMantenimiento />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
