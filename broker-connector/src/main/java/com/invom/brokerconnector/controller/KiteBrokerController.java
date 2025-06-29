package com.invom.brokerconnector.controller;

import com.invom.brokerconnector.dto.OrderRequest;
import com.invom.brokerconnector.dto.OrderResponse;
import com.invom.brokerconnector.dto.PositionResponse;
import com.invom.brokerconnector.dto.HoldingResponse;
import com.invom.brokerconnector.service.KiteBrokerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/kite")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class KiteBrokerController {
    
    private final KiteBrokerService kiteBrokerService;
    
    @PostMapping("/orders")
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest orderRequest) {
        log.info("Received order request: {}", orderRequest);
        OrderResponse response = kiteBrokerService.placeOrder(orderRequest);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/orders/{orderId}")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable String orderId) {
        log.info("Received cancel order request for order ID: {}", orderId);
        OrderResponse response = kiteBrokerService.cancelOrder(orderId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/positions")
    public ResponseEntity<PositionResponse> getPositions() {
        log.info("Received get positions request");
        PositionResponse response = kiteBrokerService.getPositions();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/holdings")
    public ResponseEntity<HoldingResponse> getHoldings() {
        log.info("Received get holdings request");
        HoldingResponse response = kiteBrokerService.getHoldings();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Kite Broker API is running");
    }
    
    @GetMapping("/connection-test")
    public ResponseEntity<String> testConnection() {
        log.info("Received MCP connection test request");
        String result = kiteBrokerService.testMcpConnection();
        return ResponseEntity.ok(result);
    }
} 