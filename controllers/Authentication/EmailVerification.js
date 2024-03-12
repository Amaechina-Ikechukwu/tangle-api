const path = require("path");
const nodemailer = require("nodemailer");
const { GetUID, Record } = require("./Record");
const { StageOneEncryption } = require("./StageOneEncryption");
const { EncryptUser } = require("./StageTwoEncryption");
const { v4: uuidv4 } = require("uuid");
// Create a transporter object using SMTP transport
let transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "ivory89@ethereal.email",
    pass: "yY1rHJyMkBMaEgMByD",
  },
});
const imagePath = path.join(__dirname, "../../images/logos/jt-logo.png");

const EmailVerification = async ({ useremail }) => {
  const userid = await GetUID({ useremail });
  const salt = await StageOneEncryption({ userid });
  await Record({ user: userid, salt: salt });
  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      /* Add your CSS styles here */
      body {
        background-color: #f3f4f6;
        height: 100vh;
        display: flex;
        flex-direction:column;
        justify-content: center;
        align-items: center;
        gap: 20px;
      }
      .image {
        width: 40%;
      }
      h3 {
        font-size: 1.5rem;
        text-align:center
      }
      .button {
        width: 70%;
        padding: 1rem;
        background-color: #f43f5e;
        color: white;
        border-radius: 0.375rem;
        border: none;
        cursor: pointer;
      }
      .link {
        margin-top: 50px;
      display:flex;
      align-items:center
      }
      span{
        color: #f43f5e;
      }
      .buttonlink{
        text-decoration:none;
        color:inherit
      }

    </style>
  </head>
  <body>
    <img src='cid:logo' class='image' />
    <h3>Welcome to Just Tangle,<span> ${useremail}</span>, Please click the link to be verified on our platform</h3>
    <button class='button'><a class='buttonlink' href="http://localhost:3006/profile/confirmverification?user=${salt}">Verify Email</a></button>
    <div class='link'>
      <p>If link didn't open, click: </p>
      <a  href="http://localhost:3006/profile/confirmverification?user=${salt}">http://localhost:3006/profile/confirmverification?user=${salt}</a>
    </div>
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

  try {
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Tangle"',
      to: useremail,
      subject: "Tangle Account Verification",
      html: htmlContent,
      attachments: [
        {
          filename: "jt-logo.png",
          path: imagePath, // Path to your image file
          cid: "logo", // Use this CID value in the src attribute of the <img> tag
        },
      ],
    });

    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
module.exports = { EmailVerification };
