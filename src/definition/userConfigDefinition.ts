class UserConfig {
    public caiyunToken = '';
}

/**
 * get user config
 * @returns {UserConfig}
 */
function getUserConfig() {
    const config = localStorage.getItem('userConfig');
    if (config) {
        return JSON.parse(config) as UserConfig;
    }
    return new UserConfig();
}

/**
 * set user config
 * @param {UserConfig} config
 * @returns {void}
 */
function setUserConfig(config: UserConfig) {
    localStorage.setItem('userConfig', JSON.stringify(config));
}

export { UserConfig, getUserConfig, setUserConfig };
