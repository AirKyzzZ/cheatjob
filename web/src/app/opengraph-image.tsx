import { ImageResponse } from "next/og";

export const alt =
  "Cheatjob — Tu n'auras pas ton stage en postulant sur Indeed.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(circle at 22% 18%, rgba(107,31,40,0.32) 0%, rgba(107,31,40,0) 55%), #0a0a0a",
          color: "#f5f1e8",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 22,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(245,241,232,0.78)",
          }}
        >
          <span
            style={{
              width: 42,
              height: 2,
              background: "#6B1F28",
              display: "block",
            }}
          />
          <span>Cheatjob</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: 104,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span>Tu n&apos;auras pas ton stage</span>
            <span style={{ fontStyle: "italic", color: "#f5f1e8" }}>
              en postulant sur Indeed.
            </span>
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.45,
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              color: "rgba(245,241,232,0.72)",
              maxWidth: 820,
            }}
          >
            Le logiciel qui trouve l&apos;email du manager qui recrute et lui
            écrit à ta place.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 20,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            color: "rgba(245,241,232,0.55)",
            letterSpacing: "0.08em",
          }}
        >
          <span>cheatjob.fr</span>
          <span
            style={{
              padding: "10px 22px",
              border: "1px solid rgba(245,241,232,0.24)",
              borderRadius: 999,
              fontSize: 18,
            }}
          >
            29€ · Sprint 30 jours
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
