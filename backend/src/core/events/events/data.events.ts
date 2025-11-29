/**
 * События данных (документы, адреса, и т.д.)
 */

export const DATA_EVENTS = {
  // Создание
  BEFORE_CREATE: 'data.before_create',
  AFTER_CREATE: 'data.after_create',
  CREATE_FAILED: 'data.create_failed',

  // Чтение
  BEFORE_READ: 'data.before_read',
  AFTER_READ: 'data.after_read',
  READ_FAILED: 'data.read_failed',

  // Обновление
  BEFORE_UPDATE: 'data.before_update',
  AFTER_UPDATE: 'data.after_update',
  UPDATE_FAILED: 'data.update_failed',

  // Удаление
  BEFORE_DELETE: 'data.before_delete',
  AFTER_DELETE: 'data.after_delete',
  DELETE_FAILED: 'data.delete_failed',

  // Валидация
  VALIDATED: 'data.validated',
  VALIDATION_FAILED: 'data.validation_failed',

  // Wildcard
  ALL: 'data.*',
} as const;

/**
 * События документов
 */
export const DOCUMENT_EVENTS = {
  CREATED: 'document.created',
  UPDATED: 'document.updated',
  DELETED: 'document.deleted',
  VIEWED: 'document.viewed',
  SHARED: 'document.shared',
  VERIFIED: 'document.verified',
  
  ALL: 'document.*',
} as const;

/**
 * События адресов
 */
export const ADDRESS_EVENTS = {
  CREATED: 'address.created',
  UPDATED: 'address.updated',
  DELETED: 'address.deleted',
  SELECTED: 'address.selected',
  SET_DEFAULT: 'address.set_default',
  
  ALL: 'address.*',
} as const;

/**
 * События семьи
 */
export const FAMILY_EVENTS = {
  CREATED: 'family.created',
  MEMBER_ADDED: 'family.member_added',
  MEMBER_REMOVED: 'family.member_removed',
  MEMBER_ROLE_CHANGED: 'family.member_role_changed',
  INVITATION_SENT: 'family.invitation_sent',
  INVITATION_ACCEPTED: 'family.invitation_accepted',
  INVITATION_REJECTED: 'family.invitation_rejected',
  
  ALL: 'family.*',
} as const;

/**
 * Типы данных для событий данных
 */
export interface DataCreatedEventData {
  type: string;
  id: string;
  data: any;
  userId?: string;
}

export interface DataUpdatedEventData {
  type: string;
  id: string;
  changes: Record<string, any>;
  previousValues: Record<string, any>;
  userId?: string;
}

export interface DataDeletedEventData {
  type: string;
  id: string;
  userId?: string;
}

export interface DocumentCreatedEventData {
  documentId: string;
  type: string;
  userId: string;
}

export interface AddressCreatedEventData {
  addressId: string;
  type: string;
  userId: string;
}

export interface FamilyMemberAddedEventData {
  familyId: string;
  memberId: string;
  role: string;
}

