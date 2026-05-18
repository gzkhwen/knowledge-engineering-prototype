import { Badge } from "../ui/badge";
import type { Status } from "../../app/data/mock-data";

export function StatusBadge({ status }: { status: Status | string }) {
  const variant =
    status === "运行中" || status === "已发布" || status === "正常"
      ? "success"
      : status === "停用" || status === "草稿"
        ? "warning"
        : status === "异常" || status === "失败"
          ? "danger"
          : "secondary";

  return <Badge variant={variant}>{status}</Badge>;
}
