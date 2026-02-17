package com.yupi.springbootinit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yupi.springbootinit.common.ErrorCode;
import com.yupi.springbootinit.constant.ApprovalConstant;
import com.yupi.springbootinit.constant.CommonConstant;
import com.yupi.springbootinit.constant.NoticeConstant;
import com.yupi.springbootinit.constant.UserConstant;
import com.yupi.springbootinit.exception.BusinessException;
import com.yupi.springbootinit.mapper.InventoryApprovalMapper;
import com.yupi.springbootinit.mapper.InventoryInfoMapper;
import com.yupi.springbootinit.mapper.MaterialInfoMapper;
import com.yupi.springbootinit.mapper.NoticeMapper;
import com.yupi.springbootinit.mapper.StockFlowMapper;
import com.yupi.springbootinit.model.entity.StockFlow;
import com.yupi.springbootinit.model.dto.apply.ApplyAddRequest;
import com.yupi.springbootinit.model.dto.apply.ApplyQueryRequest;
import com.yupi.springbootinit.model.entity.InventoryApproval;
import com.yupi.springbootinit.model.entity.InventoryInfo;
import com.yupi.springbootinit.model.entity.MaterialInfo;
import com.yupi.springbootinit.model.entity.Notice;
import com.yupi.springbootinit.model.entity.User;
import com.yupi.springbootinit.model.vo.ApplyDetailVO;
import com.yupi.springbootinit.model.vo.ApplyTimelineItemVO;
import com.yupi.springbootinit.model.vo.ApplyVO;
import com.yupi.springbootinit.service.ApplyService;
import com.yupi.springbootinit.service.UserService;
import com.yupi.springbootinit.service.WarnService;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 审批服务实现
 */
@Service
public class ApplyServiceImpl implements ApplyService {

    private static final Random RANDOM = new Random();

    @Resource
    private InventoryApprovalMapper inventoryApprovalMapper;

    @Resource
    private InventoryInfoMapper inventoryInfoMapper;

    @Resource
    private MaterialInfoMapper materialInfoMapper;

    @Resource
    private NoticeMapper noticeMapper;

    @Resource
    private UserService userService;

    @Resource
    private WarnService warnService;

