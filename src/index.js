import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import { ThemeProvider } from "./context/ThemeProvider";
import { AuthContextProvider } from "./context/AuthContext";
import { installDemoAxios, isDemoMode } from "./demo/demoApi";

const root = ReactDOM.createRoot(document.getElementById("root"));

if (process.env.REACT_APP_NODE_ENV === "production") {
  console.log = () => {};
}

const start = async () => {
  if (isDemoMode()) {
    await installDemoAxios();
  }

  root.render(
    <Router>
      <AuthContextProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthContextProvider>
    </Router>
  );
};

start();

reportWebVitals();
