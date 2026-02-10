package com.yupi.springbootinit.model.vo;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * 通知视图
 */
@Data
public class NoticeVO implements Serializable {

    private Long id;

    /**
     * 标题
     */
    private String title;

    /**
     * 内容
     */
    private String content;

    /**
     * 通知类型
     */
    private Integer noticeType;

    /**
     * 关联业务ID
     */
    private Long refId;

    /**
     * 关联业务类型
     */
    private Integer refType;

    /**
     * 是否已读
     */
    private Integer isRead;

    /**
     * 创建时间
     */
    private Date createTime;

    private static final long serialVersionUID = 1L;
}
