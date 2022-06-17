function verify(link) {
  return `
<table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0">
  <tr>
    <td style="color: #424242">This is an auto-sent message. Please do not reply to it.</td>
  </tr>
  <tr>
    <td>You have successfully signed up for Frontend Studies!</td>
  </tr>
  <tr>
    <td>Follow this link to verify your account and finish registration:</td>
  </tr>
  <tr>
    <td><a 
    href=${link} 
    style="font: 14px Arial, sans-serif; color: blue; line-height: 30px; -webkit-text-size-adjust: none; display: block;" target="_blank"
    >${link}</a></td>
  </tr>
</table>`;
}

module.exports = {
  verify
};
