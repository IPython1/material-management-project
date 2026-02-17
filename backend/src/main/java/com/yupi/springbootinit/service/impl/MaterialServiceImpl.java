package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.constant.CommonConstant;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.mapper.InventoryInfoMapper;
import com.yupi.springbootinit.mapper.MaterialInfoMapper;
import com.yupi.springbootinit.model.dto.material.MaterialQueryRequest;
import com.yupi.springbootinit.model.dto.material.MaterialSaveRequest;
import com.yupi.springbootinit.model.entity.InventoryInfo;
import com.yupi.springbootinit.model.entity.MaterialInfo;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.MaterialVO;
import com.yupi.springbootinit.service.MaterialService;
import com.yupi.springbootinit.service.WarnService;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

/**
 * 物资管理服务实现
 */
@Service
public class MaterialServiceImpl implements MaterialService {

    @Resource
    private MaterialInfoMapper materialInfoMapper;

    @Resource
    private InventoryInfoMapper inventoryInfoMapper;

    @Resource
    private WarnService warnService;

    @Override
    public Page<MaterialVO> listMaterial(MaterialQueryRequest materialQueryRequest) {
        MaterialQueryRequest query = materialQueryRequest == null ? new MaterialQueryRequest() : materialQueryRequest;
        QueryWrapper<MaterialInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.like(StringUtils.isNotBlank(query.getMaterialName()), "materialName", query.getMaterialName());
        queryWrapper.eq(StringUtils.isNotBlank(query.getCategory()), "category", query.getCategory());
        queryWrapper.eq(query.getStatus() != null, "status", query.getStatus());
        String sortField = query.getSortField();
        String sortOrder = query.getSortOrder();
        if (StringUtils.isNotBlank(sortField) && isValidMaterialSortField(sortField)) {
            boolean isAsc = CommonConstant.SORT_ORDER_ASC.equals(sortOrder);
            queryWrapper.orderBy(true, isAsc, sortField);
        } else {
            queryWrapper.orderByDesc("updateTime");
        }
        Page<MaterialInfo> entityPage = materialInfoMapper.selectPage(
                new Page<>(query.getCurrent(), query.getPageSize()), queryWrapper);
        Page<MaterialVO> voPage = new Page<>(entityPage.getCurrent(), entityPage.getSize(), entityPage.getTotal());
        List<MaterialInfo> records = entityPage.getRecords();
        if (records == null || records.isEmpty()) {
            voPage.setRecords(new ArrayList<>());
            return voPage;
        }
        Set<Long> materialIdSet = records.stream().map(MaterialInfo::getId).collect(Collectors.toSet());
        Map<Long, Integer> warnThresholdMap = new HashMap<>();
        if (!materialIdSet.isEmpty()) {
            QueryWrapper<InventoryInfo> inventoryQueryWrapper = new QueryWrapper<>();
            inventoryQueryWrapper.in("materialId", materialIdSet);
            List<InventoryInfo> inventoryInfoList = inventoryInfoMapper.selectList(inventoryQueryWrapper);
            for (InventoryInfo inventoryInfo : inventoryInfoList) {
                Long materialId = inventoryInfo.getMaterialId();
                if (materialId == null) {
                    continue;
                }
                if (!warnThresholdMap.containsKey(materialId) && inventoryInfo.getWarnThreshold() != null) {
                    warnThresholdMap.put(materialId, inventoryInfo.getWarnThreshold());
                }
            }
        }
        List<MaterialVO> voList = new ArrayList<>();
        for (MaterialInfo materialInfo : records) {
            MaterialVO vo = new MaterialVO();
            BeanUtils.copyProperties(materialInfo, vo);
            vo.setWarnThreshold(warnThresholdMap.getOrDefault(materialInfo.getId(), 0));
            voList.add(vo);
        }
        voPage.setRecords(voList);
        return voPage;
    }

