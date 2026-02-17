package com.yupi.springbootinit.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.annotation.AuthCheck;
import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.constant.UserConstant;
import com.yupi.springbootinit.model.dto.warn.WarnQueryRequest;
import com.yupi.springbootinit.model.dto.warn.WarnRuleSaveRequest;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.WarnRuleVO;
import com.yupi.springbootinit.model.vo.WarnVO;
import com.yupi.springbootinit.service.UserService;
import com.yupi.springbootinit.service.WarnService;
import java.util.List;
import javax.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.servlet.http.HttpServletRequest;
import com.yupi.springbootinit.exception.BusinessException;

/**
 * 预警接口
 */
@RestController
@RequestMapping("/warn")
public class WarnController {

    @Resource
    private WarnService warnService;

    @Resource
    private UserService userService;

    /**
     * 预警列表（管理员可看全部，普通用户仅看自己的）
     */
    @GetMapping("/list")
    public BaseResponse<Page<WarnVO>> listWarn(WarnQueryRequest warnQueryRequest, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(warnService.listWarn(warnQueryRequest, loginUser));
    }

    /**
     * 预警规则列表（管理员）
     */
    @GetMapping("/rule")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<List<WarnRuleVO>> listWarnRule() {
        return ResultUtils.success(warnService.listWarnRule());
    }

    /**
     * 新增/修改预警规则（管理员）
     */
    @PostMapping("/rule")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Long> saveWarnRule(@RequestBody WarnRuleSaveRequest warnRuleSaveRequest,
            HttpServletRequest request) {
        if (warnRuleSaveRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(warnService.saveWarnRule(warnRuleSaveRequest, loginUser));
    }

    /**
     * 预警标记已处理（管理员）
     */
    @PutMapping("/{id}/handled")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> markWarnHandled(@PathVariable("id") Long id, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(warnService.markWarnHandled(id, loginUser));
    }

    /**
     * 提醒管理员处理预警（普通用户）
     */
    @PostMapping("/{id}/remind")
    public BaseResponse<Boolean> remindWarn(@PathVariable("id") Long id, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(warnService.remindWarn(id, loginUser));
    }

    /**
     * 获取未处理预警数量（用于导航栏角标）
     */
    @GetMapping("/unhandled/count")
    public BaseResponse<Long> countUnhandled() {
        return ResultUtils.success(warnService.countUnhandled());
    }
}
