package com.yupi.springbootinit.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 预警记录表
 */
@TableName(value = "warn_record")
@Data
public class WarnRecord implements Serializable {

    /**
     * 预警记录ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 规则ID
     */
    private Long ruleId;

    /**
     * 物资ID
     */
    private Long materialId;

    /**
     * 预警类型：1库存预警 2临期预警
     */
    private Integer warnType;

    /**
     * 当前值（库存或剩余天数）
     */
    private Integer currentValue;

    /**
     * 阈值
     */
    private Integer thresholdValue;

    /**
     * 预警内容
     */
    private String content;

    /**
     * 是否已处理：0未处理 1已处理
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
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
