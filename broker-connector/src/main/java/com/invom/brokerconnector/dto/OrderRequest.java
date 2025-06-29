package com.invom.brokerconnector.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class OrderRequest {
    
    @NotBlank(message = "Symbol is required")
    private String symbol;
    
    @NotBlank(message = "Order type is required")
    private String orderType; // MARKET, LIMIT, STOP_LOSS
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
    
    private Double price; // Required for LIMIT orders
    
    private String side; // BUY, SELL
    
    private String product; // CNC, MIS, NRML
    
    private String validity; // DAY, IOC, GTC
    
    private String disclosedQuantity;
    
    private String triggerPrice; // For stop loss orders
} 