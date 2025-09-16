# Dominó Dominicano 🇩🇴

Juego de dominó multijugador en línea con estilo dominicano. Soporta partidas en parejas (2 vs 2) o individuales, con chat en tiempo real y frases típicas dominicanas.

## Características

- 🎮 Multijugador en tiempo real con Socket.IO
- 👥 Modo parejas (2 vs 2) o individual
- 💬 Chat con frases dominicanas preestablecidas
- 📱 Diseño responsivo para web y móvil
- 🏆 Sistema de puntuación dominicano (200 puntos)
- 🎯 Reglas auténticas del dominó dominicano

## Instalación

```bash
# Clonar el repositorio
git clone [url-del-repo]

# Entrar al directorio
cd dominican-domino

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El servidor correrá en `http://localhost:3001` y la aplicación web en `http://localhost:3000`.

## Cómo jugar

1. Crea una sala nueva o únete a una existente con el código
2. Espera a que se unan 4 jugadores
3. Selecciona tu equipo (Equipo 1 o Equipo 2)
4. Marca que estás listo
5. ¡A jugar dominó!

### Reglas dominicanas

- El jugador con doble 6 empieza
- Se juega en parejas sentadas alternadamente
- El primer equipo en llegar a 200 puntos gana
- Si el juego se tranca, gana el equipo con menos puntos en mano

## Tecnologías

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + Socket.IO
- Lógica compartida: ES6 Modules

## Estructura del proyecto

```
dominican-domino/
├── src/                    # Código frontend React
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas de la aplicación
│   ├── hooks/             # Custom hooks
│   └── styles/            # Estilos CSS
├── server/                # Servidor backend
├── shared/                # Lógica compartida
└── public/                # Archivos estáticos
```

## Próximas mejoras

- [ ] Versión móvil nativa con React Native
- [ ] Torneos y rankings
- [ ] Estadísticas de jugadores
- [ ] Más modos de juego
- [ ] Integración con redes sociales