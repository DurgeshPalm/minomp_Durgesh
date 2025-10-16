export enum TableUsersEntity {
    id = 'id',
    username='username',
    email = 'email',
    password = 'password',
    role = 'role',
    referralCode = 'referral_code',
    countryCodeId = 'country_code_id',
    mobileNo = 'mobileno',
    isDeleted = 'is_deleted',
    token = 'token',
    languageId = 'language_id'
}

export enum TableProposalsEntity {
    id = 'id',
    userId = 'user_id',
    proposalName = 'proposal_name',
    rewardId = 'reward_id',
    minompTime = 'minomp_time',
    breakTime = 'break_time',
    status = 'status',
    isDeleted = 'is_deleted',
    isReceivedReward = 'is_received_reward',
    startDatetime= 'start_datetime',
    endDatetime= 'end_datetime',
    reward_type='reward_type'
}

export enum TableLogsEntity {
    id = 'id',
    requestPath = 'request_path',
    requestMethod = 'request_method',
    requestData = 'request_data',
    logMessage = 'log_message',
    logMessageType = 'log_messagetype',
    responseData = 'response_data',
    requestDatetime = 'request_datetime',
    responseDatetime = 'response_datetime',
    userId = 'user_id'
}

export enum TableRewardsEntity {
    id = 'id',
    rewardName = 'reward_name',
    rewardIcon = 'reward_icon',
    isActive = 'is_active',
}

export enum TablePointsEntity {
    id = 'id',
    userId = 'user_id',
    pointsEarned = 'points_earned',
    referralCodeId = 'referral_code_id'
}

export enum TableCountryCodesEntity {
    id = 'id',
    countryName = 'country_name',
    countryCode = 'country_code',
    isActive = 'is_active'
}

export enum TableSessionsEntity {
    id = 'id',
    userId = 'user_id',
    sessionId = 'session_id',
    deviceId = 'device_id',
    latitude = 'latitude',
    longitude = 'longitude',
    loginDatetime = 'login_datetime',
    logoutDatetime = 'logout_datetime'
}

export enum TableConnectionsEntity {
    id = 'id',
    parentId = 'parent_id',
    kidId = 'kid_id',
    status = 'status',
}

export enum TableReferralsEntity {
    id = 'id',
    referredById = 'referred_by_id',
    referredToId = 'referred_to_id',
    createDate = 'create_date',
    updatedDate = 'updated_date',
    referralCode = 'referral_code',
    isActive = 'is_active'
}

export enum TableTimeTrackingEntity {
    id = 'id',
    proposalId = 'proposal_id',
    startTime = 'start_time',
    endTime = 'end_time',
    breakTimeUsed = 'break_time_used',
    createDate = 'create_date',
    updatedDate = 'updated_date'
}

export enum TableOtpEntity {
    id = 'id',
    code = 'code',
    userId = 'userid',
    expireDatetime = 'expiredatetime',
    createDatetime = 'create_datetime',
    isUsed = 'is_used',
    count = 'count',
    isExpired = 'is_expired'
}

export enum TableProposalMappingEntity {
    id = 'id',
    kidId = 'kid_id',
    parentId = 'parent_id',
    proposalId = 'proposal_id',
    status = 'status',
    requestDatetime = 'request_datetime',
    updatedDatetime = 'updated_datetime'
}

export enum TableNotificationTypeEntity {
    id = 'ID',
    name = 'Name',
    createdBy = 'CreatedBy',
    createdDate = 'CreatedDate',
    updatedBy = 'UpdatedBy',
    updatedDate = 'UpdatedDate',
    status = 'Status'
}

export enum TableNotificationEntity {
    id = 'id',
    notificationTypeId = 'notification_typeid',
    senderId = 'senderid',
    receiverId = 'receiverid',
    notificationData = 'notification_data',
    createdDate = 'created_date',
    expiredDate = 'expired_date',
    updatedDate = 'updated_date',
    isRead = 'is_read',
    isDeleted = 'is_deleted'
}

export enum TableLanguagesEntity {
    id = 'id',
    language = 'language',
    isActive = 'is_active',
}

export enum TableDevicesEntity {
    id = 'id',
    deviceModel = 'device_model',
    userId = 'user_id',
    deviceType = 'device_type',
    appVersion = 'AppVersion',
    osVersion = 'OsVersion'
}

export enum TableCustomRewardsEntity {
    id = 'id',
    rewardName = 'reward_name',
    rewardIcon = 'reward_icon',
    userId = 'userid'
}
