package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import lombok.Data;

/**
 * 首页趋势图数据项
 */
@Data
public class DashboardTrendItemVO implements Serializable {

    /**
     * 日期（yyyy-MM-dd）
     */
    private String date;

    /**
     * 当天申请单数
     */
    private Integer applyCount;

    /**
     * 当天出库总量
     */
    private Integer outQuantity;

    private static final long serialVersionUID = 1L;
}

