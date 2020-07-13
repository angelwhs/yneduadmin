//审核状态
export const AuditStatus = [{Id:1, Name: '正常'}, {Id:2, Name: '审核中'}, {Id:3, Name: '未审核通过'}];

export function GetAuditStatusName(status) {
    if(status) {
        switch(status) {
            case 0:
                return '未知';
            case 1:
                return '正常';
            case 2:
                return '审核中';
            case 3:
                return '未审核通过';
            default:
                return '未知';
        }
    } else {
        return '未知';
    }
}

//性别
export const SexList = [{Id:1, Name: '男'}, {Id:2, Name: '女'}, {Id:3, Name: '保密'}];

export function GetSexName(sex) {
    if(!sex) {
        return '未知';
    }

    switch(sex) {
        case 1:
            return '男';
        case 2:
            return '女';
        case 3:
            return '保密';
        default:
            return '未知';
    }
}

//产品状态
export const ProductStatus = [{Id:1, Name: '上架'}, {Id:2, Name: '编辑中'}, {Id:3, Name: '下架'}];

export function GetProductStatusName(status) {
    if(status) {
        switch(status) {
            case 0:
                return '未知';
            case 1:
                return '上架';
            case 2:
                return '编辑中';
            case 3:
                return '下架';
            default:
                return '未知';
        }
    } else {
        return '未知';
    }
}

//隐私选项
export const AccessPermissions = [
    {Id: 1, Name: '所有人可见'},
    {Id: 2, Name: '机构内可见'},
    {Id: 3, Name: '部门内可见'},
    {Id: 4, Name: '好友可见'},
    {Id: 5, Name: '保密'},
];

export function GetAccessPermissionName(id) {
    if(id) {
        switch(id) {
            case 0:
                return '未知';
            case 1:
                return '所有人可见';
            case 2:
                return '机构内可见';
            case 3:
                return '部门内可见';
            case 4:
                return '好友可见';
            case 5:
                return '保密';
            default:
                return '未知';
        }
    } else {
        return '未知';
    }
}