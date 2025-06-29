package com.invom.brokerconnector.dto;

import lombok.Data;
import lombok.Builder;
import java.util.List;

@Data
@Builder
public class HoldingResponse {
    private String status;
    private String message;
    private List<Holding> holdings;
    
    @Data
    @Builder
    public static class Holding {
        private String tradingSymbol;
        private String exchange;
        private String isin;
        private Integer quantity;
        private Double averagePrice;
        private Double lastPrice;
        private Double pnl;
        private String product;
        private String collateralQuantity;
        private String collateralType;
    }
} 