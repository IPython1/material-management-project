package com.yupi.springbootinit.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 库存审批表
 */
@TableName(value = "inventory_approval")
@Data
public class InventoryApproval implements Serializable {

    /**
     * 审批ID
     */
    @TableId(type = IdType.ASSIGN_ID)
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
     * 提交时间
     */
    private Date applyTime;

    /**
     * 审批人ID
     */
    private Long approveId;

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
     * 审批状态：0待审批 1已通过 2已驳回 3已完成出库
     */
    private Integer status;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 逻辑删除：0未删 1已删
     */
    @TableLogic
    private Integer isDelete;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
