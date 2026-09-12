/** Portfolio demo: static JSON instead of live API/DB. */

export const isDemoMode = () =>
  String(process.env.REACT_APP_DEMO_MODE || "").toLowerCase() === "true";

export const DEMO_USERNAME = "demo";
export const DEMO_PASSWORD = "demo123";

const PASSWORD_PERMISSIONS = new Set([
  "password",
  "view_password_entry",
  "create_password_entry",
  "edit_password_entry",
  "view_password_entry_detail",
  "delete_password_entry",
]);

export const isDemoPasswordPermission = (permission) =>
  PASSWORD_PERMISSIONS.has(permission);

export const DEMO_PERMISSIONS = [
  "logout",
  "user_profile",
  "account",
  "home",
  "setting",
  "settings",
  "change_password",
  "forgot_password",
  "atm",
  "create_terminal",
  "view_terminal",
  "edit_terminal",
  "view_terminal_detail",
  "view_relocated_terminal",
  "generate_terminal_config",
  "create_branch",
  "view_branch",
  "create_port",
  "view_port",
  "create_district",
  "view_district",
  "create_command",
  "view_command",
  "pos",
  "create_pos",
  "view_pos",
  "edit_pos",
  "view_pos_detail",
  "view_relocated_pos",
  "mas_config",
  "view_device",
  "generate_pos_config",
  "request_pos_termination",
  "view_request",
  "request",
  "request_pos",
  "view_new_pos_request",
  "view_request_detail",
  "edit_request",
  "approve_pos",
  "delete_request",
  "send_request",
  "view_authorized_request",
  "view_relocation_request",
  "view_request_status",
  "view_rejected_request",
  "view_deleted_request",
  "bulk_request",
  "create_cybersource_terminal",
  "view_cybersource_terminal",
  "view_cybersource_terminal_detail",
  "edit_cybersource_terminal",
  "view_deactivated_cybersource_terminal",
  "administration",
  "create_user",
  "manage_user",
  "unlock_account",
  "reset_password",
  "delete_user",
  "view_feedback",
  "view_bug",
  "analytics",
  "activity_log",
  "view_system_manual",
  "manual",
  "view_atm_creation_manual",
  "view_pos_creation_manual",
  "view_cbs_account_link_manual",
  "view_merchant_guide",
  "view_branch_guide",
];

const PATH_TO_FILE = {
  "/terminal/getTerminalCounts": "/demo/terminal-counts.json",
  "/terminal/getTerminal": "/demo/terminals.json",
  "/terminal/getAllTerminal": "/demo/terminals.json",
  "/terminal/getRelocatedTerminal": "/demo/terminals.json",
  "/terminal/getSiteCounts": "/demo/site-counts.json",
  "/terminal/getTerminalDataPerDistrict": "/demo/district-terminals.json",
  "/pos/getPOSCountPerDistrict": "/demo/pos-district.json",
  "/pos/getPOSCountPerBranch": "/demo/pos-branch.json",
  "/pos/getPos": "/demo/pos-terminals.json",
  "/pos/getRelocatedPos": "/demo/pos-terminals.json",
  "/pos/getRelocationRequests": "/demo/pos-terminals.json",
  "/pos/getDailyReport": "/demo/pos-daily.json",
  "/pos/getWeeklyReport": "/demo/pos-weekly.json",
  "/pos/getMonthlyReport": "/demo/pos-monthly.json",
  "/ping/getPings": "/demo/pings.json",
  "/request/getNewRequest": "/demo/new-requests.json",
  "/request/getSavedRequest": "/demo/new-requests.json",
  "/request/getAuthorizedRequest": "/demo/authorized-requests.json",
  "/request/getRequest": "/demo/authorized-requests.json",
  "/request/getRejectedRequest": "/demo/new-requests.json",
  "/request/getDeletedRequest": "/demo/new-requests.json",
  "/district/getDistrict": "/demo/districts.json",
  "/branch/getBranch": "/demo/branches.json",
  "/port/getports": "/demo/ports.json",
  "/port/getAssignedPorts": "/demo/ports.json",
  "/port/getPortName": "/demo/ports.json",
  "/auth/getUser": "/demo/users.json",
  "/auth/getUserProfile": "/demo/user-profile.json",
  "/auth/getAuthorizingUser": "/demo/users.json",
  "/command/getCommand": "/demo/commands.json",
  "/device/getDevice": "/demo/devices.json",
  "/cybersource/getCybersourceTerminal": "/demo/cybersource.json",
  "/cybersource/getDeactivatedCybersourceTerminal": "/demo/cybersource.json",
  "/feedback/getFeedbacks": "/demo/feedback.json",
  "/feedback/getBugs": "/demo/bugs.json",
  "/log/getactivity": "/demo/activity-logs.json",
};

const toBase64Url = (obj) => {
  const json = JSON.stringify(obj);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

export const createDemoToken = () => {
  const header = toBase64Url({ alg: "none", typ: "JWT" });
  const user = {
    _id: "demo-user-1",
    id: "demo-user-1",
    firstName: "Demo",
    fatherName: "User",
    username: DEMO_USERNAME,
    role: "admin",
    status: "Active",
  };
  const payload = toBase64Url({
    user,
    role: user.role,
    permissions: DEMO_PERMISSIONS,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    iat: Math.floor(Date.now() / 1000),
  });
  return `${header}.${payload}.demo`;
};

export const demoLogin = async (username, password) => {
  await new Promise((r) => setTimeout(r, 250));
  if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
    const err = new Error("Invalid demo credentials. Use demo / demo123");
    err.response = { data: { message: err.message } };
    throw err;
  }
  return { token: createDemoToken(), message: "Demo login ok" };
};

