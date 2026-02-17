package com.yupi.springbootinit.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 出入库流水表
 */
@TableName(value = "stock_flow")
@Data
public class StockFlow implements Serializable {

    /**
     * 流水ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 物资ID
     */
    private Long materialId;

    /**
     * 流水类型：IN入库/OUT出库
     */
    private String flowType;

    /**
     * 数量（正数）
     */
    private Integer quantity;

    /**
     * 变动前库存
     */
    private Integer beforeStock;

    /**
     * 变动后库存
     */
    private Integer afterStock;

    /**
     * 操作人ID
     */
    private Long operatorId;

    /**
     * 关联申请单号
     */
    private String relatedApprovalNo;

    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    private Date createTime;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
