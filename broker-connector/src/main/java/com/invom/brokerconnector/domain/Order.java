package com.invom.brokerconnector.domain;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Domain model for Order
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    private String orderId;
    private String symbol;
    private String orderType;
    private Integer quantity;
    private Double price;
    private String side;
    private String product;
    private String validity;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String exchangeOrderId;
    private String rejectionReason;
} 