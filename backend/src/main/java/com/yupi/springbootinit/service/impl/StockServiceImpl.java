package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.mapper.InventoryInfoMapper;
import com.yupi.springbootinit.mapper.MaterialInfoMapper;
import com.yupi.springbootinit.model.dto.report.ReportFlowQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportStockQueryRequest;
import com.yupi.springbootinit.model.dto.stock.StockAdjustRequest;
import com.yupi.springbootinit.model.dto.stock.StockSaveRequest;
import com.yupi.springbootinit.mapper.StockFlowMapper;
import com.yupi.springbootinit.model.entity.InventoryInfo;
import com.yupi.springbootinit.model.entity.MaterialInfo;
import com.yupi.springbootinit.model.entity.StockFlow;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.ReportFlowVO;
import com.yupi.springbootinit.model.vo.ReportStockVO;
import com.yupi.springbootinit.service.ReportService;
import com.yupi.springbootinit.service.StockService;
import com.yupi.springbootinit.service.WarnService;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 库存管理服务实现
 */
@Service
public class StockServiceImpl implements StockService {
    private static final Random RANDOM = new Random();

    @Resource
    private ReportService reportService;

    @Resource
    private InventoryInfoMapper inventoryInfoMapper;

    @Resource
    private MaterialInfoMapper materialInfoMapper;

    @Resource
    private WarnService warnService;

    @Resource
    private StockFlowMapper stockFlowMapper;

    @Override
    public Page<ReportStockVO> listStock(ReportStockQueryRequest queryRequest) {
        return reportService.getStockReport(queryRequest);
    }

