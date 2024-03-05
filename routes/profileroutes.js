const express = require("express");
const { checkTokenMiddleware } = require("../utils/tokenmiddleware");
const {
  checkParametersMiddleware,
} = require("../utils/checkParametersMiddleware");
const { AddUserData } = require("../controllers/Profile/AddUserData");
const { InitializeDM } = require("../controllers/Chats/InitializeDM");
const { checkUserData } = require("../controllers/Profile/isProfileComplete");
const { GetUserData } = require("../controllers/Profile/GetUserData");
const { default: axios } = require("axios");
const profilerouter = express.Router();
const REDIRECT_URI = process.env.PROD_URL + `/profile/auth/google/callback`; // Adjust the URI
profilerouter.use((req, res, next) => {
  const { redirectUri } = req.query;
  if (redirectUri) {
    req.redirectUri = redirectUri;
  }
  next();
});
profilerouter.post(
  "/adduser",
  checkTokenMiddleware,
  checkParametersMiddleware(["nickname", "camp"]),
  async (req, res, next) => {
    try {
      const { nickname, camp } = req.body;
      await AddUserData({ user: req.uid, name: nickname, camp });
      res.status(200).json({ result: "User added" });
    } catch (error) {
      throw new Error(error);
    }
  }
);
profilerouter.get("/iscomplete", checkTokenMiddleware, async (req, res) => {
  try {
    const result = await checkUserData({ userId: req.uid });
    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
});
profilerouter.post(
  "/user",
  checkTokenMiddleware,
  checkParametersMiddleware(["user"]),
  async (req, res) => {
    try {
      const { user } = req.body;
      const result = await GetUserData({ user });
      res.status(200).json({ result: result.userData });
    } catch (error) {
      next(error);
    }
  }
);
profilerouter.post(
  "/initialdm",
  checkTokenMiddleware,
  checkParametersMiddleware(["friend"]),
  async (req, res, next) => {
    try {
      const { friend } = req.body;
      await InitializeDM({ user: req.uid, friend: friend });
      res.status(200).json({ result: "User added" });
    } catch (error) {
      throw new Error(error);
    }
  }
);
profilerouter.get("/auth/google", (req, res) => {
  const authEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = {
    client_id: process.env.CLIENTID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    include_granted_scopes: "true",
    state: `${req.redirectUri}`,
    expo: `${req.redirectUri}`,
  };

  const authUrl = `${authEndpoint}?${new URLSearchParams(params)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100 h-screen flex justify-center items-center">
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <a href="${authUrl}">Login with Google</a>
      </button>
      <script>
        const receiveMessage = (event) => {
          if (event.origin !== "${"your-redirect-uri"}") return;
          const token = event.data.token;
          console.log("Access token:", token);
          window.close();
        };
        window.addEventListener("message", receiveMessage, false);
      </script>
    </body>
    </html>
  `;

  res.send(html);
});

profilerouter.get("/auth/google/callback", async (req, res) => {
  const { code, state } = req.query;

  try {
    const tokenEndpoint = "https://www.googleapis.com/oauth2/v4/token";
    const tokenResponse = await axios.post(tokenEndpoint, null, {
      params: {
        code,
        client_id: process.env.CLIENTID,
        client_secret: process.env.CLIENTSECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      },
    });
    const { access_token, id_token } = tokenResponse.data;

    res.redirect(
      `${state}?access_token=${access_token}&id_token=${id_token}&code=${code}`
    );
  } catch (error) {
    // Handle errors
    console.error("Error during authentication:", error.message);
    res.status(500).send("Authentication error");
  }
});
profilerouter.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes
  res.status(500).json({ error: "Something went wrong" });
});
module.exports = { profilerouter };
