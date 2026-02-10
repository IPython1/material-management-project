package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.constant.NoticeConstant;
import com.yupi.springbootinit.constant.UserConstant;
import com.yupi.springbootinit.constant.WarnConstant;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.mapper.InventoryInfoMapper;
import com.yupi.springbootinit.mapper.MaterialInfoMapper;
import com.yupi.springbootinit.mapper.NoticeMapper;
import com.yupi.springbootinit.mapper.WarnRecordMapper;
import com.yupi.springbootinit.mapper.WarnRuleMapper;
import com.yupi.springbootinit.model.dto.warn.WarnQueryRequest;
import com.yupi.springbootinit.model.dto.warn.WarnRuleSaveRequest;
import com.yupi.springbootinit.model.entity.InventoryInfo;
import com.yupi.springbootinit.model.entity.MaterialInfo;
import com.yupi.springbootinit.model.entity.Notice;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.entity.WarnRecord;
import com.yupi.springbootinit.model.entity.WarnRule;
import com.yupi.springbootinit.model.vo.WarnRuleVO;
import com.yupi.springbootinit.model.vo.WarnVO;
import com.yupi.springbootinit.service.UserService;
import com.yupi.springbootinit.service.WarnService;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 预警服务实现
 */
@Service
public class WarnServiceImpl implements WarnService {

    @Resource
    private MaterialInfoMapper materialInfoMapper;

    @Resource
    private InventoryInfoMapper inventoryInfoMapper;

    @Resource
    private WarnRuleMapper warnRuleMapper;

    @Resource
    private WarnRecordMapper warnRecordMapper;

    @Resource
    private NoticeMapper noticeMapper;

    @Resource
    private UserService userService;

