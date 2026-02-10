package com.yupi.springbootinit.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.model.vo.ApplyVO;
import com.yupi.springbootinit.model.vo.DashboardPieItemVO;
import com.yupi.springbootinit.model.vo.DashboardStatVO;
import com.yupi.springbootinit.model.vo.DashboardTrendItemVO;
import com.yupi.springbootinit.model.vo.WarnVO;
import com.yupi.springbootinit.service.DashboardService;
import java.util.List;
import javax.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 首页看板接口
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Resource
    private DashboardService dashboardService;

    /**
     * 关键指标
     */
    @GetMapping("/stat")
    public BaseResponse<DashboardStatVO> getStat() {
        return ResultUtils.success(dashboardService.getStat());
    }

    /**
     * 趋势图
     */
    @GetMapping("/trend")
    public BaseResponse<List<DashboardTrendItemVO>> getTrend() {
        return ResultUtils.success(dashboardService.getTrend());
    }

    /**
     * 分类占比
     */
    @GetMapping("/pie")
    public BaseResponse<List<DashboardPieItemVO>> getPie() {
        return ResultUtils.success(dashboardService.getPie());
    }

    /**
     * 待审批列表
     */
    @GetMapping("/todo")
    public BaseResponse<Page<ApplyVO>> getTodo(@RequestParam(value = "pageSize", defaultValue = "5") int pageSize) {
        return ResultUtils.success(dashboardService.getTodo(pageSize));
    }

    /**
     * 预警列表
     */
    @GetMapping("/warn")
    public BaseResponse<Page<WarnVO>> getWarn(@RequestParam(value = "pageSize", defaultValue = "5") int pageSize) {
        return ResultUtils.success(dashboardService.getWarn(pageSize));
    }
}

