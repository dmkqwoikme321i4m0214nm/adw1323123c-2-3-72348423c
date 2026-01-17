# TypifyPro 4.0.1 - Credentials Configuration

## Overview

This directory contains the credentials configuration for TypifyPro's authentication system.

## Setup

1. **Initial Setup**: The `credentials.json` file has been created with a default admin user:
   - **Username**: `admin`
   - **Password**: `admin`

2. **Security**: 
   - The `credentials.json` file has restricted permissions (400) - only the owner can read (write-protected)
   - This file is excluded from version control via `.gitignore`
   - Passwords are stored as SHA-256 hashes
   - File should never be modified directly while application is running

## Changing Passwords

To change or add user credentials:

1. Use the browser console to generate a password hash:
   ```javascript
   // Open browser console and run:
   await window.CredentialManager.createPasswordHash('your-new-password')
   ```

2. Copy the generated hash

3. Edit `config/credentials.json` and update/add the user:
   ```json
   {
     "users": [
       {
         "username": "admin",
         "passwordHash": "paste-the-hash-here"
       }
     ]
   }
   ```

## File Structure

- `credentials.json` - Active credentials file (protected, not in git)
- `credentials.template.json` - Template showing the expected format
- `README.md` - This file

## Security Notes

⚠️ **Important**: 
- Never commit `credentials.json` to version control
- Keep file permissions at 400 (owner read-only, write-protected)
- Change the default admin password immediately in production
- To modify credentials, temporarily change permissions: `chmod 600 config/credentials.json`
- After editing, restore protection: `chmod 400 config/credentials.json`
- This is a client-side authentication system suitable for local/desktop applications
- For web applications with multiple users, consider server-side authentication

## Troubleshooting

**Can't login?**
- Verify `credentials.json` exists in the `config/` directory
- Check file permissions: `ls -la config/credentials.json`
- Ensure the JSON format is valid
- Try the default credentials: admin/admin

**Reset to defaults?**
- Copy `credentials.template.json` to `credentials.json`
- Set read-only permissions: `chmod 400 config/credentials.json`
