import { CssVarsProvider } from "@mui/joy/styles";
import { ReactFlowProvider } from "@xyflow/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { RecoilRoot } from "recoil";
import colors from "tailwindcss/colors";
import App from "./App.tsx";

import "@fontsource-variable/jetbrains-mono/index.css";
import "@fontsource/inter/index.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CssVarsProvider defaultMode="dark">
      <RecoilRoot>
        <ReactFlowProvider>
          <App />
        </ReactFlowProvider>
        <Toaster
          toastOptions={{
            className: "!bg-zinc-800 !text-white",
            style: {
              fontFamily: "Inter",
              border: "1px solid " + colors.zinc[700],
            },
          }}
        />
      </RecoilRoot>
    </CssVarsProvider>
  </StrictMode>
);
