package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 审批视图
 */
@Data
public class ApplyVO implements Serializable {

    private Long id;

    /**
     * 申请单号
     */
    private String approvalNo;

    /**
     * 物资ID
     */
    private Long materialId;

    /**
     * 物资名称
     */
    private String materialName;

    /**
     * 申请数量
     */
    private Integer quantity;

    /**
     * 用途/去向
     */
    private String purpose;

    /**
     * 申请人ID
     */
    private Long applicantId;

    /**
     * 申请人名称
     */
    private String applicantName;

    /**
     * 审批人ID
     */
    private Long approveId;

    /**
     * 审批人名称
     */
    private String approveName;

    /**
     * 提交时间
     */
    private Date applyTime;

    /**
     * 审批时间
     */
    private Date approveTime;

    /**
     * 出库时间
     */
    private Date outTime;

    /**
     * 审批意见
     */
    private String approveRemark;

    /**
     * 审批状态
     */
    private Integer status;

    private static final long serialVersionUID = 1L;
}
