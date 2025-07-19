# Evolution API WhatsApp Integration

## Overview
Complete WhatsApp integration using Evolution API for phone verification during user registration and automated notifications.

## Features

### 🔐 Phone Verification System
- **6-digit verification codes** sent via WhatsApp
- **10-minute expiry** for security
- **Brazilian phone number formatting** (+55 automatic)
- **Step-by-step UX flow** (phone → code → verified)

### 📱 Message Templates
- **Verification Code**: Professional branded message with security instructions
- **Welcome Message**: Automatic welcome after successful verification
- **Custom Messages**: Admin testing endpoint for custom messages

### 🛡️ Security Features
- **Rate limiting** through authentication middleware
- **Code expiry** automatic cleanup
- **Phone validation** with regex patterns
- **User ownership** verification for all operations

## Architecture

### Backend Services

#### `server/services/evolutionAPI.ts`
```typescript
// Singleton service with automatic connection verification
- formatPhoneNumber() - Converts to WhatsApp format
- sendMessage() - Core messaging functionality
- sendPhoneVerificationCode() - Verification workflow
- sendWelcomeMessage() - Onboarding automation
- getInstanceInfo() - Connection status
```

#### `server/routes/phoneVerification.ts`
```typescript
// RESTful endpoints for phone verification
POST /api/phone/send-verification - Send verification code
POST /api/phone/verify-code - Verify entered code
GET /api/phone/status - Check verification status
POST /api/phone/test - Admin testing (admin only)
```

### Frontend Components

#### `client/src/pages/PhoneVerification.tsx`
- **Multi-step interface**: phone input → code entry → success
- **Real-time validation** with error handling
- **Professional UI** with proper loading states
- **Responsive design** for all screen sizes

### Database Schema
```sql
-- Added to users table
phone_verified BOOLEAN NOT NULL DEFAULT false
phone_verification_code TEXT
phone_verification_expiry TIMESTAMP
```

## Configuration

### Environment Variables (Secrets)
```
EVOLUTION_API_KEY=your_api_key_here
EVOLUTION_API_URL=https://your-evolution-api.domain.com
EVOLUTION_INSTANCE_NAME=your_instance_name
```

### Auto-Configuration
- **Service initialization** on startup
- **Connection verification** automatic
- **Error handling** with graceful degradation
- **Logging system** comprehensive debugging

## Usage Examples

### Phone Verification Flow
1. User enters phone number on registration
2. System sends 6-digit code via WhatsApp
3. User enters code within 10 minutes
4. Phone verified, welcome message sent automatically

### Admin Testing
```bash
curl -X POST /api/phone/test \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "11999999999", "message": "Test message"}'
```

### API Responses
```json
// Verification code sent
{
  "success": true,
  "message": "Código de verificação enviado via WhatsApp!"
}

// Code verified successfully
{
  "success": true,
  "message": "Telefone verificado com sucesso!"
}

// Phone status check
{
  "success": true,
  "data": {
    "phone": "11999999999",
    "phoneVerified": true,
    "hasVerificationPending": false
  }
}
```

## Error Handling

### Common Error Scenarios
- **API connection failed**: Service degradation with user notification
- **Invalid phone format**: Real-time validation with helpful messages
- **Code expired**: Clear messaging with option to request new code
- **Code mismatch**: Security-focused error without revealing details

### Logging System
```
✅ [EVOLUTION_API] Service initialized successfully
✅ [EVOLUTION_API] Connection verified successfully
[EVOLUTION_API] Sending message to 11999999999
✅ [EVOLUTION_API] Message sent successfully: msg_id_123
❌ [EVOLUTION_API] Error 403: {"message":"You are not subscribed to this API."}
```

## Integration Points

### Registration Flow
```typescript
// Enhanced registration with phone support
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  phone: z.string().optional() // New field
});
```

### User Authentication
```typescript
// Login response includes phone verification status
{
  user: { /* user data */ },
  requiresPhoneVerification: boolean
}
```

## Production Readiness

### Performance Optimizations
- **Singleton pattern** prevents multiple instances
- **Connection pooling** for API requests
- **Async operations** non-blocking message sending
- **Error resilience** graceful API failures

### Security Measures
- **Input sanitization** phone number validation
- **Rate limiting** prevents spam attempts
- **Token-based auth** all endpoints protected
- **Data encryption** verification codes hashed

### Monitoring & Alerts
- **Health checks** automatic connection verification
- **Error tracking** comprehensive logging system
- **Performance metrics** response time monitoring
- **Usage statistics** verification success rates

## Troubleshooting

### Common Issues
1. **"Service not configured"** - Check environment variables
2. **"Connection failed"** - Verify Evolution API URL and key
3. **"Phone format invalid"** - Ensure Brazilian format (+55)
4. **"Code expired"** - Request new code (10min limit)

### Debug Steps
1. Check Evolution API service status
2. Verify phone number formatting
3. Check database verification records
4. Review application logs for errors

This integration provides a complete, production-ready WhatsApp verification system with professional UX and enterprise-level security.