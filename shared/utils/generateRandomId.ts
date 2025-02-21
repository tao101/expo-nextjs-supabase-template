import { uid } from "uid";

export function generateRandomId() {
  return uid(16);
}