    @Override
    public Page<WarnVO> listWarn(WarnQueryRequest warnQueryRequest) {
        syncWarnRecordsByRules();
        WarnQueryRequest queryRequest = warnQueryRequest == null ? new WarnQueryRequest() : warnQueryRequest;
        QueryWrapper<WarnRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(queryRequest.getWarnType() != null, "warnType", queryRequest.getWarnType());
        queryWrapper.eq(queryRequest.getHandled() != null, "handled", queryRequest.getHandled());
        if (StringUtils.isNotBlank(queryRequest.getMaterialName())) {
            QueryWrapper<MaterialInfo> materialQueryWrapper = new QueryWrapper<>();
            materialQueryWrapper.like("materialName", queryRequest.getMaterialName());
            List<MaterialInfo> materialInfoList = materialInfoMapper.selectList(materialQueryWrapper);
            if (materialInfoList == null || materialInfoList.isEmpty()) {
                return new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize(), 0);
            }
            Set<Long> materialIdSet = materialInfoList.stream().map(MaterialInfo::getId).collect(Collectors.toSet());
            queryWrapper.in("materialId", materialIdSet);
        }
        queryWrapper.orderByDesc("createTime");
        Page<WarnRecord> warnRecordPage = warnRecordMapper.selectPage(
                new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize()), queryWrapper);

        Page<WarnVO> warnVOPage = new Page<>(warnRecordPage.getCurrent(), warnRecordPage.getSize(), warnRecordPage.getTotal());
        if (warnRecordPage.getRecords() == null || warnRecordPage.getRecords().isEmpty()) {
            warnVOPage.setRecords(new ArrayList<>());
            return warnVOPage;
        }
        Set<Long> materialIdSet = warnRecordPage.getRecords().stream().map(WarnRecord::getMaterialId).collect(Collectors.toSet());
        Map<Long, String> materialNameMap = materialInfoMapper.selectBatchIds(materialIdSet).stream()
                .collect(Collectors.toMap(MaterialInfo::getId, MaterialInfo::getMaterialName));
        List<WarnVO> warnVOList = warnRecordPage.getRecords().stream().map(record -> {
            WarnVO warnVO = new WarnVO();
            BeanUtils.copyProperties(record, warnVO);
            warnVO.setWarnTypeText(record.getWarnType() == WarnConstant.TYPE_STOCK_LOW ? "库存预警" : "临期预警");
            warnVO.setMaterialName(materialNameMap.getOrDefault(record.getMaterialId(), "-"));
            return warnVO;
        }).collect(Collectors.toList());
        warnVOPage.setRecords(warnVOList);
        return warnVOPage;
    }

    @Override
    public List<WarnRuleVO> listWarnRule() {
        QueryWrapper<WarnRule> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("updateTime");
        List<WarnRule> warnRuleList = warnRuleMapper.selectList(queryWrapper);
        if (warnRuleList == null || warnRuleList.isEmpty()) {
            return new ArrayList<>();
        }
        Set<Long> materialIdSet = warnRuleList.stream().map(WarnRule::getMaterialId).filter(id -> id != null && id > 0)
                .collect(Collectors.toSet());
        Map<Long, String> materialNameMap = materialIdSet.isEmpty() ? new HashMap<>() : materialInfoMapper.selectBatchIds(materialIdSet)
                .stream().collect(Collectors.toMap(MaterialInfo::getId, MaterialInfo::getMaterialName));
        return warnRuleList.stream().map(rule -> {
            WarnRuleVO warnRuleVO = new WarnRuleVO();
            BeanUtils.copyProperties(rule, warnRuleVO);
            warnRuleVO.setRuleTypeText(rule.getRuleType() == WarnConstant.TYPE_STOCK_LOW ? "库存预警" : "临期预警");
            if (rule.getMaterialId() != null) {
                warnRuleVO.setMaterialName(materialNameMap.getOrDefault(rule.getMaterialId(), "-"));
            } else {
                warnRuleVO.setMaterialName("全局");
            }
            return warnRuleVO;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveWarnRule(WarnRuleSaveRequest warnRuleSaveRequest, User loginUser) {
        if (warnRuleSaveRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Integer ruleType = warnRuleSaveRequest.getRuleType();
        if (ruleType == null || (ruleType != WarnConstant.TYPE_STOCK_LOW && ruleType != WarnConstant.TYPE_EXPIRE_NEAR)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "规则类型错误");
        }
        Integer thresholdValue = warnRuleSaveRequest.getThresholdValue();
        if (thresholdValue == null || thresholdValue < 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "阈值必须大于等于 0");
        }
        Long materialId = warnRuleSaveRequest.getMaterialId();
        if (materialId != null && materialId > 0) {
            MaterialInfo materialInfo = materialInfoMapper.selectById(materialId);
            if (materialInfo == null) {
                throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "物资不存在");
            }
        }
        Integer isEnabled = warnRuleSaveRequest.getIsEnabled();
        if (isEnabled == null) {
            isEnabled = WarnConstant.ENABLED;
        }
        WarnRule warnRule;
        Date now = new Date();
        if (warnRuleSaveRequest.getId() != null && warnRuleSaveRequest.getId() > 0) {
            warnRule = warnRuleMapper.selectById(warnRuleSaveRequest.getId());
            if (warnRule == null) {
                throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "规则不存在");
            }
            warnRule.setUpdateBy(loginUser.getId());
        } else {
            warnRule = new WarnRule();
            warnRule.setCreateBy(loginUser.getId());
            warnRule.setCreateTime(now);
            warnRule.setUpdateBy(loginUser.getId());
        }
        String defaultRuleName = (ruleType == WarnConstant.TYPE_STOCK_LOW ? "库存预警规则" : "临期预警规则")
                + (materialId == null ? "(全局)" : "(物资)");
        warnRule.setRuleName(StringUtils.defaultIfBlank(warnRuleSaveRequest.getRuleName(), defaultRuleName));
        warnRule.setRuleType(ruleType);
        warnRule.setMaterialId(materialId);
        warnRule.setThresholdValue(thresholdValue);
        warnRule.setIsEnabled(isEnabled);
        warnRule.setUpdateTime(now);
        boolean success;
        if (warnRule.getId() == null) {
            success = warnRuleMapper.insert(warnRule) > 0;
        } else {
            success = warnRuleMapper.updateById(warnRule) > 0;
        }
        if (!success) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "保存规则失败");
        }
        syncWarnRecordsByRules();
        return warnRule.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean markWarnHandled(Long warnRecordId, User loginUser) {
        if (warnRecordId == null || warnRecordId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        WarnRecord warnRecord = warnRecordMapper.selectById(warnRecordId);
        if (warnRecord == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "预警记录不存在");
        }
        if (warnRecord.getHandled() != null && warnRecord.getHandled() == WarnConstant.HANDLED) {
            return true;
        }
        warnRecord.setHandled(WarnConstant.HANDLED);
        warnRecord.setHandledBy(loginUser.getId());
        warnRecord.setHandledTime(new Date());
        return warnRecordMapper.updateById(warnRecord) > 0;
    }

    @Override
    public void syncWarnRecordsByRules() {
        QueryWrapper<WarnRule> ruleQueryWrapper = new QueryWrapper<>();
        ruleQueryWrapper.eq("isEnabled", WarnConstant.ENABLED);
        List<WarnRule> warnRuleList = warnRuleMapper.selectList(ruleQueryWrapper);
        if (warnRuleList == null || warnRuleList.isEmpty()) {
            return;
        }
        List<MaterialInfo> allMaterialList = materialInfoMapper.selectList(new QueryWrapper<>());
        if (allMaterialList == null || allMaterialList.isEmpty()) {
            return;
        }
        Map<Long, MaterialInfo> materialMap = allMaterialList.stream().collect(Collectors.toMap(MaterialInfo::getId, item -> item));
        QueryWrapper<InventoryInfo> inventoryQueryWrapper = new QueryWrapper<>();
        inventoryQueryWrapper.in("materialId", materialMap.keySet());
        List<InventoryInfo> inventoryInfoList = inventoryInfoMapper.selectList(inventoryQueryWrapper);
        Map<Long, Integer> materialStockMap = new HashMap<>();
        for (InventoryInfo inventoryInfo : inventoryInfoList) {
            Integer stock = inventoryInfo.getCurrentStock() == null ? 0 : inventoryInfo.getCurrentStock();
            materialStockMap.merge(inventoryInfo.getMaterialId(), stock, Integer::sum);
        }
        Date now = new Date();
        for (WarnRule rule : warnRuleList) {
            List<MaterialInfo> targetMaterialList = selectTargetMaterial(rule, materialMap);
            for (MaterialInfo materialInfo : targetMaterialList) {
                if (rule.getRuleType() == WarnConstant.TYPE_STOCK_LOW) {
                    int currentStock = materialStockMap.getOrDefault(materialInfo.getId(), 0);
                    if (currentStock <= rule.getThresholdValue()) {
                        String content = String.format("物资【%s】库存为 %d，低于/达到阈值 %d",
                                materialInfo.getMaterialName(), currentStock, rule.getThresholdValue());
                        upsertWarnRecordAndNotice(rule, materialInfo.getId(), WarnConstant.TYPE_STOCK_LOW, currentStock,
                                rule.getThresholdValue(), content, now);
                    }
                } else if (rule.getRuleType() == WarnConstant.TYPE_EXPIRE_NEAR && materialInfo.getExpireDate() != null) {
                    int leftDays = (int) ((materialInfo.getExpireDate().getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                    if (leftDays <= rule.getThresholdValue()) {
                        String content = String.format("物资【%s】距离过期仅剩 %d 天，阈值 %d 天",
                                materialInfo.getMaterialName(), leftDays, rule.getThresholdValue());
                        upsertWarnRecordAndNotice(rule, materialInfo.getId(), WarnConstant.TYPE_EXPIRE_NEAR, leftDays,
                                rule.getThresholdValue(), content, now);
                    }
                }
            }
        }
    }

    @Override
    public void syncStockWarnForMaterial(Long materialId, Integer currentStock) {
        if (materialId == null || materialId <= 0 || currentStock == null) {
            return;
        }
        MaterialInfo materialInfo = materialInfoMapper.selectById(materialId);
        if (materialInfo == null) {
            return;
        }
        QueryWrapper<WarnRule> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("isEnabled", WarnConstant.ENABLED);
        queryWrapper.eq("ruleType", WarnConstant.TYPE_STOCK_LOW);
        queryWrapper.and(wrapper -> wrapper.eq("materialId", materialId).or().isNull("materialId"));
        List<WarnRule> warnRuleList = warnRuleMapper.selectList(queryWrapper);
        Date now = new Date();
        for (WarnRule warnRule : warnRuleList) {
            if (currentStock <= warnRule.getThresholdValue()) {
                String content = String.format("物资【%s】库存为 %d，低于/达到阈值 %d",
                        materialInfo.getMaterialName(), currentStock, warnRule.getThresholdValue());
                upsertWarnRecordAndNotice(warnRule, materialId, WarnConstant.TYPE_STOCK_LOW, currentStock,
                        warnRule.getThresholdValue(), content, now);
            }
        }
    }

    private List<MaterialInfo> selectTargetMaterial(WarnRule rule, Map<Long, MaterialInfo> materialMap) {
        if (rule.getMaterialId() != null) {
            MaterialInfo materialInfo = materialMap.get(rule.getMaterialId());
            if (materialInfo == null) {
                return new ArrayList<>();
            }
            List<MaterialInfo> singleList = new ArrayList<>();
            singleList.add(materialInfo);
            return singleList;
        }
        return new ArrayList<>(materialMap.values());
    }

    private void upsertWarnRecordAndNotice(WarnRule rule, Long materialId, Integer warnType, Integer currentValue,
            Integer thresholdValue, String content, Date now) {
        QueryWrapper<WarnRecord> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("ruleId", rule.getId());
        queryWrapper.eq("materialId", materialId);
        queryWrapper.eq("warnType", warnType);
        queryWrapper.eq("handled", WarnConstant.UNHANDLED);
        queryWrapper.orderByDesc("createTime");
        queryWrapper.last("limit 1");
        WarnRecord existing = warnRecordMapper.selectOne(queryWrapper);
        if (existing != null) {
            existing.setCurrentValue(currentValue);
            existing.setThresholdValue(thresholdValue);
            existing.setContent(content);
            existing.setUpdateTime(now);
            warnRecordMapper.updateById(existing);
            return;
        }
        WarnRecord warnRecord = new WarnRecord();
        warnRecord.setRuleId(rule.getId());
        warnRecord.setMaterialId(materialId);
        warnRecord.setWarnType(warnType);
        warnRecord.setCurrentValue(currentValue);
        warnRecord.setThresholdValue(thresholdValue);
        warnRecord.setContent(content);
        warnRecord.setHandled(WarnConstant.UNHANDLED);
        warnRecord.setCreateTime(now);
        warnRecord.setUpdateTime(now);
        boolean inserted = warnRecordMapper.insert(warnRecord) > 0;
        if (inserted) {
            createWarnNoticeForAdmins(warnRecord.getId(), content);
        }
    }

    private void createWarnNoticeForAdmins(Long warnRecordId, String content) {
        QueryWrapper<User> adminQueryWrapper = new QueryWrapper<>();
        adminQueryWrapper.eq("userRole", UserConstant.ADMIN_ROLE);
        List<User> adminList = userService.list(adminQueryWrapper);
        if (adminList == null || adminList.isEmpty()) {
            return;
        }
        for (User admin : adminList) {
            Notice notice = new Notice();
            notice.setUserId(admin.getId());
            notice.setTitle("库存/临期预警");
            notice.setContent(content);
            notice.setNoticeType(NoticeConstant.TYPE_WARN);
            notice.setRefId(warnRecordId);
            notice.setRefType(NoticeConstant.REF_TYPE_WARN);
            notice.setIsRead(NoticeConstant.UNREAD);
            noticeMapper.insert(notice);
        }
    }
}