    private boolean isValidMaterialSortField(String sortField) {
        return "id".equals(sortField)
                || "materialName".equals(sortField)
                || "category".equals(sortField)
                || "stockTotal".equals(sortField)
                || "status".equals(sortField)
                || "createTime".equals(sortField)
                || "updateTime".equals(sortField);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveMaterial(MaterialSaveRequest materialSaveRequest, User loginUser) {
        if (materialSaveRequest == null || loginUser == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        if (StringUtils.isBlank(materialSaveRequest.getMaterialName())) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "物资名称不能为空");
        }
        Integer status = materialSaveRequest.getStatus();
        if (status != null && status != 0 && status != 1) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "状态不合法");
        }
        Long id = materialSaveRequest.getId();
        Date now = new Date();
        if (id == null) {
            // 新增
            MaterialInfo materialInfo = new MaterialInfo();
            BeanUtils.copyProperties(materialSaveRequest, materialInfo);
            materialInfo.setCreateBy(loginUser.getId());
            materialInfo.setCreateTime(now);
            materialInfo.setUpdateBy(loginUser.getId());
            materialInfo.setUpdateTime(now);
            materialInfo.setStockTotal(0);
            if (materialInfo.getStatus() == null) {
                materialInfo.setStatus(1);
            }
            int inserted = materialInfoMapper.insert(materialInfo);
            if (inserted <= 0) {
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "新增物资失败");
            }
            // 为新物资创建一条初始库存记录，方便后续审批和报表
            InventoryInfo inventoryInfo = new InventoryInfo();
            inventoryInfo.setMaterialId(materialInfo.getId());
            inventoryInfo.setLocation(materialInfo.getLocation());
            inventoryInfo.setCurrentStock(0);
            inventoryInfo.setWarnThreshold(0);
            inventoryInfo.setCreateTime(now);
            inventoryInfo.setUpdateTime(now);
            inventoryInfoMapper.insert(inventoryInfo);
            // 同步预警
            warnService.syncStockWarnForMaterial(materialInfo.getId(), 0);
            return materialInfo.getId();
        } else {
            // 编辑
            MaterialInfo old = materialInfoMapper.selectById(id);
            if (old == null) {
                throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "物资不存在");
            }
            MaterialInfo update = new MaterialInfo();
            BeanUtils.copyProperties(materialSaveRequest, update);
            update.setId(id);
            update.setUpdateBy(loginUser.getId());
            update.setUpdateTime(now);
            int updated = materialInfoMapper.updateById(update);
            if (updated <= 0) {
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "更新物资失败");
            }
            return id;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteMaterial(Long id, User loginUser) {
        if (id == null || id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        MaterialInfo materialInfo = materialInfoMapper.selectById(id);
        if (materialInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "物资不存在");
        }
        // 逻辑删除物资
        int deleted = materialInfoMapper.deleteById(id);
        // 同时逻辑删除对应库存记录
        QueryWrapper<InventoryInfo> inventoryQueryWrapper = new QueryWrapper<>();
        inventoryQueryWrapper.eq("materialId", id);
        inventoryInfoMapper.delete(inventoryQueryWrapper);
        // 同步预警（删除后视为库存为 0）
        warnService.syncStockWarnForMaterial(id, 0);
        return deleted > 0;
    }

    @Override
    public MaterialVO getMaterialDetail(Long id) {
        if (id == null || id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        MaterialInfo materialInfo = materialInfoMapper.selectById(id);
        if (materialInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "物资不存在");
        }
        QueryWrapper<InventoryInfo> inventoryQueryWrapper = new QueryWrapper<>();
        inventoryQueryWrapper.eq("materialId", id);
        List<InventoryInfo> inventoryInfoList = inventoryInfoMapper.selectList(inventoryQueryWrapper);
        Integer warnThreshold = inventoryInfoList.stream()
                .map(InventoryInfo::getWarnThreshold)
                .filter(value -> value != null)
                .findFirst()
                .orElse(0);
        MaterialVO vo = new MaterialVO();
        BeanUtils.copyProperties(materialInfo, vo);
        vo.setWarnThreshold(warnThreshold);
        return vo;
    }
}

