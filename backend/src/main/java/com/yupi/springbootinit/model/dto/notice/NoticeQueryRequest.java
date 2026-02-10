package com.yupi.springbootinit.model.dto.notice;

import com.yupi.springbootinit.common.PageRequest;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 通知查询请求
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class NoticeQueryRequest extends PageRequest implements Serializable {

    /**
     * 是否已读：0未读 1已读
     */
    private Integer isRead;

    private static final long serialVersionUID = 1L;
}
