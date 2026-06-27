import { MetricType } from "@prisma/client";

const VALID_METRIC_PATTERNS: Record<string, RegExp> = {
  NUMERIC: /^\d+(\.\d+)?(\s+\S+)?$/,
  DURATION: /^\d+min$/,
  FREQUENCY: /^\d+\/\d+(\s+\S+)?$/,
  PERCENTAGE: /^\d+%$/,
  STAGE: /.+→.+/,
};

export function validateMetric(metricType: MetricType | string, targetValue: string): void {
  const pattern = VALID_METRIC_PATTERNS[metricType];
  if (!pattern) {
    throw Object.assign(new Error(`不支持的度量类型: ${metricType}`), {
      status: 400, code: "VALIDATION_ERROR",
    });
  }
  if (!pattern.test(targetValue)) {
    throw Object.assign(new Error(`度量值 "${targetValue}" 格式不匹配 ${metricType}`), {
      status: 400, code: "VALIDATION_ERROR",
    });
  }
}
