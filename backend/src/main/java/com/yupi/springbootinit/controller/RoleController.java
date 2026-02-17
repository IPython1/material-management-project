package com.yupi.springbootinit.controller;

import com.yupi.springbootinit.annotation.AuthCheck;
import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.constant.UserConstant;
import com.yupi.springbootinit.model.enums.UserRoleEnum;
import java.util.ArrayList;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 角色接口
 */
@RestController
@RequestMapping("/role")
public class RoleController {

    /**
     * 角色列表（管理员）
     */
    @GetMapping("/list")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<List<String>> listRole() {
        List<String> roleList = new ArrayList<>();
        for (UserRoleEnum userRoleEnum : UserRoleEnum.values()) {
            if (UserRoleEnum.BAN.equals(userRoleEnum)) {
                continue;
            }
            roleList.add(userRoleEnum.getValue());
        }
        return ResultUtils.success(roleList);
    }
}

