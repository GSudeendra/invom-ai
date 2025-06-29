package com.invom.brokerconnector.service;

import com.invom.brokerconnector.dto.OrderRequest;
import com.invom.brokerconnector.dto.OrderResponse;
import com.invom.brokerconnector.dto.PositionResponse;
import com.invom.brokerconnector.dto.HoldingResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class KiteBrokerService {
    
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.ai.mcp.client.kite.uri}")
    private String mcpServerUri;
    
    public OrderResponse placeOrder(OrderRequest orderRequest) {
        try {
            log.info("Placing order: {}", orderRequest);
            
            // Mock implementation - in real scenario, this would call the MCP server
            String orderId = "ORDER_" + System.currentTimeMillis();
            
            return OrderResponse.builder()
                .orderId(orderId)
                .status("SUCCESS")
                .message("Order placed successfully")
                .tradingSymbol(orderRequest.getSymbol())
                .orderType(orderRequest.getOrderType())
                .quantity(orderRequest.getQuantity())
                .price(orderRequest.getPrice())
                .side(orderRequest.getSide())
                .product(orderRequest.getProduct())
                .validity(orderRequest.getValidity())
                .timestamp(java.time.LocalDateTime.now().toString())
                .build();
                
        } catch (Exception e) {
            log.error("Error placing order: {}", e.getMessage(), e);
            return OrderResponse.builder()
                .status("ERROR")
                .message("Failed to place order: " + e.getMessage())
                .build();
        }
    }
    
    public OrderResponse cancelOrder(String orderId) {
        try {
            log.info("Cancelling order: {}", orderId);
            
            // Mock implementation
            return OrderResponse.builder()
                .orderId(orderId)
                .status("CANCELLED")
                .message("Order cancelled successfully")
                .timestamp(java.time.LocalDateTime.now().toString())
                .build();
                
        } catch (Exception e) {
            log.error("Error cancelling order: {}", e.getMessage(), e);
            return OrderResponse.builder()
                .orderId(orderId)
                .status("ERROR")
                .message("Failed to cancel order: " + e.getMessage())
                .build();
        }
    }
    
    public PositionResponse getPositions() {
        try {
            log.info("Getting positions");
            
            // Mock implementation
            List<PositionResponse.Position> positions = new ArrayList<>();
            positions.add(PositionResponse.Position.builder()
                .tradingSymbol("RELIANCE")
                .exchange("NSE")
                .product("CNC")
                .quantity(100)
                .averagePrice(2500.0)
                .lastPrice(2550.0)
                .pnl(5000.0)
                .side("LONG")
                .dayQuantity("0")
                .dayPnl(0.0)
                .build());
            
            return PositionResponse.builder()
                .status("SUCCESS")
                .message("Positions retrieved successfully")
                .positions(positions)
                .build();
                
        } catch (Exception e) {
            log.error("Error getting positions: {}", e.getMessage(), e);
            return PositionResponse.builder()
                .status("ERROR")
                .message("Failed to get positions: " + e.getMessage())
                .positions(new ArrayList<>())
                .build();
        }
    }
    
    public HoldingResponse getHoldings() {
        try {
            log.info("Getting holdings");
            
            // Mock implementation
            List<HoldingResponse.Holding> holdings = new ArrayList<>();
            holdings.add(HoldingResponse.Holding.builder()
                .tradingSymbol("INFY")
                .exchange("NSE")
                .isin("INE009A01021")
                .quantity(50)
                .averagePrice(1500.0)
                .lastPrice(1550.0)
                .pnl(2500.0)
                .product("CNC")
                .collateralQuantity("0")
                .collateralType("")
                .build());
            
            return HoldingResponse.builder()
                .status("SUCCESS")
                .message("Holdings retrieved successfully")
                .holdings(holdings)
                .build();
                
        } catch (Exception e) {
            log.error("Error getting holdings: {}", e.getMessage(), e);
            return HoldingResponse.builder()
                .status("ERROR")
                .message("Failed to get holdings: " + e.getMessage())
                .holdings(new ArrayList<>())
                .build();
        }
    }

    public String testMcpConnection() {
        try {
            String url = mcpServerUri;
            log.info("Testing connection to MCP server at {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return "Connection successful: HTTP " + response.getStatusCode();
        } catch (Exception e) {
            log.error("MCP connection test failed: {}", e.getMessage(), e);
            return "Connection failed: " + e.getMessage();
        }
    }
} 