package com.yupi.springbootinit.model.dto.user;

import java.io.Serializable;
import lombok.Data;

/**
 * 用户状态更新请求
 */
@Data
public class UserStatusUpdateRequest implements Serializable {

    /**
     * 状态：1启用 0禁用
     */
    private Integer userStatus;

    private static final long serialVersionUID = 1L;
}

