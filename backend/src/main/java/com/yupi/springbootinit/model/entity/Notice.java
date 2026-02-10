package com.yupi.springbootinit.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 通知消息表
 */
@TableName(value = "notice")
@Data
public class Notice implements Serializable {

    /**
     * 通知ID
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 接收用户ID
     */
    private Long userId;

    /**
     * 标题
     */
    private String title;

    /**
     * 内容
     */
    private String content;

    /**
     * 类型：1预警通知 2审批结果
     */
    private Integer noticeType;

    /**
     * 关联业务ID
     */
    private Long refId;

    /**
     * 关联业务类型：1审批 2预警
     */
    private Integer refType;

    /**
     * 是否已读：0未读 1已读
     */
    private Integer isRead;

    /**
     * 创建时间
     */
    private Date createTime;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
