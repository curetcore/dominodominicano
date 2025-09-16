# Guía para crear la app móvil

## Opción 1: React Native (Recomendado)

Para crear la versión móvil de la app usando React Native:

```bash
# Instalar React Native CLI
npm install -g react-native-cli

# Crear nuevo proyecto React Native
npx react-native init DominicanDominoMobile

# Instalar dependencias necesarias
cd DominicanDominoMobile
npm install socket.io-client react-navigation react-native-vector-icons
```

### Estructura sugerida:
- Reutilizar la lógica del juego en `shared/gameLogic.js`
- Adaptar los componentes React para React Native
- Usar React Navigation para la navegación
- Mantener la conexión Socket.IO con el mismo servidor

## Opción 2: Progressive Web App (PWA)

La aplicación web actual ya es responsiva. Para convertirla en PWA:

1. Agregar manifest.json en la carpeta public:
```json
{
  "name": "Dominó Dominicano",
  "short_name": "Dominó RD",
  "theme_color": "#002d62",
  "background_color": "#002d62",
  "display": "standalone",
  "scope": "/",
  "start_url": "/"
}
```

2. Agregar Service Worker para funcionalidad offline
3. Agregar iconos para instalación en dispositivos

## Opción 3: Capacitor (Más fácil)

Convertir la web actual en app móvil:

```bash
# Instalar Capacitor
npm install @capacitor/core @capacitor/cli

# Inicializar Capacitor
npx cap init

# Agregar plataformas
npx cap add ios
npx cap add android

# Construir y sincronizar
npm run build
npx cap sync
```

## Para empezar el desarrollo móvil:

1. Primero prueba la versión web en tu móvil
2. La app ya es responsiva y funcionará bien
3. Si necesitas características nativas, usa Capacitor
4. Para mejor rendimiento, considera React Native

El servidor Socket.IO ya está listo para soportar clientes móviles.