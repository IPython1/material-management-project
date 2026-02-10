package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import lombok.Data;

/**
 * 周转率报表视图
 */
@Data
public class ReportTurnoverVO implements Serializable {

    /**
     * 物资ID
     */
    private Long materialId;

    /**
     * 物资名称
     */
    private String materialName;

    /**
     * 出库总量
     */
    private Integer outQuantity;

    /**
     * 当前库存
     */
    private Integer currentStock;

    /**
     * 周转率
     */
    private Double turnoverRate;

    private static final long serialVersionUID = 1L;
}
