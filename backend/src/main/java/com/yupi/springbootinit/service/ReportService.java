package com.yupi.springbootinit.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.report.ReportFlowQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportStockQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportTurnoverQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportUsageQueryRequest;
import com.yupi.springbootinit.model.vo.ReportFlowVO;
import com.yupi.springbootinit.model.vo.ReportStockVO;
import com.yupi.springbootinit.model.vo.ReportTurnoverVO;
import com.yupi.springbootinit.model.vo.ReportUsageVO;

/**
 * 报表统计服务
 */
public interface ReportService {

    /**
     * 库存报表
     */
    Page<ReportStockVO> getStockReport(ReportStockQueryRequest reportStockQueryRequest);

    /**
     * 出入库报表
     */
    Page<ReportFlowVO> getFlowReport(ReportFlowQueryRequest reportFlowQueryRequest);

    /**
     * 领用频次
     */
    Page<ReportUsageVO> getUsageReport(ReportUsageQueryRequest reportUsageQueryRequest);

    /**
     * 周转率
     */
    Page<ReportTurnoverVO> getTurnoverReport(ReportTurnoverQueryRequest reportTurnoverQueryRequest);
}
