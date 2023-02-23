export default interface Todo {
  todo_id: string;
  title: string;
  notes: string;
  created_dt: string;
  due_dt: string;
  is_reminder_enabled: boolean;
  is_completed: boolean;
  last_modified_dt: string;
  user_id: string;
  category_id: string;
}
