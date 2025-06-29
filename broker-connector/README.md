# Kite Broker Connector

A Spring Boot REST API application that connects to the Kite trading platform through an MCP (Model Context Protocol) server.

## Features

- **Order Management**: Place and cancel trading orders
- **Position Tracking**: Get current positions
- **Holdings Management**: Retrieve portfolio holdings
- **RESTful API**: Clean, documented REST endpoints
- **Validation**: Request validation with proper error handling
- **Logging**: Comprehensive logging for debugging

## Prerequisites

- Java 21
- Gradle 8.x
- Kite MCP Server running on `http://localhost:3000`

## Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd broker-connector
```

### 2. Build the application
```bash
./gradlew clean build
```

### 3. Run the application
```bash
./gradlew bootRun
```

The application will start on `http://localhost:8080`

## API Endpoints

### Base URL
```
http://localhost:8080/api/v1/kite
```

### 1. Place Order
**POST** `/orders`

Place a new trading order.

**Request Body:**
```json
{
  "symbol": "RELIANCE",
  "orderType": "MARKET",
  "quantity": 100,
  "price": 2500.0,
  "side": "BUY",
  "product": "CNC",
  "validity": "DAY",
  "disclosedQuantity": "",
  "triggerPrice": ""
}
```

**Response:**
```json
{
  "orderId": "ORDER_1703123456789",
  "status": "SUCCESS",
  "message": "Order placed successfully",
  "tradingSymbol": "RELIANCE",
  "orderType": "MARKET",
  "quantity": 100,
  "price": 2500.0,
  "side": "BUY",
  "product": "CNC",
  "validity": "DAY",
  "timestamp": "2023-12-21T10:30:45",
  "exchangeOrderId": null,
  "rejectionReason": null
}
```

### 2. Cancel Order
**DELETE** `/orders/{orderId}`

Cancel an existing order.

**Response:**
```json
{
  "orderId": "ORDER_1703123456789",
  "status": "CANCELLED",
  "message": "Order cancelled successfully",
  "timestamp": "2023-12-21T10:35:12"
}
```

### 3. Get Positions
**GET** `/positions`

Retrieve current trading positions.

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Positions retrieved successfully",
  "positions": [
    {
      "tradingSymbol": "RELIANCE",
      "exchange": "NSE",
      "product": "CNC",
      "quantity": 100,
      "averagePrice": 2500.0,
      "lastPrice": 2550.0,
      "pnl": 5000.0,
      "side": "LONG",
      "dayQuantity": "0",
      "dayPnl": 0.0
    }
  ]
}
```

### 4. Get Holdings
**GET** `/holdings`

Retrieve current portfolio holdings.

**Response:**
```json
{
  "status": "SUCCESS",
  "message": "Holdings retrieved successfully",
  "holdings": [
    {
      "tradingSymbol": "INFY",
      "exchange": "NSE",
      "isin": "INE009A01021",
      "quantity": 50,
      "averagePrice": 1500.0,
      "lastPrice": 1550.0,
      "pnl": 2500.0,
      "product": "CNC",
      "collateralQuantity": "0",
      "collateralType": ""
    }
  ]
}
```

### 5. Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```
Kite Broker API is running
```

## Configuration

The application can be configured through `application.properties`:

```properties
# Server configuration
server.port=8080

# MCP Client configuration for Kite
spring.ai.mcp.client.kite.uri=http://localhost:3000
spring.ai.mcp.client.kite.name=kite-broker
spring.ai.mcp.client.kite.description=Kite Trading Platform MCP Server

# Logging configuration
logging.level.broker_connector=DEBUG
logging.level.org.springframework.ai=DEBUG

# Actuator endpoints
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
```

## Project Structure

```
src/main/java/broker_connector/broker_connector/
├── BrokerConnectorApplication.java    # Main application class
├── controller/
│   └── KiteBrokerController.java      # REST API endpoints
├── service/
│   └── KiteBrokerService.java         # Business logic
├── dto/
│   ├── OrderRequest.java              # Order request DTO
│   ├── OrderResponse.java             # Order response DTO
│   ├── PositionResponse.java          # Position response DTO
│   └── HoldingResponse.java           # Holdings response DTO
├── config/
│   └── AppConfig.java                 # Application configuration
└── exception/
    └── GlobalExceptionHandler.java    # Global exception handling
```

## Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: Returns 400 Bad Request with field-specific error messages
- **Internal Errors**: Returns 500 Internal Server Error with error details
- **All errors are logged** for debugging purposes

## Development

### Running Tests
```bash
./gradlew test
```

### Building JAR
```bash
./gradlew bootJar
```

### Running with JAR
```bash
java -jar build/libs/broker-connector-0.0.1-SNAPSHOT.jar
```

## Integration with Kite MCP Server

This application is designed to work with a Kite MCP server. The current implementation includes mock responses for demonstration purposes. To integrate with a real Kite MCP server:

1. Ensure the Kite MCP server is running on the configured URI
2. Update the `KiteBrokerService` to use the actual MCP client calls
3. Implement proper response parsing for the MCP server responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License. 