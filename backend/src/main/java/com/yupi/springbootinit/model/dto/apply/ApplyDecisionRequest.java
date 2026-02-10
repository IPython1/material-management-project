package com.yupi.springbootinit.model.dto.apply;

import java.io.Serializable;
import lombok.Data;

/**
 * 审批决定请求（通过/驳回）
 */
@Data
public class ApplyDecisionRequest implements Serializable {

    /**
     * 审批意见
     */
    private String approveRemark;

    private static final long serialVersionUID = 1L;
}
