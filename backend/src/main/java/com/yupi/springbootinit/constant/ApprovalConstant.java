package com.yupi.springbootinit.constant;

/**
 * 审批状态常量
 */
public interface ApprovalConstant {

    /**
     * 待审批
     */
    int STATUS_PENDING = 0;

    /**
     * 已通过
     */
    int STATUS_APPROVED = 1;

    /**
     * 已驳回
     */
    int STATUS_REJECTED = 2;

    /**
     * 已完成出库
     */
    int STATUS_OUTBOUND = 3;
}
