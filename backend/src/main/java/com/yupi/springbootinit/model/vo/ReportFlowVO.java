package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 出入库报表视图
 */
@Data
public class ReportFlowVO implements Serializable {

    /**
     * 审批ID
     */
    private Long applyId;

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
     * 流水类型
     */
    private String flowType;

    /**
     * 业务类型
     */
    private String bizType;

    /**
     * 数量
     */
    private Integer quantity;

    /**
     * 操作人ID
     */
    private Long operatorId;

    /**
     * 操作人
     */
    private String operatorName;

    /**
     * 发生时间
     */
    private Date createTime;

    private static final long serialVersionUID = 1L;
}
