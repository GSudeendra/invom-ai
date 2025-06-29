package com.invom.brokerconnector.dto;

import lombok.Data;
import lombok.Builder;
import java.util.List;

@Data
@Builder
public class PositionResponse {
    private String status;
    private String message;
    private List<Position> positions;
    
    @Data
    @Builder
    public static class Position {
        private String tradingSymbol;
        private String exchange;
        private String product;
        private Integer quantity;
        private Double averagePrice;
        private Double lastPrice;
        private Double pnl;
        private String side; // LONG, SHORT
        private String dayQuantity;
        private Double dayPnl;
    }
} 