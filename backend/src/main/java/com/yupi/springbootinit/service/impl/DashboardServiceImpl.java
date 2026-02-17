package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.constant.ApprovalConstant;
import com.yupi.springbootinit.constant.WarnConstant;
import com.yupi.springbootinit.mapper.InventoryApprovalMapper;
import com.yupi.springbootinit.mapper.InventoryInfoMapper;
import com.yupi.springbootinit.mapper.MaterialInfoMapper;
import com.yupi.springbootinit.mapper.WarnRecordMapper;
import com.yupi.springbootinit.model.dto.apply.ApplyQueryRequest;
import com.yupi.springbootinit.model.dto.warn.WarnQueryRequest;
import com.yupi.springbootinit.model.entity.InventoryApproval;
import com.yupi.springbootinit.model.entity.InventoryInfo;
import com.yupi.springbootinit.model.entity.MaterialInfo;
import com.yupi.springbootinit.model.entity.WarnRecord;
import com.yupi.springbootinit.model.vo.ApplyVO;
import com.yupi.springbootinit.model.vo.DashboardPieItemVO;
import com.yupi.springbootinit.model.vo.DashboardStatVO;
import com.yupi.springbootinit.model.vo.DashboardTrendItemVO;
import com.yupi.springbootinit.model.vo.WarnVO;
import com.yupi.springbootinit.service.ApplyService;
import com.yupi.springbootinit.service.DashboardService;
import com.yupi.springbootinit.service.WarnService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import org.springframework.stereotype.Service;

/**
 * 首页看板服务实现
 */
@Service
public class DashboardServiceImpl implements DashboardService {

    private static final int TREND_DAYS = 7;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Resource
    private MaterialInfoMapper materialInfoMapper;

    @Resource
    private InventoryInfoMapper inventoryInfoMapper;

    @Resource
    private InventoryApprovalMapper inventoryApprovalMapper;

    @Resource
    private WarnRecordMapper warnRecordMapper;

    @Resource
    private ApplyService applyService;

    @Resource
    private WarnService warnService;

    @Override
    public DashboardStatVO getStat() {
        DashboardStatVO vo = new DashboardStatVO();
        // 物资总数
        Long materialCount = materialInfoMapper.selectCount(new QueryWrapper<>());
        vo.setMaterialCount(materialCount == null ? 0L : materialCount);

        // 库存总量
        List<InventoryInfo> inventoryList = inventoryInfoMapper.selectList(new QueryWrapper<>());
        long totalStock = inventoryList.stream()
                .map(InventoryInfo::getCurrentStock)
                .filter(value -> value != null && value > 0)
                .mapToLong(Integer::longValue)
                .sum();
        vo.setTotalStock(totalStock);

        // 今日申请数量 & 待审批数量
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();
        Date startDate = Date.from(startOfDay.atZone(ZoneId.systemDefault()).toInstant());
        Date endDate = Date.from(endOfDay.atZone(ZoneId.systemDefault()).toInstant());

        QueryWrapper<InventoryApproval> todayQuery = new QueryWrapper<>();
        todayQuery.ge("applyTime", startDate);
        todayQuery.lt("applyTime", endDate);
        Long todayApplyCount = inventoryApprovalMapper.selectCount(todayQuery);
        vo.setTodayApplyCount(todayApplyCount == null ? 0L : todayApplyCount);

        QueryWrapper<InventoryApproval> todayOutQuery = new QueryWrapper<>();
        todayOutQuery.eq("status", ApprovalConstant.STATUS_OUTBOUND);
        todayOutQuery.ge("outTime", startDate);
        todayOutQuery.lt("outTime", endDate);
        List<InventoryApproval> todayOutList = inventoryApprovalMapper.selectList(todayOutQuery);
        long todayOutQuantity = todayOutList.stream()
                .map(InventoryApproval::getQuantity)
                .filter(value -> value != null && value > 0)
                .mapToLong(Integer::longValue)
                .sum();
        vo.setTodayOutQuantity(todayOutQuantity);

        QueryWrapper<InventoryApproval> pendingQuery = new QueryWrapper<>();
        pendingQuery.eq("status", ApprovalConstant.STATUS_PENDING);
        Long pendingApplyCount = inventoryApprovalMapper.selectCount(pendingQuery);
        vo.setPendingApplyCount(pendingApplyCount == null ? 0L : pendingApplyCount);

        // 未处理预警数量
        QueryWrapper<WarnRecord> warnQuery = new QueryWrapper<>();
        warnQuery.eq("handled", WarnConstant.UNHANDLED);
        Long unhandledWarnCount = warnRecordMapper.selectCount(warnQuery);
        vo.setUnhandledWarnCount(unhandledWarnCount == null ? 0L : unhandledWarnCount);

        Date sevenDaysLater = Date.from(today.plusDays(7).atStartOfDay().atZone(ZoneId.systemDefault()).toInstant());
        QueryWrapper<MaterialInfo> expireQuery = new QueryWrapper<>();
        expireQuery.isNotNull("expireDate");
        expireQuery.ge("expireDate", startDate);
        expireQuery.le("expireDate", sevenDaysLater);
        Long expiringSoonCount = materialInfoMapper.selectCount(expireQuery);
        vo.setExpiringSoonCount(expiringSoonCount == null ? 0L : expiringSoonCount);
        return vo;
    }

