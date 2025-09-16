# ✅ REGLAS DOMINICANAS IMPLEMENTADAS

## 📋 Reglas Oficiales Actualizadas

### 🎯 Objetivo
- **Meta**: Primera pareja en alcanzar **150 puntos** (actualizado de 200)
- **Jugadores**: 4 personas en parejas (2 vs 2)
- **Orden**: Sentido contrario a las manecillas del reloj

### 🎮 Inicio de Partida
- **Primera ronda**: Sale quien tiene el doble 6 ("el burro")
- **Siguientes rondas**: Sale quien ganó la anterior ✅

### 💯 Sistema de Puntuación

#### Puntuación Normal ✅
- Al dominar: Se suman los puntos de las fichas del equipo perdedor
- En tranque: Gana todos los puntos de la mesa quien tiene menos

#### Puntuaciones Especiales (30 puntos) ✅

1. **🎯 PASE DE SALIDA** ✅
   - Cuando el 2do jugador no puede jugar la ficha de salida
   - Implementado: Se detecta y suma 30 puntos

2. **🔄 PASE CORRIDO/REDONDO** ✅
   - Hacer pasar a los otros 3 jugadores consecutivamente
   - El jugador vuelve a tirar
   - Implementado: Sistema completo con retorno de turno

3. **✨ CAPICÚA** ✅
   - Ganar con ficha que sirve por ambos lados
   - NO vale con dobles o fichas blancas
   - Implementado: Validación completa

4. **🔒 TRANQUE** ✅
   - Cerrar el juego intencionalmente
   - Se suman TODOS los puntos de la mesa
   - En empate: gana quien salió esa ronda

### 📏 Reglas Importantes ✅
- **Prohibido pasar con ficha**: Penalización de 30 puntos al equipo contrario ✅
- **Orden de juego**: Implementado correctamente
- **Modalidad**: Dominicana (150 puntos)

### 🎲 Características Dominicanas

#### Nombres de fichas implementados ✅
```javascript
'6-6': 'El burro / La cochina'
'0-0': 'La caja'
'2-2': 'El duque'
'4-4': 'El cuatro doble'
```

#### Frases típicas actualizadas ✅
- "¡Agua!" - Cuando pasas
- "¡Me pegué!" - Cuando dominas
- "¡Capicúa manito!" - Al hacer capicúa
- "¡Tranque!" - Al cerrar el juego
- "Dale que llegamo'"
- "Ta' buena esa"

### 🎨 Interfaz Actualizada
- Muestra "de 150" junto a los puntajes ✅
- Notificaciones animadas para puntuaciones especiales ✅
- Recordatorio de reglas en pantalla ✅
- Frases dominicanas en botones rápidos ✅

### 🔧 Funcionalidades Técnicas
- Detección automática de puntuaciones especiales
- Validación de jugadas ilegales
- Sistema de penalizaciones
- Seguimiento de ganador de ronda para siguiente salida

## 🚀 Cómo Jugar

1. El jugador con el doble 6 empieza la primera ronda
2. Juega en sentido contrario a las manecillas
3. DEBES jugar si tienes ficha (penalización si pasas)
4. Puntuaciones especiales se suman automáticamente
5. Primera pareja en llegar a 150 gana

## 📝 Diferencias con versión anterior
- Cambiado de 200 a 150 puntos
- Agregadas todas las puntuaciones especiales
- Sistema de penalizaciones
- Reglas de salida por ronda ganada
- Validaciones estrictas de capicúa

¡El juego ahora sigue las reglas oficiales del dominó dominicano! 🇩🇴