# 🚀 Guía de Despliegue - Dominó Dominicano

## 📋 Requisitos Previos

- Node.js 18+
- Git
- Cuenta en GitHub
- Cuenta en Easypanel o servidor con Docker

## 🔧 Configuración Local

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Probar localmente**:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

3. **Construir para producción**:
   ```bash
   npm run build
   npm start
   ```

## 📤 Subir a GitHub

1. **Inicializar repositorio**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Dominican Domino game"
   ```

2. **Crear repositorio en GitHub** y conectar:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/dominican-domino.git
   git branch -M main
   git push -u origin main
   ```

## 🐳 Despliegue con Docker

### Opción 1: Docker Local

```bash
# Construir imagen
docker build -t dominican-domino .

# Ejecutar contenedor
docker run -p 3001:3001 -e NODE_ENV=production dominican-domino

# O usar docker-compose
docker-compose up -d
```

### Opción 2: Easypanel

1. **En Easypanel**, crear nuevo proyecto

2. **Conectar GitHub**:
   - Source: GitHub
   - Repository: `tu-usuario/dominican-domino`
   - Branch: `main`

3. **Configuración**:
   - Build Type: Dockerfile
   - Port: 3001
   - Health Check: `/`

4. **Variables de entorno**:
   ```
   NODE_ENV=production
   PORT=3001
   ```

5. **Dominio personalizado** (opcional):
   - Agregar tu dominio en la configuración
   - Configurar DNS apuntando a Easypanel

### Opción 3: Railway/Render/Heroku

**Railway.app**:
```bash
# Instalar CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

**Render.com**:
1. Conectar GitHub
2. Elegir "Web Service"
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`

## 🔒 Configuración de Producción

### Variables de Entorno Recomendadas

```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://tu-dominio.com
SOCKET_TIMEOUT=120000
MAX_ROOMS=100
MAX_PLAYERS_PER_ROOM=4
```

### Seguridad

1. **CORS**: Configurar dominios permitidos en producción
2. **Rate Limiting**: Agregar límites para prevenir spam
3. **SSL/HTTPS**: Usar certificado SSL (Easypanel lo maneja automáticamente)

## 📊 Monitoreo

### Logs
```bash
# Ver logs en Docker
docker logs -f dominican-domino

# En Easypanel
# Los logs están disponibles en el dashboard
```

### Health Check
- Endpoint: `GET /`
- Expected: 200 OK

## 🐛 Troubleshooting

### WebSocket no conecta
- Verificar que el puerto 3001 esté abierto
- Revisar configuración de CORS
- Asegurar que Socket.IO esté usando transports: ['websocket', 'polling']

### Build falla
- Verificar versión de Node.js (18+)
- Limpiar cache: `rm -rf node_modules package-lock.json && npm install`

### Performance
- Habilitar compresión en Express
- Usar CDN para assets estáticos
- Configurar cache headers

## 📱 Configuración para Móviles

El juego es responsive y funciona en móviles. Para app nativa futura:

1. **PWA** (inmediato):
   - Agregar manifest.json
   - Service Worker para offline
   - Iconos para instalación

2. **React Native** (futuro):
   - Reutilizar lógica de `shared/`
   - Nueva app con React Native
   - Conectar al mismo servidor

## 🎯 Post-Despliegue

1. **Probar funcionalidades**:
   - Crear sala
   - Unirse con código
   - Jugar partida completa
   - Verificar puntuaciones especiales

2. **Optimizaciones**:
   - Comprimir imágenes
   - Minificar CSS/JS
   - Lazy loading de componentes

3. **Analytics** (opcional):
   - Google Analytics
   - Contadores de partidas
   - Métricas de usuarios

## 📞 Soporte

Si tienes problemas con el despliegue:
1. Revisa los logs
2. Verifica las variables de entorno
3. Asegúrate de que los puertos estén correctos

¡Listo para jugar dominó dominicano en línea! 🇩🇴