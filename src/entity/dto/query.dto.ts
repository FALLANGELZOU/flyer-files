interface PageQueryDto {
    pageSize?: number,
    pageIndex?: number,
    reverse?: boolean,
    sortBy?: string,
    thirdParty?: boolean,
    thirdPartyType?: string
}
