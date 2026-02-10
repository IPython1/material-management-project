package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 预警规则视图
 */
@Data
public class WarnRuleVO implements Serializable {

    private Long id;

    /**
     * 规则名称
     */
    private String ruleName;

    /**
     * 规则类型：1库存预警 2临期预警
     */
    private Integer ruleType;

    /**
     * 规则类型文本
     */
    private String ruleTypeText;

    /**
     * 物资ID（为空表示全局）
     */
    private Long materialId;

    /**
     * 物资名称
     */
    private String materialName;

    /**
     * 阈值
     */
    private Integer thresholdValue;

    /**
     * 是否启用
     */
    private Integer isEnabled;

    private Date createTime;

    private Date updateTime;

    private static final long serialVersionUID = 1L;
}
