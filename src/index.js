import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import { ThemeProvider } from "./context/ThemeProvider";
import { AuthContextProvider } from "./context/AuthContext";
import demoTheme from "./DarkMode/customTheme";
import customTheme from "./DarkMode/customTheme";
import { darkTheme } from "./context/Themes";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <AuthContextProvider>
      <ThemeProvider theme={customTheme}>
        <App />
      </ThemeProvider>
    </AuthContextProvider>
  </Router>
  //  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
