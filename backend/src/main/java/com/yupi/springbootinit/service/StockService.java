package com.yupi.springbootinit.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.model.dto.report.ReportFlowQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportStockQueryRequest;
import com.yupi.springbootinit.model.dto.stock.StockAdjustRequest;
import com.yupi.springbootinit.model.dto.stock.StockSaveRequest;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.ReportFlowVO;
import com.yupi.springbootinit.model.vo.ReportStockVO;

/**
 * 库存管理服务
 */
public interface StockService {

    /**
     * 库存台账列表
     */
    Page<ReportStockVO> listStock(ReportStockQueryRequest queryRequest);

    /**
     * 库存详情（按物资聚合）
     */
    ReportStockVO getStockDetail(Long materialId);

    /**
     * 库存调整
     */
    Boolean adjustStock(StockAdjustRequest stockAdjustRequest, User operator);

    /**
     * 编辑库存信息
     */
    Boolean saveStock(StockSaveRequest stockSaveRequest, User operator);

    /**
     * 删除库存记录（按物资）
     */
    Boolean deleteStock(Long materialId, User operator);

    /**
     * 出入库流水
     */
    Page<ReportFlowVO> listFlow(ReportFlowQueryRequest queryRequest);
}

