import * as React from "react";
import { Section, Text, Link } from "@react-email/components";
import {
  getEmailPipelineMetadata,
  type EmailPipelineId,
} from "../../pipeline-config";

interface DevInspectorRibbonProps {
  emailId: EmailPipelineId;
}

/**
 * 🛠️ DevInspectorRibbon (Zero-Production-Leak)
 * - Renders live pipeline observability metadata inside React Email preview (Port 3003).
 * - Stripped completely in production (returns null when NODE_ENV === 'production').
 */
export const DevInspectorRibbon = ({ emailId }: DevInspectorRibbonProps) => {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const meta = getEmailPipelineMetadata(emailId);
  if (!meta) {
    return null;
  }

  const {
    statusBadge,
    engineLabel,
    channelMediaLabel,
    legalLabel,
    trigger,
    editLocation,
    notes,
    journeyStageLabel,
  } = meta;

  return (
    <Section className="bg-[#0f172a] text-[#e2e8f0] rounded-lg p-3 mb-6 border border-[#334155] font-sans">
      {/* Top Header: Dev Label & Status Pill */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: "middle" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Text className="text-[10px] uppercase font-bold tracking-wider text-[#94a3b8] m-0">
                  🛠️ DEV INSPECTOR • PORT 3003
                </Text>
                <span
                  style={{
                    display: "inline-block",
                    padding: "1px 5px",
                    borderRadius: "3px",
                    fontSize: "9px",
                    fontWeight: 800,
                    backgroundColor: "#334155",
                    color: "#38bdf8",
                  }}
                >
                  {channelMediaLabel}
                </span>
              </div>
            </td>
            <td style={{ textAlign: "right", verticalAlign: "middle" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: statusBadge.color,
                  backgroundColor: statusBadge.bg,
                  border: `1px solid ${statusBadge.border}`,
                }}
              >
                {statusBadge.label}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Metadata Detail Rows */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}>
        <tbody>
          <tr>
            <td style={{ width: "26%", verticalAlign: "top" }}>
              <Text className="text-[11px] font-semibold text-[#64748b] m-0">Journey:</Text>
            </td>
            <td style={{ verticalAlign: "top" }}>
              <Text className="text-[11px] text-[#cbd5e1] font-medium m-0">
                {journeyStageLabel}
              </Text>
            </td>
          </tr>
          <tr>
            <td style={{ width: "26%", verticalAlign: "top", paddingTop: "3px" }}>
              <Text className="text-[11px] font-semibold text-[#64748b] m-0">Trigger:</Text>
            </td>
            <td style={{ verticalAlign: "top", paddingTop: "3px" }}>
              <Text className="text-[11px] text-[#38bdf8] font-mono m-0">
                {trigger}
              </Text>
            </td>
          </tr>
          <tr>
            <td style={{ width: "26%", verticalAlign: "top", paddingTop: "3px" }}>
              <Text className="text-[11px] font-semibold text-[#64748b] m-0">Engine:</Text>
            </td>
            <td style={{ verticalAlign: "top", paddingTop: "3px" }}>
              <Text className="text-[11px] text-[#cbd5e1] font-medium m-0">
                {engineLabel}
              </Text>
            </td>
          </tr>
          <tr>
            <td style={{ width: "26%", verticalAlign: "top", paddingTop: "3px" }}>
              <Text className="text-[11px] font-semibold text-[#64748b] m-0">Compliance:</Text>
            </td>
            <td style={{ verticalAlign: "top", paddingTop: "3px" }}>
              <Text className="text-[11px] text-[#cbd5e1] font-medium m-0">
                {legalLabel}
              </Text>
            </td>
          </tr>
          <tr>
            <td style={{ width: "26%", verticalAlign: "top", paddingTop: "3px" }}>
              <Text className="text-[11px] font-semibold text-[#64748b] m-0">Where to Edit:</Text>
            </td>
            <td style={{ verticalAlign: "top", paddingTop: "3px" }}>
              {editLocation.type === "SHOPIFY_ADMIN" ? (
                <Link
                  href={editLocation.pathOrUrl}
                  className="text-[11px] text-[#60a5fa] underline font-mono"
                  target="_blank"
                >
                  {editLocation.label} ↗
                </Link>
              ) : (
                <Text className="text-[11px] text-[#a7f3d0] font-mono m-0">
                  {editLocation.label}
                </Text>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Live Operational Notice */}
      {notes && (
        <div
          style={{
            marginTop: "10px",
            padding: "6px 8px",
            borderRadius: "4px",
            backgroundColor: "#1e293b",
            borderLeft: `3px solid ${statusBadge.color}`,
          }}
        >
          <Text className="text-[10px] text-[#94a3b8] leading-[14px] m-0">
            <strong style={{ color: "#f8fafc" }}>Note: </strong>
            {notes}
          </Text>
        </div>
      )}
    </Section>
  );
};

export default DevInspectorRibbon;
