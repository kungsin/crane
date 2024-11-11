// token的存删取

const TOKENKEY = 'userInfo';
function setUserInfo(info) {
  localStorage.setItem(TOKENKEY, info);
}
function getUserInfo() {
  return localStorage.getItem(TOKENKEY) ? localStorage.getItem(TOKENKEY) : null;
}
function removeUserInfo() {
  localStorage.removeItem(TOKENKEY);
}
export { setUserInfo, getUserInfo, removeUserInfo };
