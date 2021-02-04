/**
 * @typedef {{data: TokenResponse}} Response
 * @typedef {{
 *   access_token: string,
 *   expires_in: number,
 *   scope: string,
 *   token_type: string,
 *   keys: Array,
 *   client_id: string
 * }} TokenResponse
 * @typedef {{access_token: string, scope: string, client_id: string}} Token
 **/

/**
 * @param {Response} res
 * @return {TokenResponse}
 **/
const getData = ({ data }) => data;

/**
 * @param {TokenResponse} token
 * @return {Token}
 **/
const getToken = ({ access_token, scope, client_id }) => ({ access_token, scope, client_id });

/**
 * @param {object} obj
 * @return {string}
 **/
const stringify = obj => JSON.stringify(obj, null, 4);

module.exports = {
  getData,
  getToken,
  stringify,
};
