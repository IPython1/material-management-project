package com.yupi.springbootinit.model.dto.report;

import com.yupi.springbootinit.common.PageRequest;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库存报表查询请求
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class ReportStockQueryRequest extends PageRequest implements Serializable {

    /**
     * 物资名称
     */
    private String materialName;

    /**
     * 物资分类
     */
    private String category;

    private static final long serialVersionUID = 1L;
}
