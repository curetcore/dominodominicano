# 📤 Instrucciones para Subir a GitHub

## Opción 1: Usando GitHub Personal Access Token (Recomendado)

1. **Crear un Personal Access Token en GitHub**:
   - Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token"
   - Selecciona los permisos: `repo` (todos)
   - Copia el token generado

2. **Configurar git con el token**:
   ```bash
   git remote set-url origin https://TU_USUARIO:TU_TOKEN@github.com/curetcore/dominodominicano.git
   ```

3. **Push el código**:
   ```bash
   git push -u origin main
   ```

## Opción 2: Usando GitHub CLI

1. **Instalar GitHub CLI**:
   ```bash
   brew install gh
   ```

2. **Autenticarse**:
   ```bash
   gh auth login
   ```

3. **Push el código**:
   ```bash
   git push -u origin main
   ```

## Opción 3: Usando SSH

1. **Generar clave SSH** (si no tienes una):
   ```bash
   ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
   ```

2. **Agregar clave a GitHub**:
   - Copia tu clave pública: `cat ~/.ssh/id_ed25519.pub`
   - Ve a GitHub → Settings → SSH and GPG keys → New SSH key
   - Pega la clave

3. **Cambiar remote a SSH**:
   ```bash
   git remote set-url origin git@github.com:curetcore/dominodominicano.git
   ```

4. **Push el código**:
   ```bash
   git push -u origin main
   ```

## Opción 4: Manual (Si todo falla)

1. **Crear un archivo ZIP**:
   ```bash
   zip -r dominican-domino.zip . -x "*.git*" "node_modules/*" "dist/*"
   ```

2. **Subir manualmente**:
   - Ve a https://github.com/curetcore/dominodominicano
   - Click "Add file" → "Upload files"
   - Arrastra el ZIP o los archivos

## 📝 Notas Importantes

- El repositorio ya tiene el código listo
- Solo necesitas autenticarte correctamente
- Una vez subido, Easypanel puede conectarse automáticamente

## 🚀 Después de Subir

1. Ve a tu repositorio: https://github.com/curetcore/dominodominicano
2. Verifica que todos los archivos estén ahí
3. En Easypanel, conecta este repositorio
4. ¡Listo para desplegar!