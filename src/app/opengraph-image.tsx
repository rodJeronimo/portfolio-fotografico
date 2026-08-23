import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OG image padrão — usada por rotas sem foto de capa própria (Sobre, Contato,
// Home sem projetos). Páginas de projeto sobrescrevem via generateMetadata
// (openGraph.images apontando para a foto de capa real).
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0b0a",
          color: "#f2f0ee",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Portfólio Fotográfico
        </div>
        <div style={{ fontSize: 28, color: "#a8a29e", marginTop: 16 }}>
          Paisagens · Macro · Vida Selvagem · Long Exposure
        </div>
      </div>
    ),
    { ...size },
  );
}
