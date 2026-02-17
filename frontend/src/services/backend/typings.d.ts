declare namespace API {
  type ApplyAddRequest = {
    materialId?: number;
    purpose?: string;
    quantity?: number;
  };

  type ApplyDecisionRequest = {
    approveRemark?: string;
  };

  type ApplyDetailVO = {
    applicantId?: number;
    applicantName?: string;
    applyTime?: string;
    approvalNo?: string;
    approveId?: number;
    approveName?: string;
    approveRemark?: string;
    approveTime?: string;
    id?: number;
    materialId?: number;
    materialName?: string;
    outTime?: string;
    purpose?: string;
    quantity?: number;
    status?: number;
    timeline?: ApplyTimelineItemVO[];
  };

  type ApplyTimelineItemVO = {
    actionTime?: string;
    nodeName?: string;
    operatorName?: string;
    remark?: string;
  };

  type ApplyVO = {
    applicantId?: number;
    applicantName?: string;
    applyTime?: string;
    approvalNo?: string;
    approveId?: number;
    approveName?: string;
    approveRemark?: string;
    approveTime?: string;
    id?: number;
    materialId?: number;
    materialName?: string;
    outTime?: string;
    purpose?: string;
    quantity?: number;
    status?: number;
  };

  type approveApplyUsingPOSTParams = {
    /** id */
    id: number;
  };

  type assignUserRoleUsingPUTParams = {
    /** id */
    id: number;
  };

  type BaseResponseApplyDetailVO_ = {
    code?: number;
    data?: ApplyDetailVO;
    message?: string;
  };

  type BaseResponseBoolean_ = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseDashboardStatVO_ = {
    code?: number;
    data?: DashboardStatVO;
    message?: string;
  };

  type BaseResponseInt_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseListDashboardPieItemVO_ = {
    code?: number;
    data?: DashboardPieItemVO[];
    message?: string;
  };

  type BaseResponseListDashboardTrendItemVO_ = {
    code?: number;
    data?: DashboardTrendItemVO[];
    message?: string;
  };

  type BaseResponseListString_ = {
    code?: number;
    data?: string[];
    message?: string;
  };

  type BaseResponseListWarnRuleVO_ = {
    code?: number;
    data?: WarnRuleVO[];
    message?: string;
  };

  type BaseResponseLoginUserVO_ = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponseLong_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseMaterialVO_ = {
    code?: number;
    data?: MaterialVO;
    message?: string;
  };

  type BaseResponsePageApplyVO_ = {
    code?: number;
    data?: PageApplyVO_;
    message?: string;
  };

  type BaseResponsePageMaterialVO_ = {
    code?: number;
    data?: PageMaterialVO_;
    message?: string;
  };

  type BaseResponsePageNoticeVO_ = {
    code?: number;
    data?: PageNoticeVO_;
    message?: string;
  };

  type BaseResponsePagePost_ = {
    code?: number;
    data?: PagePost_;
    message?: string;
  };

  type BaseResponsePagePostVO_ = {
    code?: number;
    data?: PagePostVO_;
    message?: string;
  };

  type BaseResponsePageReportFlowVO_ = {
    code?: number;
    data?: PageReportFlowVO_;
    message?: string;
  };

  type BaseResponsePageReportStockVO_ = {
    code?: number;
    data?: PageReportStockVO_;
    message?: string;
  };

  type BaseResponsePageReportTurnoverVO_ = {
    code?: number;
    data?: PageReportTurnoverVO_;
    message?: string;
  };

  type BaseResponsePageReportUsageVO_ = {
    code?: number;
    data?: PageReportUsageVO_;
    message?: string;
  };

  type BaseResponsePageUser_ = {
    code?: number;
    data?: PageUser_;
    message?: string;
  };

  type BaseResponsePageUserVO_ = {
    code?: number;
    data?: PageUserVO_;
    message?: string;
  };

  type BaseResponsePageWarnVO_ = {
    code?: number;
    data?: PageWarnVO_;
    message?: string;
  };

  type BaseResponsePostVO_ = {
    code?: number;
    data?: PostVO;
    message?: string;
  };

  type BaseResponseReportStockVO_ = {
    code?: number;
    data?: ReportStockVO;
    message?: string;
  };

  type BaseResponseString_ = {
    code?: number;
    data?: string;
    message?: string;
  };

  type BaseResponseUser_ = {
    code?: number;
    data?: User;
    message?: string;
  };

  type BaseResponseUserVO_ = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type checkUsingGETParams = {
    /** echostr */
    echostr?: string;
    /** nonce */
    nonce?: string;
    /** signature */
    signature?: string;
    /** timestamp */
    timestamp?: string;
  };

  type DashboardPieItemVO = {
    category?: string;
    value?: number;
  };

  type DashboardStatVO = {
    expiringSoonCount?: number;
    materialCount?: number;
    pendingApplyCount?: number;
    todayApplyCount?: number;
    todayOutQuantity?: number;
    totalStock?: number;
    unhandledWarnCount?: number;
  };

  type DashboardTrendItemVO = {
    applyCount?: number;
    date?: string;
    outQuantity?: number;
  };

  type DeleteRequest = {
    id?: number;
  };

  type exportReportUsingGETParams = {
    category?: string;
    current?: number;
    current?: number;
    current?: number;
    current?: number;
    endTime?: string;
    endTime?: string;
    endTime?: string;
    materialName?: string;
    materialName?: string;
    materialName?: string;
    materialName?: string;
    pageSize?: number;
    pageSize?: number;
    pageSize?: number;
    pageSize?: number;
    sortField?: string;
    sortField?: string;
    sortField?: string;
    sortField?: string;
    sortOrder?: string;
    sortOrder?: string;
    sortOrder?: string;
    sortOrder?: string;
    startTime?: string;
    startTime?: string;
    startTime?: string;
    /** reportType */
    reportType?: string;
  };

  type getApplyDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getFlowReportUsingGETParams = {
    current?: number;
    endTime?: string;
    materialName?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    startTime?: string;
  };

  type getMaterialDetailUsingGETParams = {
    /** id */
    id: number;
  };

  type getPostVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getStockDetailUsingGETParams = {
    /** materialId */
    materialId: number;
  };

  type getStockReportUsingGETParams = {
    category?: string;
    current?: number;
    materialName?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type getTodoUsingGETParams = {
    /** pageSize */
    pageSize?: number;
  };

  type getTurnoverReportUsingGETParams = {
    current?: number;
    endTime?: string;
    materialName?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    startTime?: string;
  };

  type getUsageReportUsingGETParams = {
    current?: number;
    endTime?: string;
    materialName?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    startTime?: string;
  };

  type getUserByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getUserVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getWarnUsingGETParams = {
    /** pageSize */
    pageSize?: number;
  };

  type listFlowUsingGETParams = {
    current?: number;
    endTime?: string;
    flowType?: string;
    materialName?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    startTime?: string;
  };

  type listMaterialUsingGETParams = {
    category?: string;
    current?: number;
    materialName?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    status?: number;
  };

  type listMyApplyUsingGETParams = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    status?: number;
    approvalNo?: string;
    materialName?: string;
  };

  type listNoticeUsingGETParams = {
    current?: number;
    isRead?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type listPendingApplyUsingGETParams = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    status?: number;
    approvalNo?: string;
    materialName?: string;
  };

  type listStockUsingGETParams = {
    category?: string;
    current?: number;
    materialName?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type listWarnUsingGETParams = {
    current?: number;
    handled?: number;
    materialName?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    warnType?: number;
  };

  type LoginUserVO = {
    createTime?: string;
    id?: number;
    updateTime?: string;
    userAvatar?: string;
    userName?: string;
    userPhone?: string;
    userProfile?: string;
    userRole?: string;
    userStatus?: number;
  };

  type markWarnHandledUsingPUTParams = {
    /** id */
    id: number;
  };

  type MaterialSaveRequest = {
    category?: string;
    expireDate?: string;
    id?: number;
    location?: string;
    materialName?: string;
    status?: number;
  };

  type MaterialVO = {
    category?: string;
    createTime?: string;
    expireDate?: string;
    id?: number;
    location?: string;
    materialName?: string;
    status?: number;
    stockTotal?: number;
    updateTime?: string;
    warnThreshold?: number;
  };

  type NoticeVO = {
    content?: string;
    createTime?: string;
    id?: number;
    isRead?: number;
    noticeType?: number;
    refId?: number;
    refType?: number;
    title?: string;
  };

  type OrderItem = {
    asc?: boolean;
    column?: string;
  };

  type PageApplyVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ApplyVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageMaterialVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: MaterialVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageNoticeVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: NoticeVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PagePost_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: Post[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PagePostVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: PostVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageReportFlowVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ReportFlowVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageReportStockVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ReportStockVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageReportTurnoverVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ReportTurnoverVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageReportUsageVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: ReportUsageVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageUser_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: User[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageUserVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: UserVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageWarnVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: WarnVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type Post = {
    content?: string;
    createTime?: string;
    favourNum?: number;
    id?: number;
    isDelete?: number;
    tags?: string;
    thumbNum?: number;
    title?: string;
    updateTime?: string;
    userId?: number;
  };

  type PostAddRequest = {
    content?: string;
    tags?: string[];
    title?: string;
  };

  type PostEditRequest = {
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type PostFavourAddRequest = {
    postId?: number;
  };

  type PostFavourQueryRequest = {
    current?: number;
    pageSize?: number;
    postQueryRequest?: PostQueryRequest;
    sortField?: string;
    sortOrder?: string;
    userId?: number;
  };

  type PostQueryRequest = {
    content?: string;
    current?: number;
    favourUserId?: number;
    id?: number;
    notId?: number;
    orTags?: string[];
    pageSize?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
    tags?: string[];
    title?: string;
    userId?: number;
  };

  type PostThumbAddRequest = {
    postId?: number;
  };

  type PostUpdateRequest = {
    content?: string;
    id?: number;
    tags?: string[];
    title?: string;
  };

  type PostVO = {
    content?: string;
    createTime?: string;
    favourNum?: number;
    hasFavour?: boolean;
    hasThumb?: boolean;
    id?: number;
    tagList?: string[];
    thumbNum?: number;
    title?: string;
    updateTime?: string;
    user?: UserVO;
    userId?: number;
  };

  type readNoticeUsingPUTParams = {
    /** id */
    id: number;
  };

  type rejectApplyUsingPOSTParams = {
    /** id */
    id: number;
  };

  type remindWarnUsingPOSTParams = {
    /** id */
    id: number;
  };

  type ReportFlowVO = {
    applyId?: number;
    approvalNo?: string;
    createTime?: string;
    flowType?: string;
    materialId?: number;
    materialName?: string;
    operatorId?: number;
    operatorName?: string;
    quantity?: number;
  };

  type ReportStockVO = {
    category?: string;
    currentStock?: number;
    location?: string;
    materialId?: number;
    materialName?: string;
    status?: number;
    warnThreshold?: number;
  };

  type ReportTurnoverVO = {
    currentStock?: number;
    materialId?: number;
    materialName?: string;
    outQuantity?: number;
    turnoverRate?: number;
  };

  type ReportUsageVO = {
    materialId?: number;
    materialName?: string;
    totalQuantity?: number;
    usageCount?: number;
  };

  type resetUserPasswordUsingPOSTParams = {
    /** id */
    id: number;
  };

  type StockAdjustRequest = {
    adjustAmount?: number;
    location?: string;
    materialId?: number;
    remark?: string;
  };

  type StockSaveRequest = {
    location?: string;
    materialId?: number;
    warnThreshold?: number;
  };

  type updateUserStatusUsingPUTParams = {
    /** id */
    id: number;
  };

  type uploadFileUsingPOSTParams = {
    biz?: string;
  };

  type User = {
    createTime?: string;
    id?: number;
    isDelete?: number;
    mpOpenId?: string;
    unionId?: string;
    updateTime?: string;
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userPassword?: string;
    userPhone?: string;
    userProfile?: string;
    userRole?: string;
    userStatus?: number;
  };

  type UserAddRequest = {
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userPhone?: string;
    userRole?: string;
    userStatus?: number;
  };

  type userLoginByWxOpenUsingGETParams = {
    /** code */
    code: string;
  };

  type UserLoginRequest = {
    userAccount?: string;
    userPassword?: string;
  };

  type UserQueryRequest = {
    current?: number;
    id?: number;
    mpOpenId?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    unionId?: string;
    userAccount?: string;
    userName?: string;
    userPhone?: string;
    userProfile?: string;
    userRole?: string;
    userStatus?: number;
  };

  type UserRegisterRequest = {
    checkPassword?: string;
    userAccount?: string;
    userPassword?: string;
  };

  type UserRoleAssignRequest = {
    userRole?: string;
  };

  type UserStatusUpdateRequest = {
    userStatus?: number;
  };

  type UserUpdateMyRequest = {
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
  };

  type UserUpdateRequest = {
    id?: number;
    userAvatar?: string;
    userName?: string;
    userPhone?: string;
    userProfile?: string;
    userRole?: string;
    userStatus?: number;
  };

  type UserVO = {
    createTime?: string;
    id?: number;
    userAvatar?: string;
    userName?: string;
    userPhone?: string;
    userProfile?: string;
    userRole?: string;
    userStatus?: number;
  };

  type WarnRuleSaveRequest = {
    id?: number;
    isEnabled?: number;
    materialId?: number;
    ruleName?: string;
    ruleType?: number;
    thresholdValue?: number;
  };

  type WarnRuleVO = {
    createTime?: string;
    id?: number;
    isEnabled?: number;
    materialId?: number;
    materialName?: string;
    ruleName?: string;
    ruleType?: number;
    ruleTypeText?: string;
    thresholdValue?: number;
    updateTime?: string;
  };

  type WarnVO = {
    createTime?: string;
    currentValue?: number;
    handled?: number;
    handledBy?: number;
    handledTime?: string;
    id?: number;
    materialId?: number;
    materialName?: string;
    ruleId?: number;
    thresholdValue?: number;
    warnType?: number;
    warnTypeText?: string;
  };
}
