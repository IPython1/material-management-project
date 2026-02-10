package com.yupi.springbootinit.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.model.dto.notice.NoticeQueryRequest;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.NoticeVO;
import com.yupi.springbootinit.service.NoticeService;
import com.yupi.springbootinit.service.UserService;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 通知接口
 */
@RestController
@RequestMapping("/notice")
public class NoticeController {

    @Resource
    private NoticeService noticeService;

    @Resource
    private UserService userService;

    /**
     * 通知列表
     */
    @GetMapping("/list")
    public BaseResponse<Page<NoticeVO>> listNotice(NoticeQueryRequest noticeQueryRequest, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(noticeService.listNotice(noticeQueryRequest, loginUser));
    }

    /**
     * 标记已读
     */
    @PutMapping("/{id}/read")
    public BaseResponse<Boolean> readNotice(@PathVariable("id") Long id, HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(noticeService.readNotice(id, loginUser));
    }
}
