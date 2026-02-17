package com.yupi.springbootinit.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.annotation.AuthCheck;
import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.DeleteRequest;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.constant.UserConstant;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.model.dto.material.MaterialQueryRequest;
import com.yupi.springbootinit.model.dto.material.MaterialSaveRequest;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.MaterialVO;
import com.yupi.springbootinit.service.MaterialService;
import com.yupi.springbootinit.service.UserService;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 物资管理接口
 */
@RestController
@RequestMapping("/material")
public class MaterialController {

    @Resource
    private MaterialService materialService;

    @Resource
    private UserService userService;

    /**
     * 物资分页
     */
    @GetMapping("/list")
    public BaseResponse<Page<MaterialVO>> listMaterial(MaterialQueryRequest materialQueryRequest,
            HttpServletRequest request) {
        userService.getLoginUser(request);
        return ResultUtils.success(materialService.listMaterial(materialQueryRequest));
    }

    /**
     * 新增 / 编辑
     */
    @PostMapping("/save")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Long> saveMaterial(@RequestBody MaterialSaveRequest materialSaveRequest,
            HttpServletRequest request) {
        if (materialSaveRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(materialService.saveMaterial(materialSaveRequest, loginUser));
    }

    /**
     * 删除（逻辑删除）
     */
    @PostMapping("/delete")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteMaterial(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(materialService.deleteMaterial(deleteRequest.getId(), loginUser));
    }

    /**
     * 详情
     */
    @GetMapping("/detail")
    public BaseResponse<MaterialVO> getMaterialDetail(@RequestParam("id") Long id, HttpServletRequest request) {
        userService.getLoginUser(request);
        return ResultUtils.success(materialService.getMaterialDetail(id));
    }
}