const normalizePath = (urlOrPath) => {
  if (!urlOrPath) return "";
  try {
    if (urlOrPath.startsWith("http")) {
      const u = new URL(urlOrPath);
      return (u.pathname.replace(/\/+$/, "") || "/") + (u.search || "");
    }
  } catch {
    /* ignore */
  }
  const [pathOnly] = String(urlOrPath).split("?");
  return pathOnly.startsWith("/") ? pathOnly.replace(/\/+$/, "") || "/" : `/${pathOnly}`;
};

const stripApiHost = (urlOrPath) => {
  const path = normalizePath(urlOrPath).split("?")[0];
  const markers = [
    "/terminal/",
    "/pos/",
    "/ping/",
    "/request/",
    "/auth/",
    "/district/",
    "/branch/",
    "/port/",
    "/command/",
    "/device/",
    "/cybersource/",
    "/feedback/",
    "/password/",
    "/log/",
  ];
  for (const m of markers) {
    const i = path.indexOf(m);
    if (i >= 0) return path.slice(i);
  }
  return path;
};

const fallbackPayload = (path) => {
  const mapped = {
    getDistrict: { status: "true", alldistricts: [] },
    getBranch: { status: "true", branches: [] },
    getUser: { status: "true", users: [] },
    getUserProfile: {
      status: "true",
      user: {
        firstName: "Demo",
        fatherName: "User",
        username: DEMO_USERNAME,
        gender: "MALE",
      },
    },
    getports: { status: "true", ports: [] },
    getAssignedPorts: { status: "true", availablePorts: [], ports: [] },
    getPortName: { status: "true", ports: [] },
    getCommand: { status: "true", commands: [] },
    getDevice: { status: "true", devices: [] },
    getCybersourceTerminal: { status: "true", cybersourceTerminals: [] },
    getDeactivatedCybersourceTerminal: { status: "true", cybersourceTerminals: [] },
    getFeedbacks: { status: "true", feedback: [] },
    getBugs: { status: "true", bug: [] },
    getRelocatedTerminal: { status: "true", terminals: [], role: "admin" },
    getRelocatedPos: { status: "true", posTerminals: [], role: "admin" },
    getRelocationRequests: { status: "true", posTerminals: [], role: "admin" },
    getSavedRequest: { status: "true", newRequests: [], role: "admin" },
    getAuthorizedRequest: { status: "true", requests: [], role: "admin" },
    getRejectedRequest: { status: "true", newRequests: [], role: "admin" },
    getDeletedRequest: { status: "true", requests: [], role: "admin" },
    getRequest: { status: "true", requests: [], role: "admin" },
    getAuthorizingUser: { status: "true", users: [] },
  };
  const key = Object.keys(mapped).find((k) => path.includes(k));
  if (key) return mapped[key];
  return { status: "true", message: "Demo mode" };
};

export const demoGet = async (urlOrPath) => {
  const path = stripApiHost(urlOrPath);
  const file = PATH_TO_FILE[path];
  if (file) {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Demo fixture missing: ${file}`);
    const data = await res.json();
    const demoUser = { firstName: "Demo", fatherName: "User" };
    const withCreator = (item) =>
      item && typeof item === "object"
        ? { ...item, createdBy: item.createdBy || demoUser }
        : item;
    ["terminals", "posTerminals", "newRequests", "requests"].forEach((key) => {
      if (Array.isArray(data[key])) data[key] = data[key].map(withCreator);
    });
    return { data };
  }
  return { data: fallbackPayload(path) };
};

export const apiGet = async (url, config) => {
  if (isDemoMode()) {
    return demoGet(url);
  }
  const axios = (await import("axios")).default;
  return axios.get(url, config);
};

const demoAdapter = async (config) => {
  const method = (config.method || "get").toLowerCase();
  const path = stripApiHost(config.url);

  if (method === "get") {
    const { data } = await demoGet(config.url);
    return {
      data,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      config,
      request: {},
    };
  }

  if (path.includes("/auth/loginUser")) {
    return {
      data: { message: "Use demo login" },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config,
      request: {},
    };
  }

  const body = config.data
    ? typeof config.data === "string"
      ? (() => {
          try {
            return JSON.parse(config.data);
          } catch {
            return {};
          }
        })()
      : config.data
    : {};

  const demoUser = {
    firstName: "Demo",
    fatherName: "User",
    username: DEMO_USERNAME,
  };
  const echoed = {
    ...body,
    createdBy: body.createdBy || demoUser,
    updatedAt: new Date().toISOString(),
    createdAt: body.createdAt || new Date().toISOString(),
  };

  const data = {
    status: "true",
    message: "Demo mode — writes are disabled",
    terminal: echoed,
    pos: echoed,
    request: echoed,
    user: echoed,
  };

  return {
    data,
    status: 200,
    statusText: "OK",
    headers: { "content-type": "application/json" },
    config,
    request: {},
  };
};

export const installDemoAxios = async () => {
  if (!isDemoMode()) return;
  const axios = (await import("axios")).default;
  axios.defaults.adapter = demoAdapter;
};
