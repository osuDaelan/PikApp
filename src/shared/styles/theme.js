// Shared palette and surfaces. Feature-specific layout stays with each feature.
export const colors = {
  green: "#4caf78", pink: "#e879b0", orange: "#f5a623",
  darkGreen: "#2d6e2d", coin: "#d4a017",
};
export const cardStyle = {
  background: "#fff", borderRadius: 18, padding: 16,
  boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
};
export const scrollPaneStyle = {
  flex: 1, minWidth: 0, minHeight: 0, overflowY: "auto", overflowX: "hidden",
  scrollbarGutter: "stable", paddingRight: 8, boxSizing: "border-box",
};
export const appStyle = {
  minHeight: "100vh", width: "100%",
  background: "linear-gradient(160deg,#c8f0a8 0%,#7dc87b 50%,#4a9e48 100%)",
  fontFamily: "'Nunito','Trebuchet MS',sans-serif",
};
