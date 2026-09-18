import { CurrentAffairItem } from './current-affair.model';

export interface Bookmark {
  id: string;
  itemId: string;
  userId: string;
  note?: string;
  createdAtUtc: string;
  item?: CurrentAffairItem;
}

export interface BookmarkToggleRequest {
  itemId: string;
  userId: string;
  note?: string;
}
