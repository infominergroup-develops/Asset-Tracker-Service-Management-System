export type UserRole = 'employee' | 'manager' | 'director' | 'admin' | 'vendor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: string;
  designation?: string;
  vendorId?: string;
  avatarUrl?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  entity: string;
  location: string;
}

export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Defective';

export type AssetStatus = 
  | 'Active'
  | 'Assigned'
  | 'Unassigned'
  | 'Under Maintenance'
  | 'Damaged'
  | 'Lost'
  | 'Under Repair'
  | 'Retired'
  | 'Disposed'
  | 'Replaced';

export type AssetCategory = 
  | 'IT Equipment'
  | 'Office Furniture'
  | 'HVAC & Cooling'
  | 'Electrical & Power'
  | 'Networking'
  | 'Vehicles'
  | 'Appliances'
  | 'Other Facilities';

export interface Asset {
  id: string; // e.g. AST-000123
  name: string;
  category: AssetCategory;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number; // in INR ₹
  warrantyExpiry: string;
  vendorId: string;
  vendorName: string;
  entity: string; // e.g. Infominer Services Pvt. Ltd.
  department: string; // e.g. Technology, Operations
  location: string; // e.g. Agra Office - Floor 2
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedEmployeeEmail?: string;
  responsibleManager: string;
  condition: AssetCondition;
  status: AssetStatus;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  replacedByAssetId?: string;
}

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketCategory =
  | 'Damage'
  | 'Hardware Problem'
  | 'Electrical Problem'
  | 'Furniture Problem'
  | 'Maintenance'
  | 'Replacement Required'
  | 'Software/IT Issue'
  | 'General Issue'
  | 'Other';

export type TicketStatus =
  | 'Submitted'
  | 'Under Management Review'
  | 'Clarification Required'
  | 'Approved'
  | 'Rejected'
  | 'Sent to Vendor'
  | 'Quotation Pending'
  | 'Quotation Received'
  | 'Quotation Under Review'
  | 'Quotation Revision Required'
  | 'Quotation Approved'
  | 'Quotation Rejected'
  | 'Work Scheduled'
  | 'Work In Progress'
  | 'Awaiting Parts'
  | 'Work Completed'
  | 'Verification Pending'
  | 'Closed';

export interface TicketAttachment {
  id: string;
  name: string;
  size: string;
  url: string;
  type: 'image' | 'document';
  uploadedAt: string;
  uploadedBy: string;
}

export interface TicketTimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  role: UserRole | 'System';
  comment?: string;
  previousStatus?: TicketStatus;
  newStatus?: TicketStatus;
  metadata?: Record<string, any>;
}

export interface InternalComment {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  comment: string;
  timestamp: string;
}

export interface Ticket {
  id: string; // e.g. TKT-2026-00125
  assetId: string;
  assetName: string;
  assetCategory: AssetCategory;
  employeeName: string;
  employeeId?: string;
  employeeEmail: string;
  employeePhone: string;
  department: string;
  entity: string;
  location: string;
  issueCategory: TicketCategory;
  problemDescription: string;
  priority: TicketPriority;
  occurredAt: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  attachments: TicketAttachment[];
  timeline: TicketTimelineEvent[];
  internalComments: InternalComment[];
  assignedVendorId?: string;
  workOrderId?: string;
  rejectionReason?: string;
  clarificationNote?: string;
  closureNote?: string;
  resolvedAt?: string;
}

export interface Quotation {
  id: string; // e.g. QUO-2026-0045
  workOrderId: string;
  ticketId: string;
  vendorId: string;
  vendorName: string;
  quotationNumber: string;
  date: string;
  serviceDescription: string;
  materialCost: number;
  labourCost: number;
  taxes: number; // GST (18%)
  otherCharges: number;
  totalAmount: number;
  estimatedDays: number;
  pdfUrl?: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Revision Required' | 'Rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  version: number;
}

export type WorkOrderStatus =
  | 'Assigned'
  | 'Accepted'
  | 'Quotation Pending'
  | 'Quotation Approved'
  | 'Work Scheduled'
  | 'Work In Progress'
  | 'Awaiting Parts'
  | 'Work Completed'
  | 'Verified & Closed';

export interface WorkOrder {
  id: string; // e.g. WO-2026-00125
  ticketId: string;
  assetId: string;
  assetName: string;
  vendorId: string;
  vendorName: string;
  issueSummary: string;
  requiredWork: string;
  createdAt: string;
  status: WorkOrderStatus;
  quotationId?: string;
  currentQuotationAmount?: number;
  workScheduledDate?: string;
  workStartedDate?: string;
  workCompletedDate?: string;
  completionDescription?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  serviceReportUrl?: string;
  vendorInvoiceNumber?: string;
  vendorInvoiceUrl?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  status: 'Active' | 'Under Review' | 'Inactive';
  completedJobsCount: number;
  rating: number;
  averageTurnaroundDays: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'critical';
  targetRoles: UserRole[];
  ticketId?: string;
  workOrderId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  ticketId?: string;
  assetId?: string;
  user: string;
  role: string;
  action: string;
  entityAffected: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  ipAddress?: string;
}

export interface ApprovalConfig {
  managerMaxThreshold: number; // e.g. 5000: Repairs <= 5000 require only Manager approval
  directorRequiredAbove: number; // > 5000 requires Director approval
  requireDirectorForReplacement: boolean;
  requireDirectorForDisposal: boolean;
  autoDispatchVendorOnApprove: boolean;
}
