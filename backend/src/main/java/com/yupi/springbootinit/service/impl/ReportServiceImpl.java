package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.constant.ApprovalConstant;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.mapper.InventoryApprovalMapper;
import com.yupi.springbootinit.mapper.InventoryInfoMapper;
import com.yupi.springbootinit.mapper.MaterialInfoMapper;
import com.yupi.springbootinit.model.dto.report.ReportFlowQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportStockQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportTurnoverQueryRequest;
import com.yupi.springbootinit.model.dto.report.ReportUsageQueryRequest;
import com.yupi.springbootinit.model.entity.InventoryApproval;
import com.yupi.springbootinit.model.entity.InventoryInfo;
import com.yupi.springbootinit.model.entity.MaterialInfo;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.ReportFlowVO;
import com.yupi.springbootinit.model.vo.ReportStockVO;
import com.yupi.springbootinit.model.vo.ReportTurnoverVO;
import com.yupi.springbootinit.model.vo.ReportUsageVO;
import com.yupi.springbootinit.service.ReportService;
import com.yupi.springbootinit.service.UserService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

/**
 * 报表统计服务实现
 */
@Service
public class ReportServiceImpl implements ReportService {

    private static final String DATETIME_PATTERN = "yyyy-MM-dd HH:mm:ss";

    @Resource
    private MaterialInfoMapper materialInfoMapper;

    @Resource
    private InventoryInfoMapper inventoryInfoMapper;

    @Resource
    private InventoryApprovalMapper inventoryApprovalMapper;

    @Resource
    private UserService userService;

    @Override
    public Page<ReportStockVO> getStockReport(ReportStockQueryRequest reportStockQueryRequest) {
        ReportStockQueryRequest queryRequest = reportStockQueryRequest == null ? new ReportStockQueryRequest()
                : reportStockQueryRequest;
        QueryWrapper<MaterialInfo> materialQueryWrapper = new QueryWrapper<>();
        materialQueryWrapper.like(StringUtils.isNotBlank(queryRequest.getMaterialName()), "materialName",
                queryRequest.getMaterialName());
        materialQueryWrapper.eq(StringUtils.isNotBlank(queryRequest.getCategory()), "category", queryRequest.getCategory());
        materialQueryWrapper.orderByDesc("updateTime");
        Page<MaterialInfo> materialPage = materialInfoMapper.selectPage(
                new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize()), materialQueryWrapper);

        List<MaterialInfo> materialInfoList = materialPage.getRecords();
        Map<Long, List<InventoryInfo>> materialInventoryListMap = new HashMap<>();
        if (materialInfoList != null && !materialInfoList.isEmpty()) {
            Set<Long> materialIdSet = materialInfoList.stream().map(MaterialInfo::getId).collect(Collectors.toSet());
            QueryWrapper<InventoryInfo> inventoryQueryWrapper = new QueryWrapper<>();
            inventoryQueryWrapper.in("materialId", materialIdSet);
            List<InventoryInfo> inventoryInfoList = inventoryInfoMapper.selectList(inventoryQueryWrapper);
            materialInventoryListMap = inventoryInfoList.stream().collect(Collectors.groupingBy(InventoryInfo::getMaterialId));
        }

        List<ReportStockVO> reportStockVOList = new ArrayList<>();
        for (MaterialInfo materialInfo : materialInfoList) {
            List<InventoryInfo> inventoryInfoList = materialInventoryListMap.getOrDefault(materialInfo.getId(),
                    new ArrayList<>());
            int totalStock = inventoryInfoList.stream().map(InventoryInfo::getCurrentStock).filter(stock -> stock != null && stock > 0)
                    .reduce(0, Integer::sum);
            int warnThreshold = inventoryInfoList.stream().map(InventoryInfo::getWarnThreshold).filter(value -> value != null)
                    .findFirst().orElse(0);
            String location = inventoryInfoList.stream().map(InventoryInfo::getLocation).filter(StringUtils::isNotBlank)
                    .findFirst().orElse(materialInfo.getLocation());
            ReportStockVO reportStockVO = new ReportStockVO();
            reportStockVO.setMaterialId(materialInfo.getId());
            reportStockVO.setMaterialName(materialInfo.getMaterialName());
            reportStockVO.setCategory(materialInfo.getCategory());
            reportStockVO.setLocation(location);
            reportStockVO.setCurrentStock(totalStock);
            reportStockVO.setWarnThreshold(warnThreshold);
            reportStockVO.setStatus(materialInfo.getStatus());
            reportStockVOList.add(reportStockVO);
        }

