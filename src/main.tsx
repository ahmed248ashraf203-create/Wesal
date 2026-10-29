import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Restore the saved theme before React paints the app, so dark mode also
// applies on routes without the Navbar (for example Login and Signup).
try {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
} catch {
  // If storage is unavailable, the app safely starts in light mode.
}

createRoot(document.getElementById("root")!).render(<App />);
