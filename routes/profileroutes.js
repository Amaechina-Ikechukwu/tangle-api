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
const {
  EmailVerification,
} = require("../controllers/Authentication/EmailVerification");
const profilerouter = express.Router();
const REDIRECT_URI = process.env.PROD_URL + `/profile/auth/google/callback`; // Adjust the URI
const path = require("path");
const { VerifyEmail } = require("../controllers/Profile/VerifyEmail");

profilerouter.use((req, res, next) => {
  const { redirectUri } = req.query;
  if (redirectUri) {
    req.redirectUri = redirectUri;
  }
  next();
});

profilerouter.post(
  "/verfiyemail",
  checkParametersMiddleware(["email"]),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      await EmailVerification({
        useremail: email,
      });
      res.status(200).json({ result: "verfied" });
    } catch (error) {
      next(error);
    }
  }
);
profilerouter.post(
  "/adduser",
  checkTokenMiddleware,
  checkParametersMiddleware([
    "username",
    "fullName",
    "age",
    "gender",
    "interest",
    "bio",
    "imageurl",
    "email",
  ]),
  async (req, res, next) => {
    try {
      const {
        username,
        fullName,
        age,
        gender,
        interest,
        bio,
        imageurl,
        email,
      } = req.body;

      await AddUserData({
        user: req.uid,
        username,
        fullName,
        age,
        gender,
        interest,
        bio,
        imageurl,
        email,
      });
      res.status(200).json({ result: "User added" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
profilerouter.get(
  "/iscomplete",
  checkTokenMiddleware,
  async (req, res, next) => {
    try {
      const result = await checkUserData(req.uid);
      res.status(200).json({ result });
    } catch (error) {
      next(error);
    }
  }
);
profilerouter.post(
  "/user",
  checkTokenMiddleware,
  checkParametersMiddleware(["user"]),
  async (req, res, next) => {
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
profilerouter.get("/confirmverification", async (req, res) => {
  try {
    const { user } = req.query;

    const imagePath = path.join(__dirname, "../images/logos/jt-logo.png");
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100 h-screen flex flex-col justify-center items-center">
    <img src='${imagePath}' />
      <button class="bg-[#f43f5e] hover:bg-[#f43f5e] text-[#f43f5e] font-bold py-2 px-4 rounded">
        <a href="#">Go to the app</a>
      </button>
      <script>
        const receiveMessage = (event) => {
          if (event.origin !== "${"your-redirect-uri"}") return;
          const token = event.data.token;
        
          window.close();
        };
        window.addEventListener("message", receiveMessage, false);
      </script>
    </body>
    </html>
  `;
    await VerifyEmail({ salt: user.split(" ").join("+") });
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ error });
  }
});
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