    @Override
    public ReportStockVO getStockDetail(Long materialId) {
        if (materialId == null || materialId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        ReportStockQueryRequest queryRequest = new ReportStockQueryRequest();
        queryRequest.setCurrent(1);
        queryRequest.setPageSize(1);
        // 通过物资精确 ID 过滤
        MaterialInfo materialInfo = materialInfoMapper.selectById(materialId);
        if (materialInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "物资不存在");
        }
        queryRequest.setMaterialName(materialInfo.getMaterialName());
        Page<ReportStockVO> page = reportService.getStockReport(queryRequest);
        if (page.getRecords() == null || page.getRecords().isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "库存记录不存在");
        }
        // 精确匹配 materialId，避免同名物资干扰
        List<ReportStockVO> matchList = page.getRecords().stream()
                .filter(item -> materialId.equals(item.getMaterialId()))
                .collect(Collectors.toList());
        if (matchList.isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "库存记录不存在");
        }
        return matchList.get(0);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean adjustStock(StockAdjustRequest stockAdjustRequest, User operator) {
        if (stockAdjustRequest == null || operator == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Long materialId = stockAdjustRequest.getMaterialId();
        Integer adjustAmount = stockAdjustRequest.getAdjustAmount();
        if (materialId == null || materialId <= 0 || adjustAmount == null || adjustAmount == 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "物资或调整数量不合法");
        }
        MaterialInfo materialInfo = materialInfoMapper.selectById(materialId);
        if (materialInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "物资不存在");
        }
        // 找到需要调整的库存记录（按位置或按物资 ID）
        QueryWrapper<InventoryInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("materialId", materialId);
        if (StringUtils.isNotBlank(stockAdjustRequest.getLocation())) {
            queryWrapper.eq("location", stockAdjustRequest.getLocation());
        }
        queryWrapper.orderByAsc("id");
        queryWrapper.last("limit 1");
        InventoryInfo inventoryInfo = inventoryInfoMapper.selectOne(queryWrapper);
        if (inventoryInfo == null) {
            // 若不存在，则为该物资创建一条库存记录
            inventoryInfo = new InventoryInfo();
            inventoryInfo.setMaterialId(materialId);
            inventoryInfo.setLocation(StringUtils.defaultIfBlank(stockAdjustRequest.getLocation(), materialInfo.getLocation()));
            inventoryInfo.setCurrentStock(0);
            inventoryInfo.setWarnThreshold(0);
            Date now = new Date();
            inventoryInfo.setCreateTime(now);
            inventoryInfo.setUpdateTime(now);
            inventoryInfoMapper.insert(inventoryInfo);
        }

        int currentStock = inventoryInfo.getCurrentStock() == null ? 0 : inventoryInfo.getCurrentStock();
        int newStock = currentStock + adjustAmount;
        if (newStock < 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "调整后库存不能小于 0");
        }

        LambdaUpdateWrapper<InventoryInfo> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(InventoryInfo::getId, inventoryInfo.getId());
        updateWrapper.set(InventoryInfo::getCurrentStock, newStock);
        updateWrapper.set(InventoryInfo::getUpdateTime, new Date());
        int updated = inventoryInfoMapper.update(null, updateWrapper);
        if (updated <= 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "库存调整失败");
        }

        // 记录出入库流水
        StockFlow stockFlow = new StockFlow();
        stockFlow.setMaterialId(materialId);
        stockFlow.setFlowType(adjustAmount > 0 ? "MANUAL_IN" : "MANUAL_OUT");
        stockFlow.setQuantity(Math.abs(adjustAmount));
        stockFlow.setBeforeStock(currentStock);
        stockFlow.setAfterStock(newStock);
        stockFlow.setOperatorId(operator.getId());
        stockFlow.setRelatedApprovalNo(generateFlowNo());
        stockFlow.setRemark(stockAdjustRequest.getRemark());
        stockFlow.setCreateTime(new Date());
        stockFlowMapper.insert(stockFlow);

        // 回写物资总库存
        int totalStock = recalculateMaterialTotalStock(materialId);

        // 同步预警
        warnService.syncStockWarnForMaterial(materialId, totalStock);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean saveStock(StockSaveRequest stockSaveRequest, User operator) {
        if (stockSaveRequest == null || stockSaveRequest.getMaterialId() == null || stockSaveRequest.getMaterialId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        if (stockSaveRequest.getWarnThreshold() != null && stockSaveRequest.getWarnThreshold() < 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "预警阈值不能小于 0");
        }
        Long materialId = stockSaveRequest.getMaterialId();
        MaterialInfo materialInfo = materialInfoMapper.selectById(materialId);
        if (materialInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "物资不存在");
        }
        QueryWrapper<InventoryInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("materialId", materialId);
        queryWrapper.orderByAsc("id");
        List<InventoryInfo> inventoryInfoList = inventoryInfoMapper.selectList(queryWrapper);
        Date now = new Date();
        if (inventoryInfoList == null || inventoryInfoList.isEmpty()) {
            InventoryInfo inventoryInfo = new InventoryInfo();
            inventoryInfo.setMaterialId(materialId);
            inventoryInfo.setLocation(StringUtils.defaultIfBlank(stockSaveRequest.getLocation(), materialInfo.getLocation()));
            inventoryInfo.setCurrentStock(0);
            inventoryInfo.setWarnThreshold(stockSaveRequest.getWarnThreshold() == null ? 0 : stockSaveRequest.getWarnThreshold());
            inventoryInfo.setCreateTime(now);
            inventoryInfo.setUpdateTime(now);
            inventoryInfoMapper.insert(inventoryInfo);
        } else {
            InventoryInfo firstInventory = inventoryInfoList.get(0);
            boolean needUpdateFirst = false;
            if (StringUtils.isNotBlank(stockSaveRequest.getLocation())) {
                firstInventory.setLocation(stockSaveRequest.getLocation());
                needUpdateFirst = true;
            }
            if (stockSaveRequest.getWarnThreshold() != null) {
                firstInventory.setWarnThreshold(stockSaveRequest.getWarnThreshold());
                needUpdateFirst = true;
                // 保持同一物资的阈值一致
                for (int i = 1; i < inventoryInfoList.size(); i++) {
                    InventoryInfo inventoryInfo = inventoryInfoList.get(i);
                    inventoryInfo.setWarnThreshold(stockSaveRequest.getWarnThreshold());
                    inventoryInfo.setUpdateTime(now);
                    inventoryInfoMapper.updateById(inventoryInfo);
                }
            }
            if (needUpdateFirst) {
                firstInventory.setUpdateTime(now);
                inventoryInfoMapper.updateById(firstInventory);
            }
        }
        if (StringUtils.isNotBlank(stockSaveRequest.getLocation())) {
            materialInfo.setLocation(stockSaveRequest.getLocation());
        }
        materialInfo.setUpdateTime(now);
        materialInfoMapper.updateById(materialInfo);
        int totalStock = recalculateMaterialTotalStock(materialId);
        warnService.syncStockWarnForMaterial(materialId, totalStock);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteStock(Long materialId, User operator) {
        if (materialId == null || materialId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        MaterialInfo materialInfo = materialInfoMapper.selectById(materialId);
        if (materialInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "物资不存在");
        }
        QueryWrapper<InventoryInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("materialId", materialId);
        inventoryInfoMapper.delete(queryWrapper);
        materialInfo.setStockTotal(0);
        materialInfo.setUpdateTime(new Date());
        materialInfoMapper.updateById(materialInfo);
        warnService.syncStockWarnForMaterial(materialId, 0);
        return true;
    }

    @Override
    public Page<ReportFlowVO> listFlow(ReportFlowQueryRequest queryRequest) {
        return reportService.getFlowReport(queryRequest);
    }

    private int recalculateMaterialTotalStock(Long materialId) {
        QueryWrapper<InventoryInfo> sumQuery = new QueryWrapper<>();
        sumQuery.eq("materialId", materialId);
        List<InventoryInfo> inventoryList = inventoryInfoMapper.selectList(sumQuery);
        int totalStock = inventoryList.stream()
                .map(InventoryInfo::getCurrentStock)
                .filter(value -> value != null && value > 0)
                .reduce(0, Integer::sum);
        MaterialInfo materialInfo = materialInfoMapper.selectById(materialId);
        if (materialInfo != null) {
            materialInfo.setStockTotal(totalStock);
            materialInfo.setUpdateTime(new Date());
            materialInfoMapper.updateById(materialInfo);
        }
        return totalStock;
    }

    private String generateFlowNo() {
        String timePart = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        int randomPart = 1000 + RANDOM.nextInt(9000);
        return "FL" + timePart + randomPart;
    }
}

