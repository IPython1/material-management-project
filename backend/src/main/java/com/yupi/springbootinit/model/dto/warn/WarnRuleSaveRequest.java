package com.yupi.springbootinit.model.dto.warn;

import java.io.Serializable;
import lombok.Data;

/**
 * 预警规则保存请求
 */
@Data
public class WarnRuleSaveRequest implements Serializable {

    /**
     * 规则ID（有值为更新）
     */
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
     * 物资ID（为空表示全局）
     */
    private Long materialId;

    /**
     * 阈值（库存值或临期天数）
     */
    private Integer thresholdValue;

    /**
     * 是否启用：0停用 1启用
     */
    private Integer isEnabled;

    private static final long serialVersionUID = 1L;
}
