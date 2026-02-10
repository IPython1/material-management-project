package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import lombok.Data;

/**
 * 领用频次报表视图
 */
@Data
public class ReportUsageVO implements Serializable {

    /**
     * 物资ID
     */
    private Long materialId;

    /**
     * 物资名称
     */
    private String materialName;

    /**
     * 申请次数
     */
    private Long usageCount;

    /**
     * 领用总量
     */
    private Integer totalQuantity;

    private static final long serialVersionUID = 1L;
}
