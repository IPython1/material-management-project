package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import lombok.Data;

/**
 * 库存报表视图
 */
@Data
public class ReportStockVO implements Serializable {

    /**
     * 物资ID
     */
    private Long materialId;

    /**
     * 物资名称
     */
    private String materialName;

    /**
     * 分类
     */
    private String category;

    /**
     * 存放位置
     */
    private String location;

    /**
     * 当前库存
     */
    private Integer currentStock;

    /**
     * 预警阈值
     */
    private Integer warnThreshold;

    /**
     * 状态
     */
    private Integer status;

    private static final long serialVersionUID = 1L;
}
