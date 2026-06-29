# Paper Trading Platform - Backend Microservices

This is a Spring Boot-based microservices architecture for the Paper Trading Platform.

## Architecture Overview

### Microservices

1. **Auth Service** (Port 8081)
   - User registration and authentication
   - OTP-based verification via Resend
   - JWT token generation
   - Account management

2. **Stock Service** (Port 8082)
   - Stock search and information
   - Order management (BUY/SELL)
   - Portfolio management
   - Holdings tracking

3. **AI Service** (Port 8083)
   - Stock price predictions
   - Trading recommendations
   - AI-powered analysis using OpenAI
   - Prediction history

## Directory Structure

```
backend/
├── auth-service/
│   ├── src/main/
│   │   ├── java/com/papertrading/auth/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   ├── service/
│   │   │   └── AuthServiceApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml
├── stock-service/
│   ├── src/main/
│   │   ├── java/com/papertrading/stock/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   ├── service/
│   │   │   └── StockServiceApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml
├── ai-service/
│   ├── src/main/
│   │   ├── java/com/papertrading/ai/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   ├── service/
│   │   │   └── AiServiceApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── pom.xml
├── pom.xml (Parent)
├── docker-compose.yml
└── .env.example
```

## Prerequisites

- Java 17 or higher
- Maven 3.8+
- PostgreSQL 12+ (Supabase)
- Environment variables configured

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Database (Supabase PostgreSQL)
DB_URL=jdbc:postgresql://db.supabasehost.com:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your-jwt-secret-key-minimum-32-characters

# Resend (OTP Email Service)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@papertrading.com

# OpenAI
OPENAI_API_KEY=your-openai-api-key
```

## Building the Project

### Build all services
```bash
cd backend
mvn clean install
```

### Build individual service
```bash
cd backend/auth-service
mvn clean package
```

## Running the Services

### Local Development

```bash
# Terminal 1 - Auth Service
cd backend/auth-service
mvn spring-boot:run

# Terminal 2 - Stock Service
cd backend/stock-service
mvn spring-boot:run

# Terminal 3 - AI Service
cd backend/ai-service
mvn spring-boot:run
```

### Using Docker Compose

```bash
cd backend
docker-compose up --build
```

## API Endpoints

### Auth Service (http://localhost:8081)
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/register` - Register with OTP verification
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/health` - Health check

### Stock Service (http://localhost:8082)
- `GET /api/stocks/search?query=...` - Search stocks
- `POST /api/orders` - Place buy/sell order
- `GET /api/orders` - Get user orders
- `GET /api/portfolio` - Get user portfolio
- `GET /api/stocks/health` - Health check

### AI Service (http://localhost:8083)
- `GET /api/ai/predict/{symbol}?timeframe=1M` - Get price prediction
- `GET /api/ai/predictions/{symbol}` - Get prediction history
- `GET /api/ai/recommend/{symbol}` - Get trading recommendation
- `GET /api/ai/recommendations` - Get user recommendations
- `GET /api/ai/health` - Health check

## Database Schema

The services use the following tables:

- `users` - User accounts
- `otp_verifications` - OTP verification records
- `stocks` - Stock information
- `orders` - User orders
- `portfolios` - User portfolios
- `portfolio_holdings` - User stock holdings
- `predictions` - AI predictions
- `recommendations` - AI recommendations

## AWS EC2 Deployment (t3.micro)

### Prerequisites
- EC2 instance with Java 17+
- Security group with ports 8081, 8082, 8083 open
- Environment variables configured

### Build JAR Files

```bash
mvn clean package -DskipTests
```

### Deployment Steps

1. Transfer JAR files to EC2:
```bash
scp -i key.pem target/*.jar ubuntu@ec2-instance:/opt/papertrading/
```

2. Create systemd service files for each microservice

3. Start services:
```bash
sudo systemctl start auth-service
sudo systemctl start stock-service
sudo systemctl start ai-service
```

### Systemd Service Example

Create `/etc/systemd/system/auth-service.service`:

```ini
[Unit]
Description=Paper Trading Auth Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/papertrading
EnvironmentFile=/opt/papertrading/.env
ExecStart=/usr/bin/java -jar auth-service-1.0.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable auth-service
sudo systemctl start auth-service
```

## Frontend Integration (Vercel)

Configure your frontend to call the microservices:

```javascript
// Example API call
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8081';

fetch(`${API_BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## Development Tips

1. Use JWT token in Authorization header: `Bearer {token}`
2. Use `X-User-Id` header for endpoints requiring user context
3. All services have CORS enabled for frontend integration
4. Timestamps are stored in UTC
5. Use environment variables for sensitive data

## Monitoring and Logs

Check service health:
```bash
curl http://localhost:8081/api/auth/health
curl http://localhost:8082/api/stocks/health
curl http://localhost:8083/api/ai/health
```

View logs:
```bash
# Docker logs
docker-compose logs auth-service
docker-compose logs stock-service
docker-compose logs ai-service
```

## Troubleshooting

- **Port already in use**: Change port in `application.properties`
- **Database connection failed**: Verify DB_URL and credentials
- **JWT not working**: Ensure JWT_SECRET is set and consistent
- **Email not sending**: Check RESEND_API_KEY
- **AI service errors**: Verify OPENAI_API_KEY is valid

## Database Initialization

The services use Hibernate with `ddl-auto=update`, so tables are created automatically on first run.

To reset database:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

## Performance Optimization

For t3.micro EC2 instances:
- Use connection pooling (HikariCP default)
- Enable caching for frequently accessed stocks
- Monitor memory usage
- Use CDN for static assets on frontend
- Consider lazy loading for portfolio data

## Security Best Practices

1. Keep `JWT_SECRET` and `OPENAI_API_KEY` secure
2. Use HTTPS in production
3. Implement rate limiting
4. Validate all inputs
5. Use Supabase's security features
6. Enable CORS only for trusted domains
7. Store sensitive data encrypted

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
