package com.yupi.springbootinit.model.dto.stock;

import java.io.Serializable;
import lombok.Data;

/**
 * 库存编辑请求
 */
@Data
public class StockSaveRequest implements Serializable {

    /**
     * 物资ID
     */
    private Long materialId;

    /**
     * 存放位置
     */
    private String location;

    /**
     * 预警阈值
     */
    private Integer warnThreshold;

    private static final long serialVersionUID = 1L;
}

