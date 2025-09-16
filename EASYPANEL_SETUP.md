# 🚀 Configuración en Easypanel - Dominó Dominicano

## 📋 Pasos para Configurar

### 1. **Acceder a Easypanel**
- Ve a https://easypanel.io
- Inicia sesión con tu cuenta

### 2. **Crear Nuevo Proyecto**
- Click en "New Project" o "+"
- Nombre del proyecto: `dominican-domino` (o el que prefieras)

### 3. **Conectar GitHub**
- Source: **GitHub**
- Repository: `curetcore/dominodominicano`
- Branch: `main`
- Auto Deploy: ✅ (recomendado)

### 4. **Configuración de Build**
```
Build Type: Dockerfile
Dockerfile Path: ./Dockerfile (default)
Build Context: . (root)
```

### 5. **Configuración de Runtime**
```
Port: 3001
Replicas: 1 (o más si necesitas alta disponibilidad)
```

### 6. **Variables de Entorno**
Click en "Environment" y agrega:
```
NODE_ENV=production
PORT=3001
```

### 7. **Configuración de Dominio**
- Easypanel te dará un dominio como: `dominican-domino-xxxx.easypanel.host`
- O puedes agregar tu dominio personalizado:
  - Click en "Domains"
  - Add Custom Domain
  - Configura el CNAME en tu DNS

### 8. **Health Check**
```
Path: /
Interval: 30
Timeout: 10
Success Codes: 200
```

### 9. **Recursos (Opcional)**
Si necesitas más recursos:
```
CPU: 0.5 - 1 vCPU
Memory: 512MB - 1GB
```

### 10. **Deploy**
- Click en "Deploy" 
- Espera 3-5 minutos mientras:
  - Construye la imagen Docker
  - Instala dependencias
  - Compila el frontend
  - Inicia el servidor

## ✅ Verificación Post-Deploy

### 1. **Check de Salud**
- Ve a la URL proporcionada
- Deberías ver la página principal del dominó

### 2. **Prueba Básica**
- Crea una sala
- Abre en otra ventana/dispositivo
- Únete con el código
- Verifica que el WebSocket conecte

### 3. **Logs**
- En Easypanel, ve a "Logs"
- Busca: "Servidor corriendo en puerto 3001"
- Verifica que no haya errores

## 🔧 Troubleshooting

### WebSocket no conecta
- Verifica que el puerto 3001 esté expuesto
- Revisa los logs por errores de CORS

### Build falla
```bash
# En los logs verifica:
- Node version (necesita 18+)
- npm install exitoso
- vite build exitoso
```

### App no carga
- Verifica que dist/ se haya generado
- Check que express sirva archivos estáticos

## 📊 Monitoreo

### Métricas en Easypanel
- CPU usage
- Memory usage
- Request count
- Response time

### Logs en tiempo real
- WebSocket connections
- Game events
- Errors

## 🎯 Optimizaciones Recomendadas

1. **CDN para Assets**
   - Cloudflare
   - O el CDN de Easypanel

2. **SSL/HTTPS**
   - Easypanel lo configura automáticamente

3. **Escalado**
   - Aumenta replicas si tienes muchos usuarios
   - Considera Redis para sesiones (futuro)

## 🎮 URLs Finales

- **Producción**: https://tu-dominio.easypanel.host
- **WebSocket**: wss://tu-dominio.easypanel.host
- **Health**: https://tu-dominio.easypanel.host/

## 📱 Compartir el Juego

Una vez desplegado, comparte:
```
🎮 ¡Juega Dominó Dominicano Online!
🔗 https://tu-dominio.easypanel.host

✅ Reglas dominicanas auténticas
✅ Multijugador en tiempo real
✅ Gratis y sin anuncios
✅ Funciona en móviles

¡Dale que llegamo'! 🇩🇴
```

---

¡Tu dominó está listo para el mundo! 🚀