        Page<ReportStockVO> voPage = new Page<>(materialPage.getCurrent(), materialPage.getSize(), materialPage.getTotal());
        voPage.setRecords(reportStockVOList);
        return voPage;
    }

    @Override
    public Page<ReportFlowVO> getFlowReport(ReportFlowQueryRequest reportFlowQueryRequest) {
        ReportFlowQueryRequest queryRequest = reportFlowQueryRequest == null ? new ReportFlowQueryRequest()
                : reportFlowQueryRequest;
        QueryWrapper<InventoryApproval> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", ApprovalConstant.STATUS_OUTBOUND);

        Date startTime = parseDate(queryRequest.getStartTime());
        Date endTime = parseDate(queryRequest.getEndTime());
        queryWrapper.ge(startTime != null, "outTime", startTime);
        queryWrapper.le(endTime != null, "outTime", endTime);

        if (StringUtils.isNotBlank(queryRequest.getMaterialName())) {
            QueryWrapper<MaterialInfo> materialQueryWrapper = new QueryWrapper<>();
            materialQueryWrapper.like("materialName", queryRequest.getMaterialName());
            List<MaterialInfo> materialInfoList = materialInfoMapper.selectList(materialQueryWrapper);
            if (materialInfoList == null || materialInfoList.isEmpty()) {
                return new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize(), 0);
            }
            queryWrapper.in("materialId", materialInfoList.stream().map(MaterialInfo::getId).collect(Collectors.toSet()));
        }
        queryWrapper.orderByDesc("outTime");

        Page<InventoryApproval> approvalPage = inventoryApprovalMapper.selectPage(
                new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize()), queryWrapper);
        if (approvalPage.getRecords() == null || approvalPage.getRecords().isEmpty()) {
            return new Page<>(approvalPage.getCurrent(), approvalPage.getSize(), approvalPage.getTotal());
        }

        Set<Long> materialIdSet = approvalPage.getRecords().stream().map(InventoryApproval::getMaterialId).collect(Collectors.toSet());
        Set<Long> operatorIdSet = approvalPage.getRecords().stream().map(InventoryApproval::getApproveId).collect(Collectors.toSet());
        Map<Long, String> materialNameMap = materialInfoMapper.selectBatchIds(materialIdSet).stream()
                .collect(Collectors.toMap(MaterialInfo::getId, MaterialInfo::getMaterialName));
        Map<Long, String> operatorNameMap = userService.listByIds(operatorIdSet).stream()
                .collect(Collectors.toMap(User::getId, user -> StringUtils.defaultIfBlank(user.getUserName(), user.getUserAccount())));

        List<ReportFlowVO> reportFlowVOList = approvalPage.getRecords().stream().map(approval -> {
            ReportFlowVO reportFlowVO = new ReportFlowVO();
            reportFlowVO.setApplyId(approval.getId());
            reportFlowVO.setApprovalNo(approval.getApprovalNo());
            reportFlowVO.setMaterialId(approval.getMaterialId());
            reportFlowVO.setMaterialName(materialNameMap.getOrDefault(approval.getMaterialId(), "-"));
            reportFlowVO.setFlowType("OUT");
            reportFlowVO.setBizType("APPLY");
            reportFlowVO.setQuantity(approval.getQuantity());
            reportFlowVO.setOperatorId(approval.getApproveId());
            reportFlowVO.setOperatorName(operatorNameMap.getOrDefault(approval.getApproveId(), "-"));
            reportFlowVO.setCreateTime(approval.getOutTime());
            return reportFlowVO;
        }).collect(Collectors.toList());

        Page<ReportFlowVO> voPage = new Page<>(approvalPage.getCurrent(), approvalPage.getSize(), approvalPage.getTotal());
        voPage.setRecords(reportFlowVOList);
        return voPage;
    }

    @Override
    public Page<ReportUsageVO> getUsageReport(ReportUsageQueryRequest reportUsageQueryRequest) {
        ReportUsageQueryRequest queryRequest = reportUsageQueryRequest == null ? new ReportUsageQueryRequest()
                : reportUsageQueryRequest;
        List<InventoryApproval> approvalList = listOutboundApprovals(queryRequest.getMaterialName(),
                queryRequest.getStartTime(), queryRequest.getEndTime());
        if (approvalList.isEmpty()) {
            return new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize(), 0);
        }
        Map<Long, List<InventoryApproval>> materialApprovalMap = approvalList.stream()
                .collect(Collectors.groupingBy(InventoryApproval::getMaterialId));
        Map<Long, String> materialNameMap = materialInfoMapper.selectBatchIds(materialApprovalMap.keySet()).stream()
                .collect(Collectors.toMap(MaterialInfo::getId, MaterialInfo::getMaterialName));
        List<ReportUsageVO> usageVOList = materialApprovalMap.entrySet().stream().map(entry -> {
            List<InventoryApproval> materialApprovals = entry.getValue();
            ReportUsageVO reportUsageVO = new ReportUsageVO();
            reportUsageVO.setMaterialId(entry.getKey());
            reportUsageVO.setMaterialName(materialNameMap.getOrDefault(entry.getKey(), "-"));
            reportUsageVO.setUsageCount((long) materialApprovals.size());
            int totalQuantity = materialApprovals.stream().map(InventoryApproval::getQuantity).filter(q -> q != null && q > 0)
                    .reduce(0, Integer::sum);
            reportUsageVO.setTotalQuantity(totalQuantity);
            return reportUsageVO;
        }).sorted(Comparator.comparing(ReportUsageVO::getUsageCount).reversed()).collect(Collectors.toList());
        return paginateList(queryRequest.getCurrent(), queryRequest.getPageSize(), usageVOList);
    }

    @Override
    public Page<ReportTurnoverVO> getTurnoverReport(ReportTurnoverQueryRequest reportTurnoverQueryRequest) {
        ReportTurnoverQueryRequest queryRequest = reportTurnoverQueryRequest == null ? new ReportTurnoverQueryRequest()
                : reportTurnoverQueryRequest;
        List<InventoryApproval> approvalList = listOutboundApprovals(queryRequest.getMaterialName(),
                queryRequest.getStartTime(), queryRequest.getEndTime());
        if (approvalList.isEmpty()) {
            return new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize(), 0);
        }
        Map<Long, Integer> materialOutQuantityMap = new HashMap<>();
        for (InventoryApproval approval : approvalList) {
            int quantity = approval.getQuantity() == null ? 0 : approval.getQuantity();
            materialOutQuantityMap.merge(approval.getMaterialId(), quantity, Integer::sum);
        }

        Set<Long> materialIdSet = materialOutQuantityMap.keySet();
        Map<Long, String> materialNameMap = materialInfoMapper.selectBatchIds(materialIdSet).stream()
                .collect(Collectors.toMap(MaterialInfo::getId, MaterialInfo::getMaterialName));
        QueryWrapper<InventoryInfo> inventoryQueryWrapper = new QueryWrapper<>();
        inventoryQueryWrapper.in("materialId", materialIdSet);
        List<InventoryInfo> inventoryInfoList = inventoryInfoMapper.selectList(inventoryQueryWrapper);
        Map<Long, Integer> materialStockMap = new HashMap<>();
        for (InventoryInfo inventoryInfo : inventoryInfoList) {
            int currentStock = inventoryInfo.getCurrentStock() == null ? 0 : inventoryInfo.getCurrentStock();
            materialStockMap.merge(inventoryInfo.getMaterialId(), currentStock, Integer::sum);
        }

        List<ReportTurnoverVO> turnoverVOList = materialOutQuantityMap.entrySet().stream().map(entry -> {
            Long materialId = entry.getKey();
            int outQuantity = entry.getValue();
            int currentStock = materialStockMap.getOrDefault(materialId, 0);
            double turnoverRate = currentStock <= 0 ? 0D
                    : BigDecimal.valueOf((double) outQuantity / currentStock).setScale(2, RoundingMode.HALF_UP)
                            .doubleValue();
            ReportTurnoverVO turnoverVO = new ReportTurnoverVO();
            turnoverVO.setMaterialId(materialId);
            turnoverVO.setMaterialName(materialNameMap.getOrDefault(materialId, "-"));
            turnoverVO.setOutQuantity(outQuantity);
            turnoverVO.setCurrentStock(currentStock);
            turnoverVO.setTurnoverRate(turnoverRate);
            return turnoverVO;
        }).sorted(Comparator.comparing(ReportTurnoverVO::getTurnoverRate).reversed()).collect(Collectors.toList());
        return paginateList(queryRequest.getCurrent(), queryRequest.getPageSize(), turnoverVOList);
    }

    private List<InventoryApproval> listOutboundApprovals(String materialName, String startTimeStr, String endTimeStr) {
        QueryWrapper<InventoryApproval> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", ApprovalConstant.STATUS_OUTBOUND);
        Date startTime = parseDate(startTimeStr);
        Date endTime = parseDate(endTimeStr);
        queryWrapper.ge(startTime != null, "outTime", startTime);
        queryWrapper.le(endTime != null, "outTime", endTime);
        if (StringUtils.isNotBlank(materialName)) {
            QueryWrapper<MaterialInfo> materialQueryWrapper = new QueryWrapper<>();
            materialQueryWrapper.like("materialName", materialName);
            List<MaterialInfo> materialInfoList = materialInfoMapper.selectList(materialQueryWrapper);
            if (materialInfoList == null || materialInfoList.isEmpty()) {
                return new ArrayList<>();
            }
            queryWrapper.in("materialId", materialInfoList.stream().map(MaterialInfo::getId).collect(Collectors.toSet()));
        }
        queryWrapper.orderByDesc("outTime");
        return inventoryApprovalMapper.selectList(queryWrapper);
    }

    private <T> Page<T> paginateList(int current, int pageSize, List<T> sourceList) {
        int safeCurrent = Math.max(current, 1);
        int safePageSize = Math.max(pageSize, 1);
        int total = sourceList == null ? 0 : sourceList.size();
        Page<T> page = new Page<>(safeCurrent, safePageSize, total);
        if (total == 0) {
            page.setRecords(new ArrayList<>());
            return page;
        }
        int fromIndex = Math.max((safeCurrent - 1) * safePageSize, 0);
        if (fromIndex >= total) {
            page.setRecords(new ArrayList<>());
            return page;
        }
        int toIndex = Math.min(fromIndex + safePageSize, total);
        page.setRecords(sourceList.subList(fromIndex, toIndex));
        return page;
    }

    private Date parseDate(String dateTime) {
        if (StringUtils.isBlank(dateTime)) {
            return null;
        }
        try {
            return new SimpleDateFormat(DATETIME_PATTERN).parse(dateTime);
        } catch (ParseException e) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "时间格式错误，请使用 " + DATETIME_PATTERN);
        }
    }
}
