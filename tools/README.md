# Herramienta de Encriptación de URLs

Esta herramienta permite encriptar las URLs de los formularios de Google Forms para mejorar la seguridad de la aplicación.

## 📋 Requisitos

- Node.js instalado en el sistema

## 🚀 Uso

1. Navegar al directorio del proyecto:
```bash
cd "/run/media/sthip/Archivos/proyectos /Tipify pro"
```

2. Ejecutar la herramienta de encriptación:
```bash
node tools/encrypt-urls.js
```

3. Ingresar las URLs cuando se soliciten:
   - URL del formulario de SONDEO
   - URL del formulario de CLIENTE PERSISTE

4. El script generará automáticamente el archivo `js/config.encrypted.js` con las URLs encriptadas.

## 🔐 Seguridad

- Las URLs se encriptan usando **XOR cipher + Base64**
- Las URLs encriptadas NO son legibles en texto plano
- El archivo `config.encrypted.js` puede ser versionado sin exponer las URLs reales
- La clave de encriptación está ofuscada en el código

## 📝 Ejemplo de Uso

```bash
$ node tools/encrypt-urls.js

============================================================
  HERRAMIENTA DE ENCRIPTACIÓN DE URLs - Tipify Pro
============================================================

Esta herramienta encriptará las URLs de los formularios.
Las URLs encriptadas se guardarán en js/config.encrypted.js

Ingrese la URL del formulario de SONDEO:
> https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform?usp=pp_url

Ingrese la URL del formulario de CLIENTE PERSISTE:
> https://docs.google.com/forms/d/e/1FAIpQLSd.../viewform?usp=pp_url

------------------------------------------------------------
Generando archivo encriptado...
------------------------------------------------------------

✓ Archivo de configuración encriptada generado exitosamente:
  /path/to/js/config.encrypted.js

Las URLs han sido encriptadas y no son visibles en texto plano.
```

## ⚠️ Importante

- **NO** modificar manualmente el archivo `config.encrypted.js`
- Usar siempre esta herramienta para actualizar las URLs
- Las URLs originales **NO** deben estar en el código fuente
- El archivo `config.encrypted.js` debe estar incluido en `index.html`

## 🔄 Actualizar URLs

Para actualizar las URLs, simplemente ejecute nuevamente la herramienta:

```bash
node tools/encrypt-urls.js
```

El archivo anterior será sobrescrito con las nuevas URLs encriptadas.

## 🛠️ Solución de Problemas

### Error: "URL inválida"
- Asegúrese de que la URL sea de Google Forms
- La URL debe contener `docs.google.com/forms`

### Error al escribir el archivo
- Verifique que tenga permisos de escritura en el directorio `js/`
- Asegúrese de que el directorio `js/` exista

## 📚 Archivos Relacionados

- `js/configLoader.js` - Módulo que desencripta y carga las URLs
- `js/config.encrypted.js` - Archivo con las URLs encriptadas (generado)
- `index.html` - Incluye la configuración encriptada
