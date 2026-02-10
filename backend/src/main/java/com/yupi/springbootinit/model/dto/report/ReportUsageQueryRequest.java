package com.yupi.springbootinit.model.dto.report;

import com.yupi.springbootinit.common.PageRequest;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 领用频次报表查询请求
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ReportUsageQueryRequest extends PageRequest implements Serializable {

    /**
     * 物资名称
     */
    private String materialName;

    /**
     * 开始时间（yyyy-MM-dd HH:mm:ss）
     */
    private String startTime;

    /**
     * 结束时间（yyyy-MM-dd HH:mm:ss）
     */
    private String endTime;

    private static final long serialVersionUID = 1L;
}
