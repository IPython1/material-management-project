package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 预警视图
 */
@Data
public class WarnVO implements Serializable {

    /**
     * 预警记录ID
     */
    private Long id;

    /**
     * 规则ID
     */
    private Long ruleId;

    /**
     * 预警类型：1库存 2临期
     */
    private Integer warnType;

    /**
     * 预警类型文本
     */
    private String warnTypeText;

    /**
     * 物资ID
     */
    private Long materialId;

    /**
     * 物资名称
     */
    private String materialName;

    /**
     * 当前值（库存或剩余天数）
     */
    private Integer currentValue;

    /**
     * 阈值（库存阈值或临期天数阈值）
     */
    private Integer thresholdValue;

    /**
     * 是否已处理
     */
    private Integer handled;

    /**
     * 处理人ID
     */
    private Long handledBy;

    /**
     * 处理时间
     */
    private Date handledTime;

    /**
     * 触发时间
     */
    private Date createTime;

    private static final long serialVersionUID = 1L;
}
