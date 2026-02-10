package com.yupi.springbootinit.model.dto.stock;

import java.io.Serializable;
import lombok.Data;

/**
 * 库存调整请求
 */
@Data
public class StockAdjustRequest implements Serializable {

    /**
     * 物资ID
     */
    private Long materialId;

    /**
     * 指定库存记录位置（可选）
     */
    private String location;

    /**
     * 调整数量（正数 = 增加，负数 = 减少）
     */
    private Integer adjustAmount;

    /**
     * 备注
     */
    private String remark;

    private static final long serialVersionUID = 1L;
}