    @Override
    public List<DashboardTrendItemVO> getTrend() {
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(TREND_DAYS - 1);
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = today.plusDays(1).atStartOfDay();
        Date start = Date.from(startDateTime.atZone(ZoneId.systemDefault()).toInstant());
        Date end = Date.from(endDateTime.atZone(ZoneId.systemDefault()).toInstant());

        QueryWrapper<InventoryApproval> queryWrapper = new QueryWrapper<>();
        queryWrapper.ge("applyTime", start);
        queryWrapper.lt("applyTime", end);
        List<InventoryApproval> approvals = inventoryApprovalMapper.selectList(queryWrapper);

        Map<String, DashboardTrendItemVO> dateMap = new HashMap<>();
        for (int i = 0; i < TREND_DAYS; i++) {
            LocalDate date = startDate.plusDays(i);
            String key = date.format(DATE_FORMATTER);
            DashboardTrendItemVO item = new DashboardTrendItemVO();
            item.setDate(key);
            item.setApplyCount(0);
            item.setOutQuantity(0);
            dateMap.put(key, item);
        }

        for (InventoryApproval approval : approvals) {
            if (approval.getApplyTime() != null) {
                LocalDate date = approval.getApplyTime().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                String key = date.format(DATE_FORMATTER);
                DashboardTrendItemVO item = dateMap.get(key);
                if (item != null) {
                    item.setApplyCount(item.getApplyCount() + 1);
                }
            }
            if (approval.getStatus() != null && approval.getStatus() == ApprovalConstant.STATUS_OUTBOUND
                    && approval.getOutTime() != null) {
                LocalDate date = approval.getOutTime().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                String key = date.format(DATE_FORMATTER);
                DashboardTrendItemVO item = dateMap.get(key);
                if (item != null && approval.getQuantity() != null && approval.getQuantity() > 0) {
                    item.setOutQuantity(item.getOutQuantity() + approval.getQuantity());
                }
            }
        }
        return dateMap.values().stream()
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .collect(Collectors.toList());
    }

    @Override
    public List<DashboardPieItemVO> getPie() {
        List<MaterialInfo> materialList = materialInfoMapper.selectList(new QueryWrapper<>());
        Map<String, Integer> categoryMap = new HashMap<>();
        for (MaterialInfo materialInfo : materialList) {
            String category = materialInfo.getCategory();
            if (category == null || category.trim().isEmpty()) {
                category = "未分类";
            }
            Integer stockTotal = materialInfo.getStockTotal() == null ? 0 : materialInfo.getStockTotal();
            if (stockTotal <= 0) {
                continue;
            }
            categoryMap.merge(category, stockTotal, Integer::sum);
        }
        List<DashboardPieItemVO> result = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : categoryMap.entrySet()) {
            DashboardPieItemVO item = new DashboardPieItemVO();
            item.setCategory(entry.getKey());
            item.setValue(entry.getValue());
            result.add(item);
        }
        return result;
    }

    @Override
    public Page<ApplyVO> getTodo(int pageSize) {
        ApplyQueryRequest queryRequest = new ApplyQueryRequest();
        queryRequest.setCurrent(1);
        queryRequest.setPageSize(pageSize);
        queryRequest.setStatus(ApprovalConstant.STATUS_PENDING);
        return applyService.listPendingApply(queryRequest);
    }

    @Override
    public Page<WarnVO> getWarn(int pageSize) {
        WarnQueryRequest queryRequest = new WarnQueryRequest();
        queryRequest.setCurrent(1);
        queryRequest.setPageSize(pageSize);
        queryRequest.setHandled(WarnConstant.UNHANDLED);
        return warnService.listWarn(queryRequest);
    }
}

