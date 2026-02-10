package com.yupi.springbootinit.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.annotation.AuthCheck;
import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.constant.UserConstant;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.model.dto.report.ReportFlowQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportStockQueryRequest;
import com.yupi.springbootinit.model.dto.stock.StockAdjustRequest;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.ReportFlowVO;
import com.yupi.springbootinit.model.vo.ReportStockVO;
import com.yupi.springbootinit.service.StockService;
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
 * 库存管理接口
 */
@RestController
@RequestMapping
public class StockController {

    @Resource
    private StockService stockService;

    @Resource
    private UserService userService;

    /**
     * 库存台账
     */
    @GetMapping("/stock/list")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<ReportStockVO>> listStock(ReportStockQueryRequest reportStockQueryRequest) {
        return ResultUtils.success(stockService.listStock(reportStockQueryRequest));
    }

    /**
     * 库存详情
     */
    @GetMapping("/stock/detail")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<ReportStockVO> getStockDetail(@RequestParam("materialId") Long materialId) {
        return ResultUtils.success(stockService.getStockDetail(materialId));
    }

    /**
     * 库存调整
     */
    @PostMapping("/stock/adjust")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> adjustStock(@RequestBody StockAdjustRequest stockAdjustRequest,
            HttpServletRequest request) {
        if (stockAdjustRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User loginUser = userService.getLoginUser(request);
        return ResultUtils.success(stockService.adjustStock(stockAdjustRequest, loginUser));
    }

    /**
     * 出入库流水
     */
    @GetMapping("/flow/list")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<ReportFlowVO>> listFlow(ReportFlowQueryRequest reportFlowQueryRequest) {
        return ResultUtils.success(stockService.listFlow(reportFlowQueryRequest));
    }
}

