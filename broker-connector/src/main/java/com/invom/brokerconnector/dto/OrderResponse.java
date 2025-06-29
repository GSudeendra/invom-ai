package com.invom.brokerconnector.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class OrderResponse {
    private String orderId;
    private String status;
    private String message;
    private String tradingSymbol;
    private String orderType;
    private Integer quantity;
    private Double price;
    private String side;
    private String product;
    private String validity;
    private String timestamp;
    private String exchangeOrderId;
    private String rejectionReason;
} 