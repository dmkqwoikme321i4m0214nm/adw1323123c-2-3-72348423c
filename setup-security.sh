#!/bin/bash
# TypifyPro 4.0.0 - Credential Security Setup Script
# This script sets up proper security for the credentials file

CREDENTIALS_FILE="config/credentials.json"

echo "🔒 TypifyPro - Configuración de Seguridad de Credenciales"
echo "========================================================="
echo ""

# Check if credentials file exists
if [ ! -f "$CREDENTIALS_FILE" ]; then
    echo "❌ Error: $CREDENTIALS_FILE no existe"
    echo "   Creando desde template..."
    
    if [ -f "config/credentials.template.json" ]; then
        cp config/credentials.template.json "$CREDENTIALS_FILE"
        echo "✅ Archivo de credenciales creado"
    else
        echo "❌ Error: Template no encontrado"
        exit 1
    fi
fi

# Set restrictive permissions (read-only for owner)
echo "🔐 Estableciendo permisos restrictivos (400)..."
chmod 400 "$CREDENTIALS_FILE"

# Verify permissions
PERMS=$(stat -c "%a" "$CREDENTIALS_FILE" 2>/dev/null || stat -f "%A" "$CREDENTIALS_FILE" 2>/dev/null)

if [ "$PERMS" = "400" ]; then
    echo "✅ Permisos configurados correctamente: $PERMS"
else
    echo "⚠️  Advertencia: Permisos actuales: $PERMS (se esperaba 400)"
fi

# Check if file is in .gitignore
if grep -q "config/credentials.json" .gitignore 2>/dev/null; then
    echo "✅ Archivo protegido en .gitignore"
else
    echo "⚠️  Advertencia: Agregar 'config/credentials.json' a .gitignore"
fi

echo ""
echo "📋 Estado del archivo:"
ls -lh "$CREDENTIALS_FILE"

echo ""
echo "✅ Configuración de seguridad completada"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Este archivo contiene credenciales sensibles"
echo "   - Nunca lo compartas ni lo subas a repositorios públicos"
echo "   - Para modificar credenciales:"
echo "     1. chmod 600 $CREDENTIALS_FILE"
echo "     2. Edita el archivo"
echo "     3. chmod 400 $CREDENTIALS_FILE"
echo ""