    @Resource
    private StockFlowMapper stockFlowMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createApply(ApplyAddRequest applyAddRequest, User loginUser) {
        if (applyAddRequest == null || loginUser == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Long materialId = applyAddRequest.getMaterialId();
        Integer quantity = applyAddRequest.getQuantity();
        if (materialId == null || materialId <= 0 || quantity == null || quantity <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "物资或数量不合法");
        }
        MaterialInfo materialInfo = materialInfoMapper.selectById(materialId);
        if (materialInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "物资不存在");
        }
        InventoryApproval inventoryApproval = new InventoryApproval();
        inventoryApproval.setApprovalNo(generateApprovalNo());
        inventoryApproval.setMaterialId(materialId);
        inventoryApproval.setQuantity(quantity);
        inventoryApproval.setPurpose(applyAddRequest.getPurpose());
        inventoryApproval.setApplicantId(loginUser.getId());
        inventoryApproval.setApplyTime(new Date());
        inventoryApproval.setStatus(ApprovalConstant.STATUS_PENDING);
        boolean insert = inventoryApprovalMapper.insert(inventoryApproval) > 0;
        if (!insert) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "提交申请失败");
        }
        createPendingApprovalNotice(inventoryApproval, materialInfo);
        return inventoryApproval.getId();
    }

    @Override
    public Page<ApplyVO> listMyApply(ApplyQueryRequest applyQueryRequest, User loginUser) {
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        ApplyQueryRequest queryRequest = applyQueryRequest == null ? new ApplyQueryRequest() : applyQueryRequest;
        QueryWrapper<InventoryApproval> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("applicantId", loginUser.getId());
        queryWrapper.eq(queryRequest.getStatus() != null, "status", queryRequest.getStatus());
        if (StringUtils.isNotBlank(queryRequest.getApprovalNo())) {
            queryWrapper.like("approvalNo", queryRequest.getApprovalNo());
        }
        if (StringUtils.isNotBlank(queryRequest.getMaterialName())) {
            QueryWrapper<MaterialInfo> materialQueryWrapper = new QueryWrapper<>();
            materialQueryWrapper.like("materialName", queryRequest.getMaterialName());
            List<MaterialInfo> materialInfoList = materialInfoMapper.selectList(materialQueryWrapper);
            if (materialInfoList == null || materialInfoList.isEmpty()) {
                return new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize(), 0);
            }
            queryWrapper.in("materialId", materialInfoList.stream().map(MaterialInfo::getId).collect(Collectors.toSet()));
        }
        String sortField = queryRequest.getSortField();
        String sortOrder = queryRequest.getSortOrder();
        if (StringUtils.isNotBlank(sortField) && isValidApplySortField(sortField)) {
            boolean isAsc = CommonConstant.SORT_ORDER_ASC.equals(sortOrder);
            queryWrapper.orderBy(true, isAsc, sortField);
        } else {
            queryWrapper.orderByDesc("applyTime");
        }
        Page<InventoryApproval> approvalPage = inventoryApprovalMapper.selectPage(
                new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize()),
                queryWrapper);
        return buildApplyVoPage(approvalPage);
    }

    @Override
    public Page<ApplyVO> listPendingApply(ApplyQueryRequest applyQueryRequest) {
        ApplyQueryRequest queryRequest = applyQueryRequest == null ? new ApplyQueryRequest() : applyQueryRequest;
        QueryWrapper<InventoryApproval> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("status", queryRequest.getStatus() == null ? ApprovalConstant.STATUS_PENDING : queryRequest.getStatus());
        if (StringUtils.isNotBlank(queryRequest.getApprovalNo())) {
            queryWrapper.like("approvalNo", queryRequest.getApprovalNo());
        }
        if (StringUtils.isNotBlank(queryRequest.getMaterialName())) {
            QueryWrapper<MaterialInfo> materialQueryWrapper = new QueryWrapper<>();
            materialQueryWrapper.like("materialName", queryRequest.getMaterialName());
            List<MaterialInfo> materialInfoList = materialInfoMapper.selectList(materialQueryWrapper);
            if (materialInfoList == null || materialInfoList.isEmpty()) {
                return new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize(), 0);
            }
            queryWrapper.in("materialId", materialInfoList.stream().map(MaterialInfo::getId).collect(Collectors.toSet()));
        }
        String sortField = queryRequest.getSortField();
        String sortOrder = queryRequest.getSortOrder();
        if (StringUtils.isNotBlank(sortField) && isValidApplySortField(sortField)) {
            boolean isAsc = CommonConstant.SORT_ORDER_ASC.equals(sortOrder);
            queryWrapper.orderBy(true, isAsc, sortField);
        } else {
            queryWrapper.orderByAsc("applyTime");
        }
        Page<InventoryApproval> approvalPage = inventoryApprovalMapper.selectPage(
                new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize()),
                queryWrapper);
        return buildApplyVoPage(approvalPage);
    }

    @Override
    public Page<ApplyVO> listHistoryApply(ApplyQueryRequest applyQueryRequest) {
        ApplyQueryRequest queryRequest = applyQueryRequest == null ? new ApplyQueryRequest() : applyQueryRequest;
        QueryWrapper<InventoryApproval> queryWrapper = new QueryWrapper<>();
        if (queryRequest.getStatus() == null) {
            queryWrapper.ne("status", ApprovalConstant.STATUS_PENDING);
        } else {
            queryWrapper.eq("status", queryRequest.getStatus());
        }
        if (StringUtils.isNotBlank(queryRequest.getApprovalNo())) {
            queryWrapper.like("approvalNo", queryRequest.getApprovalNo());
        }
        if (StringUtils.isNotBlank(queryRequest.getMaterialName())) {
            QueryWrapper<MaterialInfo> materialQueryWrapper = new QueryWrapper<>();
            materialQueryWrapper.like("materialName", queryRequest.getMaterialName());
            List<MaterialInfo> materialInfoList = materialInfoMapper.selectList(materialQueryWrapper);
            if (materialInfoList == null || materialInfoList.isEmpty()) {
                return new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize(), 0);
            }
            queryWrapper.in("materialId", materialInfoList.stream().map(MaterialInfo::getId).collect(Collectors.toSet()));
        }
        String sortField = queryRequest.getSortField();
        String sortOrder = queryRequest.getSortOrder();
        if (StringUtils.isNotBlank(sortField) && isValidApplySortField(sortField)) {
            boolean isAsc = CommonConstant.SORT_ORDER_ASC.equals(sortOrder);
            queryWrapper.orderBy(true, isAsc, sortField);
        } else {
            queryWrapper.orderByDesc("approveTime");
            queryWrapper.orderByDesc("applyTime");
        }
        Page<InventoryApproval> approvalPage = inventoryApprovalMapper.selectPage(
                new Page<>(queryRequest.getCurrent(), queryRequest.getPageSize()),
                queryWrapper);
        return buildApplyVoPage(approvalPage);
    }

    private boolean isValidApplySortField(String sortField) {
        return "applyTime".equals(sortField)
                || "approveTime".equals(sortField)
                || "quantity".equals(sortField)
                || "status".equals(sortField)
                || "approvalNo".equals(sortField);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean approveApply(Long applyId, String approveRemark, User adminUser) {
        InventoryApproval inventoryApproval = getPendingApproval(applyId);
        InventoryInfo inventoryInfo = getInventoryByMaterialId(inventoryApproval.getMaterialId());
        Integer quantity = inventoryApproval.getQuantity();
        LambdaUpdateWrapper<InventoryInfo> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(InventoryInfo::getId, inventoryInfo.getId());
        updateWrapper.ge(InventoryInfo::getCurrentStock, quantity);
        updateWrapper.setSql("currentStock = currentStock - " + quantity);
        int updated = inventoryInfoMapper.update(null, updateWrapper);
        if (updated <= 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "库存不足，审批失败");
        }

        Date now = new Date();
        inventoryApproval.setStatus(ApprovalConstant.STATUS_OUTBOUND);
        inventoryApproval.setApproveId(adminUser.getId());
        inventoryApproval.setApproveTime(now);
        inventoryApproval.setOutTime(now);
        inventoryApproval.setApproveRemark(approveRemark);
        if (inventoryApprovalMapper.updateById(inventoryApproval) <= 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "审批状态更新失败");
        }

        updateMaterialTotalStock(inventoryApproval.getMaterialId());
        saveApprovalResultNotice(inventoryApproval, true);
        InventoryInfo latestInventory = inventoryInfoMapper.selectById(inventoryInfo.getId());
        int afterStock = latestInventory == null ? 0 : (latestInventory.getCurrentStock() == null ? 0 : latestInventory.getCurrentStock());

        // 记录审批出库流水
        StockFlow stockFlow = new StockFlow();
        stockFlow.setMaterialId(inventoryApproval.getMaterialId());
        stockFlow.setFlowType("APPLY_OUT");
        stockFlow.setQuantity(quantity);
        stockFlow.setBeforeStock(afterStock + quantity);
        stockFlow.setAfterStock(afterStock);
        stockFlow.setOperatorId(adminUser.getId());
        stockFlow.setRelatedApprovalNo(inventoryApproval.getApprovalNo());
        stockFlow.setRemark("审批出库: " + inventoryApproval.getApprovalNo());
        stockFlow.setCreateTime(now);
        stockFlowMapper.insert(stockFlow);

        warnService.syncStockWarnForMaterial(inventoryApproval.getMaterialId(),
                latestInventory == null ? null : latestInventory.getCurrentStock());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean rejectApply(Long applyId, String approveRemark, User adminUser) {
        if (StringUtils.isBlank(approveRemark)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "驳回时请填写审批意见");
        }
        InventoryApproval inventoryApproval = getPendingApproval(applyId);
        inventoryApproval.setStatus(ApprovalConstant.STATUS_REJECTED);
        inventoryApproval.setApproveId(adminUser.getId());
        inventoryApproval.setApproveTime(new Date());
        inventoryApproval.setApproveRemark(approveRemark);
        boolean updated = inventoryApprovalMapper.updateById(inventoryApproval) > 0;
        if (!updated) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "驳回失败");
        }
        saveApprovalResultNotice(inventoryApproval, false);
        return true;
    }

    @Override
    public ApplyDetailVO getApplyDetail(Long applyId, User loginUser) {
        if (applyId == null || applyId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        InventoryApproval inventoryApproval = inventoryApprovalMapper.selectById(applyId);
        if (inventoryApproval == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "申请不存在");
        }
        boolean isAdmin = userService.isAdmin(loginUser);
        if (!isAdmin && !inventoryApproval.getApplicantId().equals(loginUser.getId())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        ApplyDetailVO applyDetailVO = new ApplyDetailVO();
        BeanUtils.copyProperties(toApplyVO(inventoryApproval), applyDetailVO);
        applyDetailVO.setTimeline(buildTimeline(inventoryApproval));
        return applyDetailVO;
    }

    private InventoryApproval getPendingApproval(Long applyId) {
        if (applyId == null || applyId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        InventoryApproval inventoryApproval = inventoryApprovalMapper.selectById(applyId);
        if (inventoryApproval == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "申请不存在");
        }
        if (!STATUS_PENDINGEquals(inventoryApproval.getStatus())) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "该申请已处理，无法重复审批");
        }
        return inventoryApproval;
    }

    private InventoryInfo getInventoryByMaterialId(Long materialId) {
        QueryWrapper<InventoryInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("materialId", materialId);
        queryWrapper.orderByAsc("id");
        queryWrapper.last("limit 1");
        InventoryInfo inventoryInfo = inventoryInfoMapper.selectOne(queryWrapper);
        if (inventoryInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "未找到对应库存记录");
        }
        return inventoryInfo;
    }

    private void updateMaterialTotalStock(Long materialId) {
        QueryWrapper<InventoryInfo> inventoryQueryWrapper = new QueryWrapper<>();
        inventoryQueryWrapper.eq("materialId", materialId);
        List<InventoryInfo> inventoryInfoList = inventoryInfoMapper.selectList(inventoryQueryWrapper);
        int totalStock = inventoryInfoList.stream()
                .map(InventoryInfo::getCurrentStock)
                .filter(stock -> stock != null && stock > 0)
                .reduce(0, Integer::sum);
        MaterialInfo materialInfo = materialInfoMapper.selectById(materialId);
        if (materialInfo != null) {
            materialInfo.setStockTotal(totalStock);
            materialInfoMapper.updateById(materialInfo);
        }
    }

    private void saveApprovalResultNotice(InventoryApproval approval, boolean approved) {
        Notice notice = new Notice();
        notice.setUserId(approval.getApplicantId());
        notice.setTitle(approved ? "审批已通过" : "审批已驳回");
        notice.setContent(String.format("申请单 %s %s", approval.getApprovalNo(), approved ? "已通过并完成出库" : "已被驳回"));
        notice.setNoticeType(NoticeConstant.TYPE_APPROVAL_RESULT);
        notice.setRefId(approval.getId());
        notice.setRefType(NoticeConstant.REF_TYPE_APPROVAL);
        notice.setIsRead(NoticeConstant.UNREAD);
        noticeMapper.insert(notice);
    }

    private void createPendingApprovalNotice(InventoryApproval approval, MaterialInfo materialInfo) {
        QueryWrapper<User> userQueryWrapper = new QueryWrapper<>();
        userQueryWrapper.eq("userRole", UserConstant.ADMIN_ROLE);
        userQueryWrapper.eq("userStatus", 1);
        List<User> adminList = userService.list(userQueryWrapper);
        if (adminList == null || adminList.isEmpty()) {
            return;
        }
        String content = String.format("物资【%s】申请数量 %d", materialInfo.getMaterialName(), approval.getQuantity());
        for (User admin : adminList) {
            Notice notice = new Notice();
            notice.setUserId(admin.getId());
            notice.setTitle("待审批申请");
            notice.setContent(content);
            notice.setNoticeType(NoticeConstant.TYPE_APPROVAL_RESULT);
            notice.setRefId(approval.getId());
            notice.setRefType(NoticeConstant.REF_TYPE_APPROVAL);
            notice.setIsRead(NoticeConstant.UNREAD);
            noticeMapper.insert(notice);
        }
    }

    private Page<ApplyVO> buildApplyVoPage(Page<InventoryApproval> entityPage) {
        Page<ApplyVO> voPage = new Page<>(entityPage.getCurrent(), entityPage.getSize(), entityPage.getTotal());
        if (entityPage.getRecords() == null || entityPage.getRecords().isEmpty()) {
            voPage.setRecords(new ArrayList<>());
            return voPage;
        }
        List<ApplyVO> applyVOList = buildApplyVOList(entityPage.getRecords());
        voPage.setRecords(applyVOList);
        return voPage;
    }

    private List<ApplyVO> buildApplyVOList(List<InventoryApproval> approvalList) {
        Set<Long> materialIdSet = approvalList.stream().map(InventoryApproval::getMaterialId).collect(Collectors.toSet());
        Set<Long> userIdSet = new HashSet<>();
        approvalList.forEach(approval -> {
            userIdSet.add(approval.getApplicantId());
            if (approval.getApproveId() != null) {
                userIdSet.add(approval.getApproveId());
            }
        });
        Map<Long, String> materialNameMap = getMaterialNameMap(materialIdSet);
        Map<Long, String> userNameMap = getUserNameMap(userIdSet);
        return approvalList.stream().map(approval -> toApplyVO(approval, materialNameMap, userNameMap)).collect(Collectors.toList());
    }

    private ApplyVO toApplyVO(InventoryApproval approval) {
        Set<Long> materialIdSet = new HashSet<>();
        materialIdSet.add(approval.getMaterialId());
        Set<Long> userIdSet = new HashSet<>();
        userIdSet.add(approval.getApplicantId());
        if (approval.getApproveId() != null) {
            userIdSet.add(approval.getApproveId());
        }
        return toApplyVO(approval, getMaterialNameMap(materialIdSet), getUserNameMap(userIdSet));
    }

    private ApplyVO toApplyVO(InventoryApproval approval, Map<Long, String> materialNameMap, Map<Long, String> userNameMap) {
        ApplyVO applyVO = new ApplyVO();
        BeanUtils.copyProperties(approval, applyVO);
        applyVO.setMaterialName(materialNameMap.getOrDefault(approval.getMaterialId(), "-"));
        applyVO.setApplicantName(userNameMap.getOrDefault(approval.getApplicantId(), "-"));
        if (approval.getApproveId() != null) {
            applyVO.setApproveName(userNameMap.getOrDefault(approval.getApproveId(), "-"));
        }
        return applyVO;
    }

    private Map<Long, String> getMaterialNameMap(Set<Long> materialIdSet) {
        if (materialIdSet == null || materialIdSet.isEmpty()) {
            return new HashMap<>();
        }
        return materialInfoMapper.selectBatchIds(materialIdSet).stream()
                .collect(Collectors.toMap(MaterialInfo::getId, material -> StringUtils.defaultIfBlank(material.getMaterialName(), "-")));
    }

    private Map<Long, String> getUserNameMap(Set<Long> userIdSet) {
        if (userIdSet == null || userIdSet.isEmpty()) {
            return new HashMap<>();
        }
        return userService.listByIds(userIdSet).stream()
                .collect(Collectors.toMap(User::getId, user -> StringUtils.defaultIfBlank(user.getUserName(), user.getUserAccount())));
    }

    private List<ApplyTimelineItemVO> buildTimeline(InventoryApproval approval) {
        List<ApplyTimelineItemVO> timeline = new ArrayList<>();
        Set<Long> userIdSet = new HashSet<>();
        userIdSet.add(approval.getApplicantId());
        if (approval.getApproveId() != null) {
            userIdSet.add(approval.getApproveId());
        }
        Map<Long, String> userNameMap = getUserNameMap(userIdSet);

        ApplyTimelineItemVO submitNode = new ApplyTimelineItemVO();
        submitNode.setNodeName("提交申请");
        submitNode.setOperatorName(userNameMap.getOrDefault(approval.getApplicantId(), "-"));
        submitNode.setActionTime(approval.getApplyTime());
        submitNode.setRemark(approval.getPurpose());
        timeline.add(submitNode);

        if (approval.getApproveTime() != null) {
            ApplyTimelineItemVO approveNode = new ApplyTimelineItemVO();
            approveNode.setNodeName(STATUS_REJECTEDEquals(approval.getStatus()) ? "审批驳回" : "审批通过");
            approveNode.setOperatorName(userNameMap.getOrDefault(approval.getApproveId(), "-"));
            approveNode.setActionTime(approval.getApproveTime());
            approveNode.setRemark(approval.getApproveRemark());
            timeline.add(approveNode);
        }

        if (approval.getOutTime() != null) {
            ApplyTimelineItemVO outNode = new ApplyTimelineItemVO();
            outNode.setNodeName("完成出库");
            outNode.setOperatorName(userNameMap.getOrDefault(approval.getApproveId(), "-"));
            outNode.setActionTime(approval.getOutTime());
            outNode.setRemark("库存已扣减");
            timeline.add(outNode);
        }
        return timeline;
    }

    private String generateApprovalNo() {
        String timePart = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        int randomPart = 1000 + RANDOM.nextInt(9000);
        return "AP" + timePart + randomPart;
    }

    private static boolean STATUS_PENDINGEquals(Integer status) {
        return status != null && status == ApprovalConstant.STATUS_PENDING;
    }

    private static boolean STATUS_REJECTEDEquals(Integer status) {
        return status != null && status == ApprovalConstant.STATUS_REJECTED;
    }
}
