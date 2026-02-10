package com.yupi.springbootinit.controller;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.annotation.AuthCheck;
import com.yupi.springbootinit.common.BaseResponse;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.common.ResultUtils;
import com.yupi.springbootinit.constant.UserConstant;
import com.yupi.springbootinit.model.dto.report.ReportFlowQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportStockQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportTurnoverQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportUsageQueryRequest;
import com.yupi.springbootinit.model.vo.ReportFlowVO;
import com.yupi.springbootinit.model.vo.ReportStockVO;
import com.yupi.springbootinit.model.vo.ReportTurnoverVO;
import com.yupi.springbootinit.model.vo.ReportUsageVO;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.service.ReportService;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 报表统计接口
 */
@RestController
@RequestMapping("/report")
public class ReportController {

    @Resource
    private ReportService reportService;

    /**
     * 库存报表
     */
    @GetMapping("/stock")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<ReportStockVO>> getStockReport(ReportStockQueryRequest reportStockQueryRequest) {
        return ResultUtils.success(reportService.getStockReport(reportStockQueryRequest));
    }

    /**
     * 出入库报表（审批出库）
     */
    @GetMapping("/flow")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<ReportFlowVO>> getFlowReport(ReportFlowQueryRequest reportFlowQueryRequest) {
        return ResultUtils.success(reportService.getFlowReport(reportFlowQueryRequest));
    }

    /**
     * 领用频次
     */
    @GetMapping("/usage")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<ReportUsageVO>> getUsageReport(ReportUsageQueryRequest reportUsageQueryRequest) {
        return ResultUtils.success(reportService.getUsageReport(reportUsageQueryRequest));
    }

    /**
     * 周转率
     */
    @GetMapping("/turnover")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<ReportTurnoverVO>> getTurnoverReport(ReportTurnoverQueryRequest reportTurnoverQueryRequest) {
        return ResultUtils.success(reportService.getTurnoverReport(reportTurnoverQueryRequest));
    }

    /**
     * 报表导出（Excel）
     */
    @GetMapping("/export")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public void exportReport(String reportType,
            ReportStockQueryRequest reportStockQueryRequest,
            ReportFlowQueryRequest reportFlowQueryRequest,
            ReportUsageQueryRequest reportUsageQueryRequest,
            ReportTurnoverQueryRequest reportTurnoverQueryRequest,
            HttpServletResponse response) {
        String normalizedType = reportType == null ? "" : reportType.trim().toLowerCase();
        if (normalizedType.isEmpty()) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "reportType 不能为空");
        }
        try {
            String fileName = URLEncoder.encode("report_" + normalizedType + "_" + System.currentTimeMillis(),
                    StandardCharsets.UTF_8.name()).replaceAll("\\+", "%20");
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

            switch (normalizedType) {
                case "stock":
                    reportStockQueryRequest = reportStockQueryRequest == null ? new ReportStockQueryRequest()
                            : reportStockQueryRequest;
                    reportStockQueryRequest.setCurrent(1);
                    reportStockQueryRequest.setPageSize(10000);
                    List<ReportStockVO> stockList = reportService.getStockReport(reportStockQueryRequest).getRecords();
                    EasyExcel.write(response.getOutputStream(), ReportStockVO.class).sheet("库存报表").doWrite(stockList);
                    break;
                case "flow":
                    reportFlowQueryRequest = reportFlowQueryRequest == null ? new ReportFlowQueryRequest()
                            : reportFlowQueryRequest;
                    reportFlowQueryRequest.setCurrent(1);
                    reportFlowQueryRequest.setPageSize(10000);
                    List<ReportFlowVO> flowList = reportService.getFlowReport(reportFlowQueryRequest).getRecords();
                    EasyExcel.write(response.getOutputStream(), ReportFlowVO.class).sheet("出入库报表").doWrite(flowList);
                    break;
                case "usage":
                    reportUsageQueryRequest = reportUsageQueryRequest == null ? new ReportUsageQueryRequest()
                            : reportUsageQueryRequest;
                    reportUsageQueryRequest.setCurrent(1);
                    reportUsageQueryRequest.setPageSize(10000);
                    List<ReportUsageVO> usageList = reportService.getUsageReport(reportUsageQueryRequest).getRecords();
                    EasyExcel.write(response.getOutputStream(), ReportUsageVO.class).sheet("领用频次报表").doWrite(usageList);
                    break;
                case "turnover":
                    reportTurnoverQueryRequest = reportTurnoverQueryRequest == null ? new ReportTurnoverQueryRequest()
                            : reportTurnoverQueryRequest;
                    reportTurnoverQueryRequest.setCurrent(1);
                    reportTurnoverQueryRequest.setPageSize(10000);
                    List<ReportTurnoverVO> turnoverList = reportService.getTurnoverReport(reportTurnoverQueryRequest).getRecords();
                    EasyExcel.write(response.getOutputStream(), ReportTurnoverVO.class).sheet("周转率报表").doWrite(turnoverList);
                    break;
                default:
                    throw new BusinessException(ErrorCode.PARAMS_ERROR, "reportType 仅支持 stock/flow/usage/turnover");
            }
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "导出失败");
        }
    }
}
