export enum LogMessageType {
    INFO = 'INFO',
    ERROR = 'ERROR'
  }

  export const RespStatusCodes = {
    Success : '000', 
    Failed : '012'
  }
  export const RespDesc = {
    Success : 'Success', 
    Failed : 'Failed'
  }
  export enum LogMessage {
    USER_NOT_FOUND = 'User not found',
    INVALID_CREDENTIALS = 'Invalid credentials',
    USER_ALREADY_EXISTS = 'User already exists',
    USER_CREATED_SUCCESSFULLY = 'User created successfully ',
    USER_UPDATED_SUCCESSFULLY = 'User updated successfully',
    USER_DELETED_SUCCESSFULLY = 'User deleted successfully',
    USER_NOT_DELETED = 'User not deleted',
    USER_NOT_UPDATED = 'User not updated',
    mobile_number_already_exists = 'Mobile number already exists',
    OTP_SENT_SUCCESSFULLY = 'OTP sent successfully',
    OTP_VERIFIED_SUCCESSFULLY = 'OTP verified successfully',
    OTP_VERIFICATION_FAILED = 'OTP verification failed',
    email_already_exists = 'Email already exists',
    INVALID_OTP = 'Invalid OTP',
    email_or_mobileno_required = 'Either email or mobile number is required',
    Something_went_wrong = 'Something went wrong',
    valid_country_code = 'Please select a valid country code',
    parentkidmappingSuccessfully = 'Parent kid mapping successfully',
    parentNotFound = 'Parent not found',
    Failed_to_create_proposal = 'Failed to create proposal', 
    Proposal_created_successfully = 'Proposal created successfully',
    Rewards_fetched_successfully = 'Rewards fetched successfully',
    valid_email_or_mobile_number = 'Please enter a valid email or mobile number',
    otp_sent_successfully = 'OTP sent successfully',
    failed_to_send_otp = 'Failed to send OTP',
    otp_verified_successfully = 'OTP verified successfully',
    otp_verification_failed = 'OTP verification failed',
    verification_failed = 'Verification failed',
    password_updated_successfully = 'Password updated successfully',
    invalidDateRange = 'Invalid date range',
    proposalAlreadyExists = 'Proposal already exists between the given dates',
    startDatetimeCannotBeFuture='Start datetime cannot be in the future',
    startDatetimeCannotBePast='Start datetime cannot be in the past',
  }