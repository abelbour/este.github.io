import React from 'react';
import { Card } from 'primereact/card';
const Inicio = () => (
  <div>
<Card title="Reuniones">
    <ul className="m-0">
        <li>Programa semanal</li>
    </ul>
</Card>
<br/>
<Card title="Predicación">
<ul className="m-0">
<li>Programa de casa en casa</li>
    <li>Programa de predicación pública</li>
    <li>Mapa de Territorios</li>
    <li>Mapa de grupos</li>
    </ul>
</Card>
<br/>
<Card title="Más">
<ul className="m-0">
<li>Agenda de eventos</li>
    <li>Programa de mantenimiento del Salón del Reino</li>
    </ul>
</Card>


  </div>
);

export default Inicio;
