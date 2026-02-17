package com.yupi.springbootinit.model.dto.user;

import java.io.Serializable;
import lombok.Data;

/**
 * 用户角色分配请求
 */
@Data
public class UserRoleAssignRequest implements Serializable {

    /**
     * 目标角色：user/admin
     */
    private String userRole;

    private static final long serialVersionUID = 1L;
}

