import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import {
  getAllPipelineMetadata,
  getPipelinesByEngine,
  SHOPIFY_ADMIN_NOTIFICATIONS_URL,
  CRISP_ADMIN_URL,
  type EmailPipelineMetadata,
} from "../pipeline-config";
import { IS_MARKETING_EMAIL_ENABLED } from "../senders";

export const PipelineStatusDashboard = () => {
  const allPipelines = getAllPipelineMetadata();
  const shopifyPipelines = getPipelinesByEngine("SHOPIFY_NATIVE");
  const resendPipelines = getPipelinesByEngine("RESEND");
  const crispPipelines = getPipelinesByEngine("CRISP");

  const totalCount = allPipelines.length;

  const previewText = `📬 Unified Communications Hub: 10 Channels across Shopify (6), Resend (3), Crisp (1)`;

  const renderChannelCard = (meta: EmailPipelineMetadata) => (
    <div
      key={meta.id}
      style={{
        backgroundColor: "#161f30",
        border: "1px solid #26354a",
        borderRadius: "8px",
        padding: "14px",
        marginBottom: "12px",
      }}
    >
      {/* Card Header Row */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: "top" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "9px",
                    fontWeight: 800,
                    backgroundColor: "#1e293b",
                    color: "#38bdf8",
                    border: "1px solid #334155",
                    letterSpacing: "0.04em",
                  }}
                >
                  {meta.channelMediaLabel}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "9px",
                    fontWeight: 700,
                    backgroundColor: meta.legalClassification === "MARKETING" ? "#451a03" : "#064e3b",
                    color: meta.legalClassification === "MARKETING" ? "#fcd34d" : "#86efac",
                    border: `1px solid ${meta.legalClassification === "MARKETING" ? "#78350f" : "#059669"}`,
                  }}
                >
                  {meta.legalClassification}
                </span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                  {meta.journeyStageLabel}
                </span>
              </div>
              <Text className="text-[14px] font-bold text-white m-0">
                {meta.name}
              </Text>
            </td>
            <td style={{ textAlign: "right", verticalAlign: "top" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 9px",
                  borderRadius: "9999px",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: meta.statusBadge.color,
                  backgroundColor: meta.statusBadge.bg,
                  border: `1px solid ${meta.statusBadge.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                {meta.statusBadge.label}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Details Grid */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <tbody>
          <tr>
            <td style={{ width: "24%", verticalAlign: "top" }}>
              <Text className="text-[10px] font-semibold text-[#64748b] m-0">Trigger:</Text>
            </td>
            <td style={{ verticalAlign: "top" }}>
              <Text className="text-[11px] text-[#38bdf8] font-mono m-0">
                {meta.trigger}
              </Text>
            </td>
          </tr>
          <tr>
            <td style={{ width: "24%", verticalAlign: "top", paddingTop: "4px" }}>
              <Text className="text-[10px] font-semibold text-[#64748b] m-0">Engine:</Text>
            </td>
            <td style={{ verticalAlign: "top", paddingTop: "4px" }}>
              <Text className="text-[11px] text-[#e2e8f0] m-0 font-medium">
                {meta.engineLabel}
              </Text>
            </td>
          </tr>
          <tr>
            <td style={{ width: "24%", verticalAlign: "top", paddingTop: "4px" }}>
              <Text className="text-[10px] font-semibold text-[#64748b] m-0">Where to Edit:</Text>
            </td>
            <td style={{ verticalAlign: "top", paddingTop: "4px" }}>
              {meta.editLocation.type === "SHOPIFY_ADMIN" ? (
                <Link
                  href={meta.editLocation.pathOrUrl}
                  className="text-[11px] text-[#60a5fa] underline font-mono"
                  target="_blank"
                >
                  {meta.editLocation.label} ↗
                </Link>
              ) : meta.editLocation.type === "CRISP_ADMIN" ? (
                <Link
                  href={meta.editLocation.pathOrUrl}
                  className="text-[11px] text-[#38bdf8] underline font-mono"
                  target="_blank"
                >
                  {meta.editLocation.label} ↗
                </Link>
              ) : (
                <Text className="text-[11px] text-[#a7f3d0] font-mono m-0">
                  {meta.editLocation.label}
                </Text>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Context Note */}
      <div
        style={{
          marginTop: "10px",
          padding: "7px 10px",
          backgroundColor: "#0d1424",
          borderRadius: "6px",
          borderLeft: `3px solid ${meta.statusBadge.color}`,
        }}
      >
        <Text className="text-[10px] text-[#94a3b8] leading-[14px] m-0">
          <strong style={{ color: "#f1f5f9" }}>Context: </strong>
          {meta.notes}
        </Text>
      </div>
    </div>
  );

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#080d17] my-auto mx-auto font-sans px-2 py-8 text-[#e2e8f0]">
          <Container className="border border-[#1e293b] rounded-xl my-[20px] mx-auto p-[26px] max-w-[740px] bg-[#0f172a] shadow-2xl">
            {/* Minimalist Tech Header */}
            <Section className="text-center mt-2 mb-6">
              {/* Telemetry Badge */}
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "7px",
                    height: "7px",
                    borderRadius: "9999px",
                    backgroundColor: "#22c55e",
                    marginRight: "6px",
                    verticalAlign: "middle",
                  }}
                />
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    verticalAlign: "middle",
                  }}
                >
                  Live Telemetry • Port 3003
                </span>
              </div>

              <Heading className="text-white text-[24px] font-extrabold m-0 tracking-tight">
                Blank Seoul Omni-Channel Hub
              </Heading>
              <Text className="text-[#94a3b8] text-[12px] mt-1 m-0">
                Unified Customer Communications & Telemetry Console • 10 Channels
              </Text>
            </Section>

            {/* Top-Accent 4 KPI Cards */}
            <Section className="mb-6">
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "8px" }}>
                <tbody>
                  <tr>
                    {/* Total */}
                    <td
                      style={{
                        width: "25%",
                        backgroundColor: "#161f30",
                        padding: "14px 10px",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px solid #26354a",
                        borderTop: "3px solid #64748b",
                      }}
                    >
                      <Text className="text-[10px] uppercase font-bold text-[#94a3b8] m-0 tracking-wider">
                        Total Channels
                      </Text>
                      <Text className="text-[24px] font-extrabold text-white mt-1 m-0 tracking-tight">
                        {totalCount}
                      </Text>
                    </td>

                    {/* Shopify */}
                    <td
                      style={{
                        width: "25%",
                        backgroundColor: "#161f30",
                        padding: "14px 10px",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px solid #1e3a8a",
                        borderTop: "3px solid #3b82f6",
                      }}
                    >
                      <Text className="text-[10px] uppercase font-bold text-[#60a5fa] m-0 tracking-wider">
                        Shopify Native
                      </Text>
                      <Text className="text-[24px] font-extrabold text-[#60a5fa] mt-1 m-0 tracking-tight">
                        {shopifyPipelines.length}
                      </Text>
                    </td>

                    {/* Resend */}
                    <td
                      style={{
                        width: "25%",
                        backgroundColor: "#161f30",
                        padding: "14px 10px",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px solid #78350f",
                        borderTop: "3px solid #f59e0b",
                      }}
                    >
                      <Text className="text-[10px] uppercase font-bold text-[#fbbf24] m-0 tracking-wider">
                        Resend Storefront
                      </Text>
                      <Text className="text-[24px] font-extrabold text-[#fbbf24] mt-1 m-0 tracking-tight">
                        {resendPipelines.length}
                      </Text>
                    </td>

                    {/* Crisp */}
                    <td
                      style={{
                        width: "25%",
                        backgroundColor: "#161f30",
                        padding: "14px 10px",
                        borderRadius: "8px",
                        textAlign: "center",
                        border: "1px solid #0369a1",
                        borderTop: "3px solid #06b6d4",
                      }}
                    >
                      <Text className="text-[10px] uppercase font-bold text-[#38bdf8] m-0 tracking-wider">
                        Crisp Chat
                      </Text>
                      <Text className="text-[24px] font-extrabold text-[#38bdf8] mt-1 m-0 tracking-tight">
                        {crispPipelines.length}
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* 10-Channel Two-Row Integrated Customer Journey Map */}
            <Section className="bg-[#161f30] border border-[#26354a] rounded-lg p-4 mb-6">
              <Text className="text-[11px] uppercase tracking-wider font-bold text-[#94a3b8] m-0 mb-3">
                🗺️ Visual Customer Journey Timeline (10 Channels)
              </Text>

              {/* Row 1: Happy Path (5 Stages) */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: "center", padding: "3px", width: "18%" }}>
                      <div style={{ backgroundColor: "#0f172a", padding: "8px 4px", borderRadius: "6px", border: "1px solid #334155" }}>
                        <Text className="text-[10px] font-bold text-[#cbd5e1] m-0">1. 가입/계정</Text>
                        <Text className="text-[9px] text-[#60a5fa] m-0 mt-0.5 font-semibold">Shopify</Text>
                      </div>
                    </td>
                    <td style={{ textAlign: "center", color: "#64748b", fontSize: "11px", width: "2%" }}>➔</td>
                    <td style={{ textAlign: "center", padding: "3px", width: "18%" }}>
                      <div style={{ backgroundColor: "#0f172a", padding: "8px 4px", borderRadius: "6px", border: "1px solid #334155" }}>
                        <Text className="text-[10px] font-bold text-[#cbd5e1] m-0">2. 결제완료</Text>
                        <Text className="text-[9px] text-[#60a5fa] m-0 mt-0.5 font-semibold">Shopify</Text>
                      </div>
                    </td>
                    <td style={{ textAlign: "center", color: "#64748b", fontSize: "11px", width: "2%" }}>➔</td>
                    <td style={{ textAlign: "center", padding: "3px", width: "18%" }}>
                      <div style={{ backgroundColor: "#0f172a", padding: "8px 4px", borderRadius: "6px", border: "1px solid #334155" }}>
                        <Text className="text-[10px] font-bold text-[#cbd5e1] m-0">3. 배송출고</Text>
                        <Text className="text-[9px] text-[#60a5fa] m-0 mt-0.5 font-semibold">Shopify</Text>
                      </div>
                    </td>
                    <td style={{ textAlign: "center", color: "#64748b", fontSize: "11px", width: "2%" }}>➔</td>
                    <td style={{ textAlign: "center", padding: "3px", width: "18%" }}>
                      <div style={{ backgroundColor: "#0f172a", padding: "8px 4px", borderRadius: "6px", border: "1px solid #78350f" }}>
                        <Text className="text-[10px] font-bold text-[#cbd5e1] m-0">4. 사후리뷰</Text>
                        <Text className="text-[9px] text-[#fbbf24] m-0 mt-0.5 font-semibold">Resend</Text>
                      </div>
                    </td>
                    <td style={{ textAlign: "center", color: "#64748b", fontSize: "11px", width: "2%" }}>➔</td>
                    <td style={{ textAlign: "center", padding: "3px", width: "18%" }}>
                      <div style={{ backgroundColor: "#0f172a", padding: "8px 4px", borderRadius: "6px", border: "1px solid #78350f" }}>
                        <Text className="text-[10px] font-bold text-[#cbd5e1] m-0">5. 쿠폰소멸</Text>
                        <Text className="text-[9px] text-[#fbbf24] m-0 mt-0.5 font-semibold">Resend</Text>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Row 2: Support & Exceptions Branch (2 Stages) */}
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed #334155" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "48%", padding: "3px" }}>
                        <div style={{ backgroundColor: "#0f172a", padding: "8px 10px", borderRadius: "6px", border: "1px solid #1e3a8a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <Text className="text-[10px] font-bold text-[#cbd5e1] m-0">6. 주문 취소 & 환불 확인</Text>
                            <Text className="text-[9px] text-[#94a3b8] m-0">고객/관리자 취소 발생 시 즉시 발송</Text>
                          </div>
                          <span style={{ fontSize: "9px", fontWeight: 700, color: "#60a5fa", backgroundColor: "#1e3a8a", padding: "2px 6px", borderRadius: "4px" }}>
                            Shopify Native
                          </span>
                        </div>
                      </td>
                      <td style={{ width: "4%", textAlign: "center", color: "#64748b", fontSize: "12px" }}>⟷</td>
                      <td style={{ width: "48%", padding: "3px" }}>
                        <div style={{ backgroundColor: "#0f172a", padding: "8px 10px", borderRadius: "6px", border: "1px solid #0369a1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <Text className="text-[10px] font-bold text-[#cbd5e1] m-0">7. 실시간 상담 & 부재중 알림</Text>
                            <Text className="text-[9px] text-[#94a3b8] m-0">전 여정 상시 고객 문의 위젯</Text>
                          </div>
                          <span style={{ fontSize: "9px", fontWeight: 700, color: "#38bdf8", backgroundColor: "#0369a1", padding: "2px 6px", borderRadius: "4px" }}>
                            Crisp SDK
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Terminal Inspector Marketing Switch Card */}
            <Section className="bg-[#161f30] border border-[#26354a] rounded-lg p-4 mb-6">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    {/* Visual Slide Toggle */}
                    <td style={{ width: "42px", verticalAlign: "middle" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "20px",
                          borderRadius: "10px",
                          backgroundColor: IS_MARKETING_EMAIL_ENABLED ? "#15803d" : "#475569",
                          position: "relative",
                          border: `1px solid ${IS_MARKETING_EMAIL_ENABLED ? "#22c55e" : "#64748b"}`,
                        }}
                      >
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "7px",
                            backgroundColor: "#ffffff",
                            position: "absolute",
                            top: "2px",
                            left: IS_MARKETING_EMAIL_ENABLED ? "18px" : "3px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
                          }}
                        />
                      </div>
                    </td>

                    {/* Switch Label & Code */}
                    <td style={{ verticalAlign: "middle", paddingLeft: "8px" }}>
                      <Text className="text-[10px] uppercase tracking-wider font-bold text-[#9ca3af] m-0">
                        Resend Marketing Pipeline Guard
                      </Text>
                      <Text className="text-[13px] font-mono font-bold text-white mt-0.5 m-0">
                        IS_MARKETING_EMAIL_ENABLED ={" "}
                        <span style={{ color: IS_MARKETING_EMAIL_ENABLED ? "#4ade80" : "#f87171" }}>
                          {String(IS_MARKETING_EMAIL_ENABLED)}
                        </span>
                      </Text>
                    </td>

                    {/* Status Badge */}
                    <td style={{ textAlign: "right", verticalAlign: "middle" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "9999px",
                          fontSize: "10px",
                          fontWeight: 700,
                          backgroundColor: IS_MARKETING_EMAIL_ENABLED ? "#064e3b" : "#451a03",
                          color: IS_MARKETING_EMAIL_ENABLED ? "#86efac" : "#fcd34d",
                          border: `1px solid ${IS_MARKETING_EMAIL_ENABLED ? "#059669" : "#b45309"}`,
                        }}
                      >
                        {IS_MARKETING_EMAIL_ENABLED ? "● RESEND ACTIVE" : "⏸ ZERO-COST STANDBY"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: "10px", padding: "8px 10px", backgroundColor: "#0f172a", borderRadius: "6px", border: "1px solid #334155" }}>
                <Text className="text-[11px] text-[#9ca3af] leading-[16px] m-0 font-mono">
                  {IS_MARKETING_EMAIL_ENABLED
                    ? "✓ Marketing campaigns active. Dispatched via Resend on cron schedules."
                    : "ℹ︎ Marketing emails paused. Cron routes abort at entry in ~15ms (0 Shopify API calls, 0 DB queries)."}
                </Text>
              </div>
            </Section>

            <Hr className="border-[#1e293b] my-4" />

            {/* Section 1: Shopify Native Channels */}
            <Section className="mb-6">
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
                <tbody>
                  <tr>
                    <td>
                      <Heading className="text-white text-[16px] font-semibold m-0">
                        🏬 Shopify Native Transactional Channels ({shopifyPipelines.length})
                      </Heading>
                      <Text className="text-[11px] text-[#94a3b8] m-0 mt-0.5">
                        Shopify 본진 서버에서 직접 고객에게 발송하는 핵심 거래 및 배송 알림
                      </Text>
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "middle" }}>
                      <Link
                        href={SHOPIFY_ADMIN_NOTIFICATIONS_URL}
                        className="text-[11px] text-[#60a5fa] underline font-bold"
                        target="_blank"
                      >
                        Shopify Settings ↗
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>

              {shopifyPipelines.map(renderChannelCard)}
            </Section>

            <Hr className="border-[#1e293b] my-4" />

            {/* Section 2: Storefront Resend Marketing Channels */}
            <Section className="mb-6">
              <Heading className="text-white text-[16px] font-semibold m-0 mb-1">
                ⚡️ Next.js + Resend Marketing & Growth Channels ({resendPipelines.length})
              </Heading>
              <Text className="text-[11px] text-[#94a3b8] m-0 mb-3">
                스토어프런트 리포지토리(emails/templates/)에서 코드로 직접 관리하는 사후 마케팅 메일
              </Text>

              {resendPipelines.map(renderChannelCard)}
            </Section>

            <Hr className="border-[#1e293b] my-4" />

            {/* Section 3: Crisp Live Support Channel */}
            <Section className="mb-6">
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
                <tbody>
                  <tr>
                    <td>
                      <Heading className="text-white text-[16px] font-semibold m-0">
                        💬 Crisp Live Chat & Offline Support ({crispPipelines.length})
                      </Heading>
                      <Text className="text-[11px] text-[#94a3b8] m-0 mt-0.5">
                        스토어프런트 실시간 위젯 및 고객 부재 시 이메일 자동 포워딩
                      </Text>
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "middle" }}>
                      <Link
                        href={CRISP_ADMIN_URL}
                        className="text-[11px] text-[#38bdf8] underline font-bold"
                        target="_blank"
                      >
                        Crisp Console ↗
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>

              {crispPipelines.map(renderChannelCard)}
            </Section>

            <Hr className="border-[#1e293b] my-4" />

            {/* 2026 Google/Yahoo DMARC/SPF/DKIM Authentication Checklist */}
            <Section className="mb-6">
              <Heading className="text-white text-[15px] font-semibold mb-3 m-0">
                🛡️ 2026 Google & Yahoo Sender Authentication (DMARC / SPF / DKIM)
              </Heading>
              <div style={{ backgroundColor: "#161f30", borderRadius: "8px", padding: "14px", border: "1px solid #26354a" }}>
                <Text className="text-[11px] text-[#cbd5e1] leading-[22px] m-0">
                  ✅ <strong>Shopify CNAME Sender Verification:</strong> tv7r0x-zn 매장에서 blankseoul.com 도메인 인증 완료.
                  <br />
                  ✅ <strong>Resend Dedicated DKIM Records:</strong> Resend API가 blankseoul.com 서명으로 메일을 전송.
                  <br />
                  ✅ <strong>DMARC Alignment:</strong> 두 엔진 모두 _dmarc.blankseoul.com 정합성을 충족하여 스팸함 직행 방어.
                  <br />
                  ✅ <strong>1-Click Unsubscribe (RFC 8058):</strong> 상업성 마케팅 메일(리뷰/쿠폰)에 필수 헤더 및 링크 탑재.
                  <br />
                  ✅ <strong>Physical Address Requirement:</strong> Blank Palette LLC, 30 N Gould St, Sheridan, WY 82801 표기.
                </Text>
              </div>
            </Section>

            {/* Quick Operations Runbook */}
            <Section className="bg-[#0d1424] rounded-lg p-4 border border-[#26354a]">
              <Heading className="text-white text-[14px] font-semibold mb-2 m-0">
                🚀 Operations Quick-Guide
              </Heading>
              <Text className="text-[11px] text-[#94a3b8] leading-[18px] m-0">
                • <strong>쇼피파이 메일 템플릿 수정:</strong>{" "}
                <Link href={SHOPIFY_ADMIN_NOTIFICATIONS_URL} className="text-[#60a5fa] underline" target="_blank">
                  admin.shopify.com/store/tv7r0x-zn/settings/notifications
                </Link>
                <br />
                • <strong>리뷰/쿠폰 마케팅 메일 수정:</strong> VS Code 내 <code style={{ color: "#a7f3d0" }}>emails/templates/*.tsx</code> 편집
                <br />
                • <strong>마케팅 재개:</strong> <code style={{ color: "#cbd5e1" }}>emails/senders.ts</code>에서 <code style={{ color: "#4ade80" }}>IS_MARKETING_EMAIL_ENABLED = true</code> 변경
                <br />
                • <strong>실시간 상담 관리:</strong>{" "}
                <Link href={CRISP_ADMIN_URL} className="text-[#38bdf8] underline" target="_blank">
                  app.crisp.chat
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PipelineStatusDashboard;
