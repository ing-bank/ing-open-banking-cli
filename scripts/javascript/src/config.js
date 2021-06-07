const { read } = require('./io');

/**
 * @param {string} root
 * @param {boolean} psd2
 * @return {{}}
 */
const getConfig = (root, psd2 = false) => {
  const { active } = parse(read(root, 'apps/active.env'));
  return parse(read(root, `apps/${active}/config${psd2 ? '-psd2' : '-premium'}.env`));
};

module.exports = { getConfig };

/**
 * @param {string} envFile
 * @return {{}}
 */
function parse(envFile) {
  return envFile
    .split('\n')
    .map(it => it.split('='))
    .filter(it => it[1] != null)
    .map(it => ({ [it[0]]: it[1] }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {});
}
