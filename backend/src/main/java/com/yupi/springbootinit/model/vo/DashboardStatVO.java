package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import lombok.Data;

/**
 * 首页关键指标
 */
@Data
public class DashboardStatVO implements Serializable {

    /**
     * 物资总数
     */
    private Long materialCount;

    /**
     * 库存总量
     */
    private Long totalStock;

    /**
     * 今日申请数量
     */
    private Long todayApplyCount;

    /**
     * 今日出库 / 领用数量
     */
    private Long todayOutQuantity;

    /**
     * 待审批数量
     */
    private Long pendingApplyCount;

    /**
     * 未处理预警数量
     */
    private Long unhandledWarnCount;

    /**
     * 即将过期数量（7 天内）
     */
    private Long expiringSoonCount;

    private static final long serialVersionUID = 1L;
}

