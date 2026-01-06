// Services Index
// Centralized export of all services for easy importing

export { authService } from "./authService";
export { userService } from "./userService";
export { walletService } from "./walletService";
export { miningService } from "./miningService";
export { rewardsService } from "./rewardsService";
export { notificationService } from "./notificationService";
export { adminService } from "./adminService";

// Re-export types
export type { AuthResult, TokenPayload } from "./authService";
export type { UserFilters, PaginatedResult } from "./userService";
export type { BalanceAdjustment } from "./walletService";
export type { NotificationType, NotificationCategory, NotificationPriority, CreateNotificationInput } from "./notificationService";
