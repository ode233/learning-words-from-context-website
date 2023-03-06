import { CaiyunTranslator, Translator, YoudaoFreeTranslator } from '../localVideoPlayer/translate/translator';

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

// init user config
let translator: Translator<any>;
let userConfig = getUserConfig();
if (userConfig.caiyunToken) {
    translator = new CaiyunTranslator({ token: userConfig.caiyunToken });
} else {
    translator = new YoudaoFreeTranslator();
}

export { translator };
