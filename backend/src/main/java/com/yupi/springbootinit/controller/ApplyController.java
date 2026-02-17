package com.yupi.springbootinit.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.annotation.AuthCheck;
import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.constant.UserConstant;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.model.dto.apply.ApplyAddRequest;
import com.yupi.springbootinit.model.dto.apply.ApplyDecisionRequest;
import com.yupi.springbootinit.model.dto.apply.ApplyQueryRequest;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.ApplyDetailVO;
import com.yupi.springbootinit.model.vo.ApplyVO;
import com.yupi.springbootinit.service.ApplyService;
import com.yupi.springbootinit.service.UserService;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 审批管理接口
 */
@RestController
@RequestMapping("/apply")
public class ApplyController {

    @Resource
    private ApplyService applyService;

    @Resource
    private UserService userService;

    /**
     * 新建申请
     */
    @PostMapping
    public BaseResponse<Long> addApply(@RequestBody ApplyAddRequest applyAddRequest, HttpServletRequest request) {
        if (applyAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(applyService.createApply(applyAddRequest, loginUser));
    }

    /**
     * 我的申请
     */
    @GetMapping("/my")
    public BaseResponse<Page<ApplyVO>> listMyApply(ApplyQueryRequest applyQueryRequest, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(applyService.listMyApply(applyQueryRequest, loginUser));
    }

    /**
     * 待审批列表（管理员）
     */
    @GetMapping("/pending")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<ApplyVO>> listPendingApply(ApplyQueryRequest applyQueryRequest) {
        return ResultUtils.success(applyService.listPendingApply(applyQueryRequest));
    }

    /**
     * 历史审批列表（管理员）
     */
    @GetMapping("/history")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<ApplyVO>> listHistoryApply(ApplyQueryRequest applyQueryRequest) {
        return ResultUtils.success(applyService.listHistoryApply(applyQueryRequest));
    }

    /**
     * 通过审批（管理员）
     */
    @PostMapping("/{id}/approve")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> approveApply(@PathVariable("id") Long id,
            @RequestBody(required = false) ApplyDecisionRequest applyDecisionRequest,
            HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        String approveRemark = applyDecisionRequest == null ? null : applyDecisionRequest.getApproveRemark();
        return ResultUtils.success(applyService.approveApply(id, approveRemark, loginUser));
    }

    /**
     * 驳回审批（管理员）
     */
    @PostMapping("/{id}/reject")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> rejectApply(@PathVariable("id") Long id,
            @RequestBody(required = false) ApplyDecisionRequest applyDecisionRequest,
            HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        String approveRemark = applyDecisionRequest == null ? null : applyDecisionRequest.getApproveRemark();
        return ResultUtils.success(applyService.rejectApply(id, approveRemark, loginUser));
    }

    /**
     * 审批详情
     */
    @GetMapping("/{id}")
    public BaseResponse<ApplyDetailVO> getApplyDetail(@PathVariable("id") Long id, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(applyService.getApplyDetail(id, loginUser));
    }
}
